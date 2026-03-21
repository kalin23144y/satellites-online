import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class SatelliteFiltersDto {
  @ApiPropertyOptional({
    type: String,
    description: "Страна спутника"
  })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional({
    type: String,
    description: "Тип орбиты"
  })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiPropertyOptional({
    type: String,
    description: "Назначение спутника"
  })
  @IsString()
  @IsOptional()
  mission?: string;
}
