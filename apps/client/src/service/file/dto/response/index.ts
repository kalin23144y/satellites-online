import { ApiProperty } from "@nestjs/swagger";
import { FileStatus } from "node_modules/@libs/database/src/generated/prisma/enums";

export class FileDto {
  @ApiProperty({
    type: String
  })
  id: string;

  @ApiProperty({
    type: String
  })
  name: string;

  @ApiProperty({
    type: Boolean
  })
  isActive: boolean;

  @ApiProperty({
    enum: FileStatus
  })
  status: FileStatus;
}

export class GetFilesResponseDto {
  @ApiProperty({
    type: [FileDto]
  })
  files: FileDto[];
}

export class FileResponseDto {
  @ApiProperty({
    type: FileDto
  })
  file: FileDto;
}
