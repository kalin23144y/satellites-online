import { QueueEnum } from "@libs/common";
import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { TleService } from "./tle.service";
import { TleController } from "./tle.controller";
import { TleDemoController } from "./tle-demo.controller";
import { TleUserController } from "./tle-user.controller";

@Module({
  imports: [
    BullModule.registerQueue({
      name: QueueEnum.FILE
    })
  ],
  controllers: [TleController, TleDemoController, TleUserController],
  providers: [TleService],
})
export class TleModule {}
