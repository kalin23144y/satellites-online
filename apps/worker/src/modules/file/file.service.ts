import { PrismaService } from "@libs/database";
import { MinioKeys, MinioService } from "@libs/minio";
import { Injectable } from "@nestjs/common";
import type { Readable } from "node:stream";
import { SatelliteCatalogService, type SatelliteEnrichment } from "./satellite-catalog.service";
import { Country } from "node_modules/@libs/database/src/generated/prisma/client";

type ParsedTleRecord = {
  name: string;
  noradId: number;
  line1: string;
  line2: string;
  epoch: Date | null;
  inclination: number | null;
  periodMin: number | null;
  altitudeKm: number | null;
  orbitClass: string | null;
  operator: string | null;
  country: string | null;
  purpose: string | null;
  groupName: string | null;
};

@Injectable()
export class FileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly minio: MinioService,
    private readonly satelliteCatalogService: SatelliteCatalogService
  ) {}

  async parseFile(fileId: string) {
    const file = await this.prisma.file.findUnique({
      where: { id: fileId },
      select: { id: true }
    });

    if (!file) {
      throw new Error(`File with id "${fileId}" not found`);
    }

    const objectStream = await this.minio.getObject(MinioKeys.tle, `${fileId}.txt`);
    const fileContent = await this.streamToString(objectStream);
    const tleRecords = await this.parseTleContent(fileContent);

    await this.prisma.tleRecord.deleteMany({
      where: {
        source: fileId
      }
    });

    for (const record of tleRecords) {
      let country: Country | null = null;
      if (record.country) {
        const countryName = record.country?.trim();
          country = await this.prisma.country.findFirst({
          where: {
            code: countryName
          }
        });

        if (!country) {
          country = await this.prisma.country.create({
            data: {
              name: countryName,
              code: countryName,
              color: "#000000"
            }
          });
        }
      }

      const satellite = await this.prisma.satellite.upsert({
        where: {
          noradId: record.noradId
        },
        create: {
          noradId: record.noradId,
          name: record.name,
          operator: record.operator,
          countryId: country && country.id ? country.id : undefined,
          purpose: record.purpose,
          groupName: record.groupName,
          inclination: record.inclination,
          periodMin: record.periodMin,
          altitudeKm: record.altitudeKm,
          orbitClass: record.orbitClass,
          fileId
        },
        update: {
          name: record.name,
          operator: record.operator,
          countryId: country && country.id ? country.id : undefined,
          purpose: record.purpose,
          groupName: record.groupName,
          inclination: record.inclination,
          periodMin: record.periodMin,
          altitudeKm: record.altitudeKm,
          orbitClass: record.orbitClass,
          fileId
        },
        select: {
          id: true
        }
      });

      await this.prisma.tleRecord.create({
        data: {
          satelliteId: satellite.id,
          line1: record.line1,
          line2: record.line2,
          epoch: record.epoch,
          source: fileId
        }
      });
    }

    return {
      fileId,
      parsedCount: tleRecords.length
    };
  }

  private async parseTleContent(content: string): Promise<ParsedTleRecord[]> {
    const lines = content
      .split(/\r?\n/)
      .map((line) => line.trimEnd())
      .filter((line) => line.trim().length > 0);

    const records: ParsedTleRecord[] = [];

    for (let index = 0; index < lines.length; ) {
      let name: string | undefined;
      let line1: string | undefined;
      let line2: string | undefined;

      if (lines[index]?.startsWith("1 ")) {
        line1 = lines[index];
        line2 = lines[index + 1];
        index += 2;
      } else {
        name = lines[index];
        line1 = lines[index + 1];
        line2 = lines[index + 2];
        index += 3;
      }

      if (!line1?.startsWith("1 ") || !line2?.startsWith("2 ")) {
        throw new Error("Invalid TLE file format");
      }

      const noradId = this.parseNoradId(line1, line2);
      const enrichment = await this.satelliteCatalogService.enrichSatellite(noradId, name?.trim());
      const inclination = this.parseInclination(line2);
      const periodMin = this.parsePeriodMin(line2);
      const altitudeKm = this.parseAltitudeKm(periodMin);
      records.push({
        name: enrichment.resolvedName || name?.trim() || `SAT-${noradId}`,
        noradId,
        line1,
        line2,
        epoch: this.parseEpoch(line1),
        inclination,
        periodMin,
        altitudeKm,
        orbitClass: this.resolveOrbitClass(periodMin),
        operator: enrichment.operator,
        country: enrichment.country,
        purpose: enrichment.purpose,
        groupName: enrichment.groupName
      });
    }

    if (records.length === 0) {
      throw new Error("TLE file is empty");
    }

    return records;
  }

  private parseNoradId(line1: string, line2: string): number {
    const rawNoradId = line1.slice(2, 7).trim() || line2.slice(2, 7).trim();
    const noradId = Number.parseInt(rawNoradId, 10);

    if (!Number.isInteger(noradId)) {
      throw new Error(`Invalid NORAD id in TLE: "${rawNoradId}"`);
    }

    return noradId;
  }

  private parseEpoch(line1: string): Date | null {
    const rawYear = line1.slice(18, 20).trim();
    const rawDay = line1.slice(20, 32).trim();
    const year = Number.parseInt(rawYear, 10);
    const dayOfYear = Number.parseFloat(rawDay);

    if (!Number.isInteger(year) || !Number.isFinite(dayOfYear)) {
      return null;
    }

    const fullYear = year < 57 ? 2000 + year : 1900 + year;
    const dayStart = new Date(Date.UTC(fullYear, 0, 1));
    const wholeDays = Math.floor(dayOfYear) - 1;
    const fractionalDay = dayOfYear - Math.floor(dayOfYear);

    dayStart.setUTCDate(dayStart.getUTCDate() + wholeDays);
    dayStart.setTime(dayStart.getTime() + fractionalDay * 24 * 60 * 60 * 1000);

    return dayStart;
  }

  private parseInclination(line2: string): number | null {
    const rawInclination = line2.slice(8, 16).trim();
    const inclination = Number.parseFloat(rawInclination);

    return Number.isFinite(inclination) ? inclination : null;
  }

  private parsePeriodMin(line2: string): number | null {
    const rawMeanMotion = line2.slice(52, 63).trim();
    const meanMotion = Number.parseFloat(rawMeanMotion);

    if (!Number.isFinite(meanMotion) || meanMotion <= 0) {
      return null;
    }

    return 1440 / meanMotion;
  }

  private parseAltitudeKm(periodMin: number | null): number | null {
    if (!periodMin || periodMin <= 0) {
      return null;
    }

    const earthRadiusKm = 6378.137;
    const earthMu = 398600.4418;
    const periodSeconds = periodMin * 60;
    const semiMajorAxisKm = Math.cbrt(earthMu * Math.pow(periodSeconds / (2 * Math.PI), 2));

    return semiMajorAxisKm - earthRadiusKm;
  }

  private resolveOrbitClass(periodMin: number | null): string | null {
    if (!periodMin || periodMin <= 0) {
      return null;
    }

    if (periodMin < 128) {
      return "LEO";
    }

    if (Math.abs(periodMin - 1436) <= 30) {
      return "GEO";
    }

    if (periodMin < 1440) {
      return "MEO";
    }

    return "HEO";
  }

  private async streamToString(stream: Readable): Promise<string> {
    const chunks: Buffer[] = [];

    for await (const chunk of stream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }

    return Buffer.concat(chunks).toString("utf-8");
  }
}
