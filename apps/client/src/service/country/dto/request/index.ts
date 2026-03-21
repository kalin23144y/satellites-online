import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UpdateRequestDto {
  @ApiPropertyOptional({ type: String })
  @IsString()
  @IsOptional()
  color?: string;

  @ApiPropertyOptional({ type: String })
  @IsString()
  @IsOptional()
  name?: string;
}
