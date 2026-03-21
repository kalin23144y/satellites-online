import { PrismaService } from "@libs/database";
import { Injectable, NotFoundException } from "@nestjs/common";
import type { Readable } from "node:stream";
import { CountryListResponseDto, CountryResponseDto, UploadResponseDto } from "./dto/response";
import { Page } from "src/common/types/pages";
import { MinioKeys, MinioService } from "@libs/minio";
import { UpdateRequestDto } from "./dto/request";

function mimeFromObjectKey(objectName: string): string {
  const ext = objectName.split(".").pop()?.toLowerCase();
  const map: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",
    bmp: "image/bmp",
    heic: "image/heic"
  };
  return ext ? (map[ext] ?? "application/octet-stream") : "application/octet-stream";
}

@Injectable()
export class CountryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly minio: MinioService
  ) {}

  async get(id: string): Promise<CountryResponseDto> {
    const country = await this.prisma.country.findUnique({
      where: { id }
    });
    if (!country) {
      throw new NotFoundException("Country not found");
    }
    return {
      id: country.id,
      name: country.name ?? "",
      code: country.code,
      color: country.color,
      filePath: country.filePath ?? undefined
    };
  }

  async getImage(id: string): Promise<{ url: string }> {
    const country = await this.prisma.country.findUnique({
      where: { id }
    });
    if (!country) {
      throw new NotFoundException("Country not found");
    }

    const imageUrl = await this.minio.getPresignedUrlById(MinioKeys.country, id);
    if (!imageUrl) {
      throw new NotFoundException("Image not found");
    }
    return { url: imageUrl };
  }

  async getImageStream(id: string): Promise<{ stream: Readable; contentType: string }> {
    const country = await this.prisma.country.findUnique({
      where: { id }
    });
    if (!country) {
      throw new NotFoundException("Country not found");
    }

    const result = await this.minio.getObjectStreamById(MinioKeys.country, id);
    if (!result) {
      throw new NotFoundException("Image not found");
    }

    return {
      stream: result.stream,
      contentType: mimeFromObjectKey(result.objectName)
    };
  }

  async updateColor(id: string, body: UpdateRequestDto): Promise<CountryResponseDto> {
    const _country = await this.prisma.country.findUnique({
      where: { id }
    });

    if (!_country) {
      throw new NotFoundException("Country not found");
    }

    const country = await this.prisma.country.update({
      where: { id },
      data: { color: body.color, name: body.name }
    });

    return {
      id: country.id,
      name: country.name ?? "",
      code: country.code,
      color: country.color,
      filePath: country.filePath ?? undefined
    };
  }

  async list(page: Page): Promise<CountryListResponseDto> {
    const countries = await this.prisma.country.findMany({
      skip: parseInt(page.offset),
      take: parseInt(page.limit)
    });
    return {
      countries: countries.map((country) => ({
        id: country.id,
        name: country.name ?? "",
        code: country.code,
        color: country.color,
        filePath: country.filePath ?? undefined
      })),
      total: await this.prisma.country.count()
    };
  }

  async uploadImage(id: string, file: Express.Multer.File): Promise<UploadResponseDto> {
    const country = await this.prisma.country.findUnique({
      where: { id }
    });
    if (!country) {
      throw new NotFoundException("Country not found");
    }

    await this.minio.putObject(
      MinioKeys.country,
      `${id}.${file.mimetype.split("/")[1]}`,
      file.buffer,
      file.size,
      {
        "Content-Type": file.mimetype
      }
    );

    await this.prisma.country.update({
      where: { id },
      data: { filePath: `/country/get/image/${id}` }
    });

    return { success: true };
  }
}
