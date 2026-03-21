import { Module } from "@nestjs/common";
import { SatelliteService } from "./satellite.service";
import { SatelliteDemoController } from "./satellite-demo.controller";
import { SatelliteUserController } from "./satellite-user.controller";

@Module({
  controllers: [SatelliteDemoController, SatelliteUserController],
  providers: [SatelliteService]
})
export class SatelliteModule {}
