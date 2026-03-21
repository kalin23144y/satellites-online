import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiResponse, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard, type JwtPayload } from "@libs/auth";
import { User } from "../auth/decorators/user.decorator";
import { GetSatelliteResponseDto, GetSatellitesResponseDto } from "./dto/response";
import { SatelliteService } from "./satellite.service";
import { SatelliteFiltersDto } from "src/common/dto/satellite-filters.dto";

@ApiTags("Спутники. Для авторизованного пользователя")
@Controller("satellite/user")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth("access-token")
export class SatelliteUserController {
  constructor(private readonly satelliteService: SatelliteService) {}

  @Get()
  @ApiResponse({
    type: GetSatellitesResponseDto
  })
  async getSatellites(@User() user: JwtPayload, @Query() filters: SatelliteFiltersDto) {
    return this.satelliteService.getUserSatellites(user.sub, filters);
  }

  @Get(":id")
  @ApiResponse({
    type: GetSatelliteResponseDto
  })
  async getSatelliteById(@Param("id") id: string, @User() user: JwtPayload) {
    return this.satelliteService.getUserSatelliteById(id, user.sub);
  }
}
