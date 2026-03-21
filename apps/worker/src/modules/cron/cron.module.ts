import { QueueEnum } from "@libs/common";
import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { ConfigModule } from "../../common/config/config.module";
import { CronService } from "./cron.service";

@Module({
  imports: [
    ScheduleModule.forRoot(),
    BullModule.registerQueue({
      name: QueueEnum.SATCAT  
    }),
    ConfigModule
  ],
  providers: [CronService]
})
export class CronModule {}
