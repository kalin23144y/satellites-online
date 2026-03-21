import { Module } from "@nestjs/common";
import { DatabaseModule } from "@libs/database";
import { ConfigService } from "./common/config/config.service";
import { ConfigModule } from "./common/config/config.module";
import { FileModule } from "./modules/file/file.module";
import { CronModule } from "./modules/cron/cron.module";
import { MinioModule } from "@libs/minio";
import { BullModule } from "@nestjs/bullmq";

@Module({
  imports: [
    ConfigModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (...args: any[]) => {
        const [config] = args as [ConfigService];
        return {
          connection: {
            host: config.redis.host,
            port: config.redis.port,
            password: config.redis.password
          }
        };
      }
    }),
    DatabaseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (...args: any[]) => {
        const [config] = args as [ConfigService];
        return {
          datasourceUrl: config.database.url,
          prismaOptions: {
            log: ["warn", "error"]
          }
        };
      }
    }),
    MinioModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (...args: any[]) => {
        const [config] = args as [ConfigService];
        return config.minio;
      }
    }),
    FileModule,
    CronModule
  ]
})
export class AppModule {}
