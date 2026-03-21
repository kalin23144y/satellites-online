import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiResponse, ApiTags } from "@nestjs/swagger";
import { GetSatelliteResponseDto, GetSatellitesResponseDto } from "./dto/response";
import { SatelliteService } from "./satellite.service";
import { SatelliteFiltersDto } from "src/common/dto/satellite-filters.dto";

@ApiTags("Спутники. Демо-доступ")
@Controller("satellite/demo")
export class SatelliteDemoController {
  constructor(private readonly satelliteService: SatelliteService) {}

  @Get()
  @ApiResponse({
    type: GetSatellitesResponseDto
  })
  async getSatellites(@Query() filters: SatelliteFiltersDto) {
    return this.satelliteService.getDemoSatellites(filters);
  }

  @Get(":id")
  @ApiResponse({
    type: GetSatelliteResponseDto
  })
  async getSatelliteById(@Param("id") id: string) {
    return this.satelliteService.getDemoSatelliteById(id);
  }
}
