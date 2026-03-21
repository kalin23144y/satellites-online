import { PrismaService } from "@libs/database";
import { Injectable } from "@nestjs/common";
import { FileResponseDto, GetFilesResponseDto } from "./dto/response";
import { SuccessResponseDto } from "src/common/types";

@Injectable()
export class FileService {
  constructor(private readonly prisma: PrismaService) {}

  async list(): Promise<GetFilesResponseDto> {
    const files = await this.prisma.file.findMany();
    return {
      files: files.map((file) => ({
        id: file.id,
        name: file.name,
        isActive: file.isActive
      }))
    };
  }

  async activate(id: string, isActive: boolean): Promise<FileResponseDto> {
    const file = await this.prisma.file.update({
      where: { id },
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

  async delete(id: string): Promise<SuccessResponseDto> {
    const file = await this.prisma.file.delete({
      where: { id }
    });
    return {
      success: true
    };
  }
}
