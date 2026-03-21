import { ApiProperty } from "@nestjs/swagger";

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
