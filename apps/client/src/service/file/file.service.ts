import { PrismaService } from "@libs/database";
import { Injectable } from "@nestjs/common";
import { FileResponseDto, GetFilesResponseDto } from "./dto/response";
import { SuccessResponseDto } from "src/common/types";

@Injectable()
export class FileService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string): Promise<GetFilesResponseDto> {
    const files = await this.prisma.file.findMany({
      where: {
        userId
      },
      orderBy: {
        createdAt: "desc"
      }
    });
    return {
      files: files.map((file) => ({
        id: file.id,
        name: file.name,
        isActive: file.isActive
      }))
    };
  }

  async activate(id: string, isActive: boolean, userId: string): Promise<FileResponseDto> {
    await this.prisma.file.updateMany({
      where: {
        userId
      },
      data: {
        isActive: false
      }
    });

    const file = await this.prisma.file.update({
      where: { id, userId },
      data: { isActive }
    });

    return {
      file: {
        id: file.id,
        name: file.name,
        isActive: file.isActive
      }
    };
  }

  async name(id: string, name: string, userId: string): Promise<FileResponseDto> {
    const file = await this.prisma.file.update({
      where: { id, userId },
      data: { name }
    });
    return {
      file: {
        id: file.id,
        name: file.name,
        isActive: file.isActive
      }
    };
  }

  async delete(id: string, userId: string): Promise<SuccessResponseDto> {
    const file = await this.prisma.file.delete({
      where: { id, userId }
    });
    return {
      success: true
    };
  }
}
