import { PrismaService } from "@libs/database";
import { Injectable, NotFoundException } from "@nestjs/common";
import { GetSatelliteResponseDto, GetSatellitesResponseDto, SatelliteDto } from "./dto/response";
import { SatelliteFiltersDto } from "src/common/dto/satellite-filters.dto";

@Injectable()
export class SatelliteService {
  constructor(private readonly prisma: PrismaService) {}

  async getDemoSatellites(filters: SatelliteFiltersDto): Promise<GetSatellitesResponseDto> {
    const satellites = await this.prisma.satellite.findMany({
      where: this.buildSatelliteWhere(filters, true),
      include: {
        country: {
          select: {
            name: true,
            code: true
          }
        }
      },
      orderBy: [{ updatedAt: "desc" }, { id: "asc" }],
      take: 100
    });

    return {
      data: satellites.map((satellite) => this.mapSatelliteToDto(satellite))
    };
  }

  async getUserSatellites(
    userId: string,
    filters: SatelliteFiltersDto
  ): Promise<GetSatellitesResponseDto> {
    const satellites = await this.prisma.satellite.findMany({
      where: this.buildSatelliteWhere(filters, true, userId),
      include: {
        country: {
          select: {
            name: true,
            code: true
          }
        }
      },
      orderBy: [{ updatedAt: "desc" }, { id: "asc" }]
    });

    return {
      data: satellites.map((satellite) => this.mapSatelliteToDto(satellite))
    };
  }

  async getDemoSatelliteById(id: string): Promise<GetSatelliteResponseDto> {
    const satellite = await this.prisma.satellite.findUnique({
      where: {
        id
      },
      include: {
        country: {
          select: {
            name: true,
            code: true
          }
        }
      }
    });

    if (!satellite) {
      throw new NotFoundException("Satellite not found");
    }

    return {
      data: this.mapSatelliteToDto(satellite)
    };
  }

  async getUserSatelliteById(id: string, userId: string): Promise<GetSatelliteResponseDto> {
    const satellite = await this.prisma.satellite.findFirst({
      where: {
        id,
        file: {
          userId
        }
      },
      include: {
        country: {
          select: {
            name: true,
            code: true
          }
        }
      }
    });

    if (!satellite) {
      throw new NotFoundException("Satellite not found");
    }

    return {
      data: this.mapSatelliteToDto(satellite)
    };
  }

  private toDateString(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  private calculateSpeedKms(altitudeKm: number | null): number {
    if (!altitudeKm || altitudeKm <= 0) {
      return 0;
    }

    const earthRadiusKm = 6378.137;
    const earthMu = 398600.4418;
    const orbitalRadiusKm = earthRadiusKm + altitudeKm;

    return Number.parseFloat(Math.sqrt(earthMu / orbitalRadiusKm).toFixed(2));
  }

  private mapSatelliteToDto(satellite: {
    id: string;
    name: string;
    groupName: string | null;
    orbitClass: string | null;
    purpose: string | null;
    createdAt: Date;
    operator: string | null;
    country: { name: string | null; code: string } | null;
    noradId: number;
    altitudeKm: number | null;
    inclination: number | null;
  }): SatelliteDto {
    return {
      id: satellite.id,
      name: satellite.name,
      desc: satellite.groupName ?? satellite.name,
      type: satellite.orbitClass ?? "UNKNOWN",
      mission: satellite.purpose ?? "Unknown",
      status: "Active",
      launchDate: this.toDateString(satellite.createdAt),
      operator: satellite.operator ?? "Unknown",
      country: satellite.country?.name ?? satellite.country?.code ?? "Unknown",
      noradId: satellite.noradId,
      altitudeKm: satellite?.altitudeKm ? Math.round(satellite.altitudeKm) : 0,
      speedKms: this.calculateSpeedKms(satellite.altitudeKm),
      inclinationDeg: satellite.inclination ?? 0
    };
  }

  private buildSatelliteWhere(
    filters: SatelliteFiltersDto,
    withTlesOnly = false,
    userId?: string
  ) {
    const country = filters.country?.trim();
    const type = filters.type?.trim();
    const mission = filters.mission?.trim();

    return {
      ...(userId
        ? {
            file: {
              userId
            }
          }
        : {}),
      ...(withTlesOnly
        ? {
            tles: {
              some: {}
            }
          }
        : {}),
      ...(country
        ? {
            country: {
              OR: [
                {
                  name: {
                    contains: country,
                    mode: "insensitive" as const
                  }
                },
                {
                  code: {
                    contains: country,
                    mode: "insensitive" as const
                  }
                }
              ]
            }
          }
        : {}),
      ...(type
        ? {
            orbitClass: {
              equals: type,
              mode: "insensitive" as const
            }
          }
        : {}),
      ...(mission
        ? {
            purpose: {
              contains: mission,
              mode: "insensitive" as const
            }
          }
        : {})
    };
  }
}
