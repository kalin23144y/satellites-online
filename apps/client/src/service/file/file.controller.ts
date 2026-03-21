import { Body, Controller, Delete, Get, Param, Patch } from "@nestjs/common";
import { FileService } from "./file.service";
import { ApiResponse } from "@nestjs/swagger";
import { FileResponseDto, GetFilesResponseDto } from "./dto/response";
import { FileParamsDto, FileUpdateActivateBodyDto } from "./dto/request";

@Controller("file")
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Get()
  @ApiResponse({
    description: "Список файлов",
    type: GetFilesResponseDto
  })
  async list() {
    return this.fileService.list();
  }

  @Patch(":id/update/activate")
  @ApiResponse({
    description: "Активация файла",
    type: FileResponseDto
  })
  activate(@Param() params: FileParamsDto, @Body() body: FileUpdateActivateBodyDto) {
    return this.fileService.activate(params.id, body.isActive);
  }

  @Delete(":id")
  @ApiResponse({
    description: "Удаление файла",
    type: FileResponseDto
  })
  delete(@Param() params: FileParamsDto) {
    return this.fileService.delete(params.id);
  }
}
