import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { Client } from "minio";
import { MinioKeys } from "./minio.keys";
import type { MinioConfig } from "./minio-config.type";

@Injectable()
export class MinioService extends Client implements OnModuleInit {
  constructor(
    @Inject("MINIO_CONFIG") private readonly minioConfig: MinioConfig
  ) {
    super({
      port: minioConfig.port,
      accessKey: minioConfig.accessKey,
      secretKey: minioConfig.secretKey,
      endPoint: minioConfig.endPoint,
      useSSL: false
    });
  }

  async onModuleInit() {
    const names = Object.keys(MinioKeys);
    await Promise.all(
      names.map(async (name) => {
        try {
          const exists = await this.bucketExists(name);
          if (exists) {
            return;
          }
          await this.makeBucket(name);
        } catch (e) {
          console.log(e);
        }
      })
    );
  }
}
