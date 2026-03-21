import { FileJobsEnum, QueueEnum } from "@libs/common";
import { InjectQueue } from "@nestjs/bullmq";
import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { Queue } from "bullmq";
import { ConfigService } from "../../common/config/config.service";

@Injectable()
export class CronService implements OnModuleInit {
  private readonly logger = new Logger(CronService.name);

  constructor(
    @InjectQueue(QueueEnum.SATCAT) private readonly satcatQueue: Queue,
    private readonly config: ConfigService
  ) {}

  async onModuleInit(): Promise<void> {
    await this.queueSatcatSync();
  }

  /** Ставит в очередь задачу синхронизации метаданных SATCAT (HTTP вне парсинга TLE). */
  @Cron(CronExpression.EVERY_WEEKEND)
  async queueSatcatSync(): Promise<void> {
    
    const satcatCount = this.config.satcat.count;
    if (satcatCount === 0) {
      this.logger.log("SATCAT count is 0, skipping sync");
      return;
    }
    const take = this.config.satcat.take;
    const offset = this.config.satcat.offset;

    const count = Math.ceil(satcatCount / take);
    console.log(count);
    for (let i = 0; i < count; i++) {
      await this.satcatQueue.add(
        FileJobsEnum.SYNC_SATCAT,
        {
          limit: take,
          offset: offset + i * take
        },
        {
          removeOnComplete: true
        }
      );
      await this.delay(1000);
    }
    this.logger.log("Queued SYNC_SATCAT job");
  }

  delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
