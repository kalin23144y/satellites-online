import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class UploadResponseDto {
  @ApiProperty({ type: Boolean })
  success: boolean;
}

export class CountryResponseDto {
  @ApiProperty({ type: String })
  id: string;

  @ApiPropertyOptional({ type: String })
  name: string;

  @ApiProperty({ type: String })
  code: string;

  @ApiProperty({ type: String })
  color: string;

  @ApiPropertyOptional({ type: String })
  filePath?: string;
}

export class CountryListResponseDto {
  @ApiProperty({ type: [CountryResponseDto] })
  countries: CountryResponseDto[];
  @ApiProperty({ type: Number })
  total: number;
}
