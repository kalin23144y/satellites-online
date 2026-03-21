import { Body, Controller, Delete, Get, Param, Patch, UseGuards } from "@nestjs/common";
import { FileService } from "./file.service";
import { ApiBearerAuth, ApiResponse } from "@nestjs/swagger";
import { FileResponseDto, GetFilesResponseDto } from "./dto/response";
import { FileParamsDto, FileUpdateActivateBodyDto, FileUpdateNameBodyDto } from "./dto/request";
import { JwtAuthGuard, type JwtPayload } from "@libs/auth";
import { User } from "../auth/decorators/user.decorator";

@Controller("file")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth("access-token")
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Get()
  @ApiResponse({
    description: "Список файлов",
    type: GetFilesResponseDto
  })
  async list(@User() user: JwtPayload) {
    return this.fileService.list(user.sub);
  }

  @Patch("/update/activate/:id")
  @ApiResponse({
    description: "Активация файла",
    type: FileResponseDto
  })
  activate(
    @Param() params: FileParamsDto,
    @Body() body: FileUpdateActivateBodyDto,
    @User() user: JwtPayload
  ) {
    return this.fileService.activate(params.id, body.isActive, user.sub);
  }

  @Patch("/update/name/:id")
  @ApiResponse({
    description: "Изменение имени файла",
    type: FileResponseDto
  })
  updateName(
    @Param() params: FileParamsDto,
    @Body() body: FileUpdateNameBodyDto,
    @User() user: JwtPayload
  ) {
    return this.fileService.name(params.id, body.name, user.sub);
  }

  @Delete(":id")
  @ApiResponse({
    description: "Удаление файла",
    type: FileResponseDto
  })
  delete(@Param() params: FileParamsDto, @User() user: JwtPayload) {
    return this.fileService.delete(params.id, user.sub);
  }
}
