import { PrismaService } from "@libs/database";
import { Injectable } from "@nestjs/common";
import { url } from "inspector";

type SatcatRecord = {
  OBJECT_NAME?: string;
  OBJECT_TYPE?: string;
  OWNER?: string;
};

type SatcatDto = {
  OBJECT_NAME: string;
  OBJECT_ID: string;
  NORAD_CAT_ID: number;
  OBJECT_TYPE: string;
  OPS_STATUS_CODE: string;
  OWNER: string;
  LAUNCH_DATE: string;
  LAUNCH_SITE: string;
  DECAY_DATE: string;
  PERIOD: number;
  INCLINATION: number;
  APOGEE: number;
  PERIGEE: number;
  RCS: number | null;
  DATA_STATUS_CODE: string;
  ORBIT_CENTER: string;
  ORBIT_TYPE: string;
};

export type SatelliteEnrichment = {
  operator: string | null;
  country: string | null;
  purpose: string | null;
  groupName: string | null;
  resolvedName: string | null;
};

@Injectable()
export class SatelliteCatalogService {
  constructor(private readonly prisma: PrismaService) {}
  private ownerCodeMapPromise?: Promise<Map<string, string>>;
  private readonly satcatCache = new Map<number, Promise<SatcatRecord | null>>();
  private readonly enrichmentCache = new Map<string, Promise<SatelliteEnrichment>>();

  async enrichSatellite(noradId: number, tleName?: string): Promise<SatelliteEnrichment> {
    const cacheKey = `${noradId}:${tleName?.trim() ?? ""}`;
    const cached = this.enrichmentCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const enrichmentPromise = this.loadEnrichment(noradId, tleName?.trim());
    this.enrichmentCache.set(cacheKey, enrichmentPromise);
    return enrichmentPromise;
  }

  private async loadEnrichment(noradId: number, tleName?: string): Promise<SatelliteEnrichment> {
    const satcatRecord = await this.fetchSatcatRecord(noradId);
    const ownerDescription = satcatRecord?.OWNER
      ? await this.resolveOwnerDescription(satcatRecord.OWNER)
      : null;
    const resolvedName = satcatRecord?.OBJECT_NAME?.trim() || tleName || null;
    const groupName = this.extractGroupName(resolvedName);

    return {
      operator: ownerDescription,
      country: ownerDescription,
      purpose: this.inferPurpose({
        objectName: resolvedName,
        objectType: satcatRecord?.OBJECT_TYPE,
        groupName
      }),
      groupName,
      resolvedName
    };
  }

  private async fetchSatcatRecord(noradId: number): Promise<SatcatRecord | null> {
    const cached = this.satcatCache.get(noradId);
    if (cached) {
      return cached;
    }

    const satcat = await this.prisma.satcat.findUnique({
      where: { noradCatId: noradId }
    });

    if (satcat) {
      const satcatPeomise = Promise.resolve({
        OBJECT_NAME: satcat.objectName,
        OBJECT_TYPE: satcat.objectType
      });
      this.satcatCache.set(noradId, satcatPeomise);
      return satcatPeomise;
    }

    const recordPromise = this.withRetry(async () => {
      const response = await fetch(
        `https://celestrak.org/satcat/records.php?CATNR=${noradId}&FORMAT=JSON`,
        {
          signal: AbortSignal.timeout(5000)
        }
      );

      if (!response.ok) {
        throw new Error(`SATCAT request failed with status ${response.status}`);
      }

      const payload = await this.safeJsonArray(response);

      console.log(payload);
      return (payload[0] as SatcatRecord | undefined) ?? null;
    });

    this.satcatCache.set(noradId, recordPromise);
    return recordPromise;
  }

  async parsSatcatRecord(limit: number, offset: number) {
    for (let i = offset; i < offset + limit; i++) {
      const url = `https://celestrak.org/satcat/records.php?CATNR=${i}&FORMAT=JSON`;
      console.log(url);

      const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
      if (!response.ok) {
        continue;
      }

      const rows = await this.safeJsonArray(response);
      console.log(rows);
      const row = rows[0] as SatcatDto | undefined;
      if (!row?.NORAD_CAT_ID) {
        continue;
      }

      const exists = await this.prisma.satcat.findUnique({
        where: { noradCatId: row.NORAD_CAT_ID }
      });
      if (exists) {
        continue;
      }

      await this.prisma.satcat.create({
        data: {
          noradCatId: row.NORAD_CAT_ID,
          objectName: String(row.OBJECT_NAME),
          objectId: String(row.OBJECT_ID),
          objectType: String(row.OBJECT_TYPE),
          opsStatusCode: String(row.OPS_STATUS_CODE),
          owner: String(row.OWNER),
          launchDate: String(row.LAUNCH_DATE),
          launchSite: String(row.LAUNCH_SITE),
          decayDate: String(row.DECAY_DATE),
          period: Number(row.PERIOD) || 0,
          inclination: Number(row.INCLINATION) || 0,
          apogee: Number(row.APOGEE) || 0,
          perigee: Number(row.PERIGEE) || 0,
          rcs: row.RCS == null ? null : Number(row.RCS),
          dataStatusCode: String(row.DATA_STATUS_CODE),
          orbitCenter: String(row.ORBIT_CENTER),
          orbitType: String(row.ORBIT_TYPE)
        }
      });
    }

    return { success: true };
  }

