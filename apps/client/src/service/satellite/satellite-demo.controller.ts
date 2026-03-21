import { Controller, Get, Param } from "@nestjs/common";
import { ApiResponse, ApiTags } from "@nestjs/swagger";
import { GetSatelliteResponseDto, GetSatellitesResponseDto } from "./dto/response";
import { SatelliteService } from "./satellite.service";

@ApiTags("Спутники. Демо-доступ")
@Controller("satellite/demo")
export class SatelliteDemoController {
  constructor(private readonly satelliteService: SatelliteService) {}

  @Get()
  @ApiResponse({
    type: GetSatellitesResponseDto
  })
  async getSatellites() {
    return this.satelliteService.getDemoSatellites();
  }

  @Get(":id")
  @ApiResponse({
    type: GetSatelliteResponseDto
  })
  async getSatelliteById(@Param("id") id: string) {
    return this.satelliteService.getDemoSatelliteById(id);
  }
}
