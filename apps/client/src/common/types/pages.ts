import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsString } from "class-validator";

export class Page {
  @ApiProperty({
    description: "Limit",
    example: 10
  })
  @IsString()
  limit: string;

  @ApiProperty({
    description: "Offset",
    example: 0
  })
  @IsString()
  offset: string;
}
