import { FileJobsEnum, QueueEnum } from "@libs/common";
import { MinioKeys, MinioService } from "@libs/minio";
import { InjectQueue } from "@nestjs/bullmq";
import { Injectable } from "@nestjs/common";
import { Queue } from "bullmq";
import { PrismaService } from "@libs/database";
import { GetTlesResponseDto, TleDto } from "./dto/response";

@Injectable()
export class TleService {
  constructor(
    private readonly minio: MinioService,
    @InjectQueue(QueueEnum.FILE) private fileQueue: Queue,
    private readonly prisma: PrismaService
  ) {}

  async uploadTleFile(userId: string, file: Express.Multer.File) {
    const createdFile = await this.prisma.file.create({
      data: {
        userId, 
        name: file.originalname
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

  async getDemoTles(): Promise<GetTlesResponseDto> {
    const satellites = await this.prisma.satellite.findMany({
      where: {
        tles: {
          some: {}
        }
      },
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

  async getUserTles(userId: string): Promise<GetTlesResponseDto> {
    const satellites = await this.prisma.satellite.findMany({
      where: {
        file: {
          userId
        },
        tles: {
          some: {}
        }
      },
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
}
