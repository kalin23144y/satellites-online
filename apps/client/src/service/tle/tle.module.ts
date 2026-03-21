import { QueueEnum } from "@libs/common";
import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { TleService } from "./tle.service";
import { TleController } from "./tle.controller";

@Module({
  imports: [
    BullModule.registerQueue({
      name: QueueEnum.FILE
    })
  ],
  controllers: [TleController],
  providers: [TleService],
})
export class TleModule {}
