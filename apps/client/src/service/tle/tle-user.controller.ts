import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiResponse, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard, type JwtPayload } from "@libs/auth";
import { User } from "../auth/decorators/user.decorator";
import { GetTlesResponseDto } from "./dto/response";
import { TleService } from "./tle.service";
import { SatelliteFiltersDto } from "src/common/dto/satellite-filters.dto";

@ApiTags("Tle. Для авторизованного пользователя")
@Controller("tle/user")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth("access-token")
export class TleUserController {
  constructor(private readonly tleService: TleService) {}

  @Get()
  @ApiResponse({
    type: GetTlesResponseDto
  })
  async getTles(@User() user: JwtPayload, @Query() filters: SatelliteFiltersDto) {
    return this.tleService.getUserTles(user.sub, filters);
  }
}
