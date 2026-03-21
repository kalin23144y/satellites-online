import { ApiProperty } from "@nestjs/swagger";

export class TleDto {
  @ApiProperty({
    type: Number,
    example: 25544
  })
  noradId: number;

  @ApiProperty({
    type: String,
    example: "1 25544U 98067A   25067.54791667  .00013628  00000+0  24523-3 0  9993"
  })
  tle1: string;

  @ApiProperty({
    type: String,
    example: "2 25544  51.6394 321.8763 0004192 167.9377 309.3487 15.49815391439267"
  })
  tle2: string;
}

export class GetTleResponseDto {
  @ApiProperty({
    type: TleDto
  })
  data: TleDto;
}

export class GetTlesResponseDto {
  @ApiProperty({
    type: [TleDto]
  })
  data: TleDto[];
}
