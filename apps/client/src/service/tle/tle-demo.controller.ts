import { Controller, Get, Query } from "@nestjs/common";
import { ApiResponse, ApiTags } from "@nestjs/swagger";
import { GetTlesResponseDto } from "./dto/response";
import { TleService } from "./tle.service";
import { SatelliteFiltersDto } from "src/common/dto/satellite-filters.dto";

@ApiTags("Tle. Демо-доступ")
@Controller("tle/demo")
export class TleDemoController {
  constructor(private readonly tleService: TleService) {}

  @Get()
  @ApiResponse({
    type: GetTlesResponseDto
  })
  async getTles(@Query() filters: SatelliteFiltersDto) {
    return this.tleService.getDemoTles(filters);
  }
}
