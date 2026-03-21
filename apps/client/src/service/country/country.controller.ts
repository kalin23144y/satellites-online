import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  Param,
  ParseFilePipe,
  Patch,
  Query,
  StreamableFile,
  UploadedFile,
  UseInterceptors
} from "@nestjs/common";
import { CountryService } from "./country.service";
import { ApiBody, ApiConsumes, ApiResponse } from "@nestjs/swagger";
import { CountryListResponseDto, CountryResponseDto, UploadResponseDto } from "./dto/response";
import { Page } from "src/common/types/pages";
import { FileInterceptor } from "@nestjs/platform-express";
import { UpdateRequestDto } from "./dto/request";

@Controller("country")
export class CountryController {
  constructor(private readonly countryService: CountryService) {}

  @Get("get/:id")
  @ApiResponse({
    type: CountryResponseDto
  })
  get(@Param("id") id: string) {
    return this.countryService.get(id);
  }

  @Get("list")
  @ApiResponse({
    type: CountryListResponseDto
  })
  list(@Query() page: Page) {
    return this.countryService.list(page);
  }

  @Patch("upload/image/:id")
  @UseInterceptors(FileInterceptor("file"))
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: { type: "string", format: "binary" }
      }
    }
  })
  @ApiResponse({
    type: UploadResponseDto
  })
  uploadImage(
    @Param("id") id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({
            fileType: /^image\/(jpeg|png|webp)$/i,
            fallbackToMimetype: true
          })
        ]
      })
    )
    file: Express.Multer.File
  ) {
    return this.countryService.uploadImage(id, file);
  }

  @Get("get/image/:id")
  getImage(@Param("id") id: string) {
    return this.countryService.getImage(id);
  }

  @Get("get/image/:id/stream")
  @ApiResponse({
    description: "Поток файла изображения (ключ в MinIO ищется как {id}.*)"
  })
  async getImageStream(@Param("id") id: string) {
    const { stream, contentType } = await this.countryService.getImageStream(id);
    return new StreamableFile(stream, { type: contentType });
  }

  @Patch("update/:id")
  updateColor(@Param("id") id: string, @Body() body: UpdateRequestDto) {
    return this.countryService.updateColor(id, body);
  }

  @Delete("delete/image")
  deleteImage() {}
}
