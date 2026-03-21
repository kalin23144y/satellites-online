import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiResponse, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard, type JwtPayload } from "@libs/auth";
import { User } from "../auth/decorators/user.decorator";
import { GetTlesResponseDto } from "./dto/response";
import { TleService } from "./tle.service";

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
  async getTles(@User() user: JwtPayload) {
    return this.tleService.getUserTles(user.sub);
  }
}
