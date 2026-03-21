import {
  Controller,
  FileTypeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from "@nestjs/common";
import { TleService } from "./tle.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiResponse } from "@nestjs/swagger";
import { UploadResponseDto } from "./dto/response";
import { User } from "../auth/decorators/user.decorator";
import { JwtAuthGuard, type JwtPayload } from "@libs/auth";

@Controller("tle")
@ApiBearerAuth("access-token")
export class TleController {
  constructor(private readonly tleService: TleService) {}

  @Post("upload")
  @UseInterceptors(FileInterceptor("file"))
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: {
          type: "string",
          format: "binary"
        }
      },
      required: ["file"]
    }
  })
  @ApiResponse({
    type: UploadResponseDto
  })
  @UseGuards(JwtAuthGuard)
  uploadFile(
    @User() user: JwtPayload,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({
            fileType: /^text\/plain$/,
            fallbackToMimetype: true
          })
        ]
      })
    )
    file: Express.Multer.File
  ) {
    return this.tleService.uploadTleFile(user.sub, file);
  }
}
