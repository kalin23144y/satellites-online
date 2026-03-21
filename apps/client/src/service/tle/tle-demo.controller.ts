import { Controller, Get } from "@nestjs/common";
import { ApiResponse, ApiTags } from "@nestjs/swagger";
import { GetTlesResponseDto } from "./dto/response";
import { TleService } from "./tle.service";

@ApiTags("Tle. Демо-доступ")
@Controller("tle/demo")
export class TleDemoController {
  constructor(private readonly tleService: TleService) {}

  @Get()
  @ApiResponse({
    type: GetTlesResponseDto
  })
  async getTles() {
    return this.tleService.getDemoTles();
  }
}
