import { QueueEnum } from "@libs/common";
import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { FileConsumer } from "./file.processor";
import { FileService } from "./file.service";
import { SatelliteCatalogService } from "./satellite-catalog.service";
import { SatcatConsumer } from "./satcat.processor";

@Module({
  imports: [
    BullModule.registerQueue({
      name: QueueEnum.FILE
    }),
    BullModule.registerQueue({
      name: QueueEnum.SATCAT
    })
  ],
  providers: [FileService, FileConsumer, SatelliteCatalogService, SatcatConsumer]
})
export class FileModule {}
