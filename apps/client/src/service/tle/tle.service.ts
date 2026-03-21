import { FileJobsEnum, QueueEnum } from "@libs/common";
import { MinioKeys, MinioService } from "@libs/minio";
import { InjectQueue } from "@nestjs/bullmq";
import { Injectable } from "@nestjs/common";
import { Queue } from "bullmq";
import { PrismaService } from "@libs/database";

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
        userId
      },
      select: {
        id: true
      }
    });
    console.log(createdFile)
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
}
