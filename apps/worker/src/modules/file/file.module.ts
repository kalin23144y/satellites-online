import { QueueEnum } from "@libs/common";
import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { FileConsumer } from "./file.processor";
import { FileService } from "./file.service";
import { SatelliteCatalogService } from "./satellite-catalog.service";

@Module({
  imports: [
    BullModule.registerQueue({
      name: QueueEnum.FILE
    })
  ],
  providers: [FileService, FileConsumer, SatelliteCatalogService]
})
export class FileModule {}
