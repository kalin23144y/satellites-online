import { FileJobsEnum, QueueEnum } from "@libs/common";
import { MinioKeys, MinioService } from "@libs/minio";
import { InjectQueue } from "@nestjs/bullmq";
import { Injectable } from "@nestjs/common";
import { Queue } from "bullmq";
import { PrismaService } from "@libs/database";
import { GetTlesResponseDto, TleDto } from "./dto/response";
import { SatelliteFiltersDto } from "src/common/dto/satellite-filters.dto";

@Injectable()
export class TleService {
  constructor(
    private readonly minio: MinioService,
    @InjectQueue(QueueEnum.FILE) private fileQueue: Queue,
    private readonly prisma: PrismaService
  ) {}

  async uploadTleFile(userId: string, file: Express.Multer.File, name: string) {
    const displayName = name?.trim() || file.originalname;
    const createdFile = await this.prisma.file.create({
      data: {
        userId,
        name: displayName
      },
      select: {
        id: true
      }
    });

    await this.minio.putObject(MinioKeys.tle, `${createdFile.id}.txt`, file.buffer, file.size, {
      "Content-Type": file.mimetype
    });

    await this.fileQueue.add(
      FileJobsEnum.PARSE,
      { fileId: createdFile.id },
      {
        removeOnComplete: true
      }
    );

    return { success: true };
  }

  async getDemoTles(filters: SatelliteFiltersDto): Promise<GetTlesResponseDto> {
    const satellites = await this.prisma.satellite.findMany({
      where: this.buildSatelliteWhere(filters, true),
      select: {
        noradId: true,
        tles: {
          orderBy: {
            createdAt: "desc"
          },
          take: 1,
          select: {
            line1: true,
            line2: true
          }
        }
      },
      orderBy: [{ updatedAt: "desc" }, { id: "asc" }],
      take: 100
    });

    return {
      data: satellites
        .filter((satellite) => satellite.tles.length > 0)
        .map((satellite) =>
          this.mapTleToDto(satellite.noradId, satellite.tles[0].line1, satellite.tles[0].line2)
        )
    };
  }

  async getUserTles(userId: string, filters: SatelliteFiltersDto): Promise<GetTlesResponseDto> {
    const satellites = await this.prisma.satellite.findMany({
      where: this.buildSatelliteWhere(filters, true, userId),
      select: {
        noradId: true,
        tles: {
          orderBy: {
            createdAt: "desc"
          },
          take: 1,
          select: {
            line1: true,
            line2: true
          }
        }
      },
      orderBy: [{ updatedAt: "desc" }, { id: "asc" }]
    });

    return {
      data: satellites
        .filter((satellite) => satellite.tles.length > 0)
        .map((satellite) =>
          this.mapTleToDto(satellite.noradId, satellite.tles[0].line1, satellite.tles[0].line2)
        )
    };
  }

  private mapTleToDto(noradId: number, tle1: string, tle2: string): TleDto {
    return {
      noradId,
      tle1,
      tle2
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
              isActive: true,
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
