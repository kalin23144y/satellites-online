import { ApiProperty } from "@nestjs/swagger";

export class FileParamsDto {
  @ApiProperty({
    type: String
  })
  id: string;
}

export class FileUpdateActivateBodyDto {
  @ApiProperty({
    type: Boolean
  })
  isActive: boolean;
}
