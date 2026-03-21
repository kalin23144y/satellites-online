import { Controller, Get, Param, Req, UseGuards } from "@nestjs/common";
import { SatelliteService } from "./satellite.service";
import { User } from "../auth/decorators/user.decorator";
import { ApiBearerAuth, ApiResponse } from "@nestjs/swagger";
import { JwtAuthGuard, type JwtPayload } from "@libs/auth";
import { GetSatelliteResponseDto, GetSatellitesResponseDto } from "./dto/response";

@Controller("satellite")
@ApiBearerAuth("access-token")
export class SatelliteController {
  constructor(private readonly satelliteService: SatelliteService) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiResponse({
    type: GetSatellitesResponseDto
  })
  async getSatellites(@Req() request: { user?: JwtPayload }) {
    return this.satelliteService.getSatellites(request.user?.sub);
  }

  @Get(":id")
  @ApiResponse({
    type: GetSatelliteResponseDto
  })
  async getSatelliteById(@Param("id") id: string) {
    return this.satelliteService.getSatelliteById(id);
  }
}