  /** Тело ответа не всегда JSON — `response.json()` падает. */
  private async safeJsonArray(response: Response): Promise<unknown[]> {
    try {
      const data = JSON.parse(await response.text());
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }

  private async resolveOwnerDescription(ownerCode: string): Promise<string | null> {
    const code = ownerCode.trim().toUpperCase();

    if (!code) {
      return null;
    }

    const ownerMap = await this.getOwnerCodeMap();
    return ownerMap.get(code) ?? code;
  }

  private async getOwnerCodeMap(): Promise<Map<string, string>> {
    if (!this.ownerCodeMapPromise) {
      this.ownerCodeMapPromise = this.loadOwnerCodeMap();
    }

    return this.ownerCodeMapPromise;
  }

  private async loadOwnerCodeMap(): Promise<Map<string, string>> {
    return this.withRetry(async () => {
      const response = await fetch("https://celestrak.org/satcat/sources.php", {
        signal: AbortSignal.timeout(5000)
      });

      if (!response.ok) {
        throw new Error(`Owner sources request failed with status ${response.status}`);
      }

      const html = await response.text();
      const rowPattern = /<tr>\s*<td>([^<]+)<\/td>\s*<td>([\s\S]*?)<\/td>\s*<\/tr>/gi;
      const tagPattern = /<[^>]+>/g;
      const result = new Map<string, string>();

      for (const match of html.matchAll(rowPattern)) {
        const code = match[1]?.trim().toUpperCase();
        const description = match[2]
          ?.replace(tagPattern, " ")
          .replace(/&nbsp;/g, " ")
          .replace(/\s+/g, " ")
          .trim();

        if (code && description) {
          result.set(code, description);
        }
      }

      return result;
    });
  }

  private extractGroupName(objectName: string | null): string | null {
    if (!objectName) {
      return null;
    }

    const normalized = objectName.trim().toUpperCase();
    const knownGroups = [
      "STARLINK",
      "ONEWEB",
      "IRIDIUM",
      "GLOBALSTAR",
      "ORBCOMM",
      "INTELSAT",
      "SES",
      "O3B",
      "GALILEO",
      "GLONASS",
      "GPS",
      "NAVSTAR",
      "BEIDOU",
      "QZSS",
      "IRNSS",
      "GOES",
      "NOAA",
      "METEOR",
      "YAOGAN",
      "KUIPER",
      "QIANFAN"
    ];

    const matchedGroup = knownGroups.find((group) => normalized.startsWith(group));
    if (matchedGroup) {
      return matchedGroup;
    }

    const genericPrefix = normalized.match(/^[A-Z0-9]+(?:[- ][A-Z0-9]+)?/);
    if (!genericPrefix) {
      return null;
    }

    return genericPrefix[0].replace(/[- ]?\d+[A-Z]*$/, "").trim() || null;
  }

  private inferPurpose({
    objectName,
    objectType,
    groupName
  }: {
    objectName: string | null;
    objectType?: string;
    groupName: string | null;
  }): string | null {
    const normalizedName = objectName?.toUpperCase() ?? "";
    const normalizedType = objectType?.toUpperCase() ?? "";
    const normalizedGroup = groupName?.toUpperCase() ?? "";

    if (normalizedType === "R/B") {
      return "Rocket Body";
    }

    if (normalizedType === "DEB") {
      return "Debris";
    }

    if (
      [
        "STARLINK",
        "ONEWEB",
        "IRIDIUM",
        "GLOBALSTAR",
        "ORBCOMM",
        "INTELSAT",
        "SES",
        "O3B",
        "KUIPER",
        "QIANFAN"
      ].includes(normalizedGroup)
    ) {
      return "Communications";
    }

    if (
      ["GPS", "NAVSTAR", "GALILEO", "GLONASS", "BEIDOU", "QZSS", "IRNSS"].includes(normalizedGroup)
    ) {
      return "Navigation";
    }

    if (
      ["GOES", "NOAA", "METEOR"].includes(normalizedGroup) ||
      /WEATHER|METEO/.test(normalizedName)
    ) {
      return "Weather";
    }

    if (/EARTH|RESOURCE|RADAR|SAR|YAOGAN/.test(normalizedName)) {
      return "Earth Observation";
    }

    if (/SCIENCE|HUBBLE|JWST|TELESCOPE|OBSERVATORY/.test(normalizedName)) {
      return "Science";
    }

    return normalizedType === "PAY" ? "Payload" : null;
  }

  private async withRetry<T>(operation: () => Promise<T>, retries = 2, delayMs = 300): Promise<T> {
    let lastError: unknown;

    for (let attempt = 0; attempt <= retries; attempt += 1) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        if (attempt === retries) {
          break;
        }
        await this.sleep(delayMs * (attempt + 1));
      }
    }

    throw lastError;
  }

  private async sleep(delayMs: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
}
