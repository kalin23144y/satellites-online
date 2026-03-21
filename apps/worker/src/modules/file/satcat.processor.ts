import { OnWorkerEvent, Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { FileJobsEnum, QueueEnum } from "@libs/common";
import { Logger } from "@nestjs/common";
import { FileService } from "./file.service";
import { SatelliteCatalogService } from "./satellite-catalog.service";
import { SyncSatcatJobDto } from "src/common/types/job.dto";

@Processor(QueueEnum.SATCAT, {
  concurrency: 1000
})
export class SatcatConsumer extends WorkerHost {
  private readonly logger = new Logger(SatcatConsumer.name);

  constructor(private readonly satcatService: SatelliteCatalogService) {
    super();
  }

  async process(job: Job<any, any, FileJobsEnum>): Promise<any> {
    switch (job.name) {
      case FileJobsEnum.SYNC_SATCAT: {
        const { limit, offset } = job.data as SyncSatcatJobDto;
        return this.satcatService.parsSatcatRecord(limit, offset);
      }
      default: {
        this.logger.warn(`job with name "${job.name}" does not exists`);
      }
    }
  }

  @OnWorkerEvent("active")
  onActive(job: Job) {
    this.logger.log(`Processing job ${job.id} of type ${job.name} with data...`);
    this.logger.log(job.data);
  }

  @OnWorkerEvent("failed")
  onFailed(job: Job) {
    this.logger.error(
      `Job ${job.id} of type ${job.name} failed. Error reason: ${job.failedReason}`
    );
    this.logger.debug(job.data);
  }

  @OnWorkerEvent("completed")
  onCompleted(job: Job) {
    this.logger.log(`Job ${job.id} of type ${job.name} completed`);
    this.logger.debug(job.data);
  }
}
