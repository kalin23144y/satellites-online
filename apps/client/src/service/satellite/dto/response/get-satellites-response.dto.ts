import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsUUID, IsInt, IsNumber, IsDateString, Min, Max } from "class-validator";

export class SatelliteDto {
  @ApiProperty({
    example: "1f3a9b2c-6a4e-4d7e-9c2f-1b2e3d4f5a01",
    description: "Уникальный идентификатор объекта"
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    example: "ISS (ZARYA)",
    description: "Название объекта"
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: "International Space Station",
    description: "Описание объекта"
  })
  @IsString()
  desc: string;

  @ApiProperty({
    example: "LEO",
    description: "Тип орбиты"
  })
  @IsString()
  type: string;

  @ApiProperty({
    example: "Science",
    description: "Назначение миссии"
  })
  @IsString()
  mission: string;

  @ApiProperty({
    example: "Active",
    description: "Статус объекта"
  })
  @IsString()
  status: string;

  @ApiProperty({
    example: "1998-11-20",
    description: "Дата запуска",
    format: "date"
  })
  @IsDateString()
  launchDate: string;

  @ApiProperty({
    example: "NASA / Roscosmos",
    description: "Оператор объекта"
  })
  @IsString()
  operator: string;

  @ApiProperty({
    example: "Multinational",
    description: "Страна или принадлежность"
  })
  @IsString()
  country: string;

  @ApiProperty({
    example: 25544,
    description: "NORAD ID"
  })
  @IsInt()
  @Min(1)
  noradId: number;

  @ApiProperty({
    example: 420,
    description: "Высота орбиты в километрах"
  })
  @IsNumber()
  @Min(0)
  altitudeKm: number;

  @ApiProperty({
    example: 7.66,
    description: "Скорость в км/с"
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  speedKms: number;

  @ApiProperty({
    example: 51.64,
    description: "Наклонение орбиты в градусах"
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(180)
  inclinationDeg: number;
}

export class GetSatellitesResponseDto {
  @ApiProperty({
    type: [SatelliteDto],
    description: "Список спутников"
  })
  data: SatelliteDto[];
}

export class GetSatelliteResponseDto {
  @ApiProperty({
    type: SatelliteDto,
    description: "Спутник"
  })
  data: SatelliteDto;
}
