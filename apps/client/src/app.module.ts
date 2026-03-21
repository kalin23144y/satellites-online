import { Module } from "@nestjs/common";
import { AuthModule } from "@libs/auth";
import { DatabaseModule } from "@libs/database";
import { ConfigModule } from "./common/config/config.module";
import { ConfigService } from "./common/config/config.service";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { UserAuthModule } from "./service/auth/auth.module";
import { MinioModule } from "@libs/minio";
import { TleModule } from "./service/tle/tle.module";
import { BullModule } from "@nestjs/bullmq";

@Module({
  imports: [
    ConfigModule,
    BullModule.forRootAsync({
      inject: [ConfigService],
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.redis.host,
          port: config.redis.port,
          password: config.redis.password
        }
      })
    }),
    MinioModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (...args: any[]) => {
        const [config] = args as [ConfigService];
        return config.minio;
      }
    }),
    AuthModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (...args: any[]) => {
        const [config] = args as [ConfigService];
        return {
          secret: config.jwt.secret,
          issuer: "hackaton-api",
          audience: "hackaton-client",
          expiresIn: config.jwt.expiresIn
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
    UserAuthModule,
    TleModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
