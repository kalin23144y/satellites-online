import { ApiProperty } from "@nestjs/swagger";

export class UploadResponseDto {
  @ApiProperty({
    type: Boolean
  })
  success: boolean;
}
