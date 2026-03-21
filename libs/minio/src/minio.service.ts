import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { Client } from "minio";
import { Readable } from "node:stream";
import { MinioKeys } from "./minio.keys";
import type { MinioConfig } from "./minio-config.type";

function asNodeReadable(stream: unknown): Readable {
  if (stream instanceof Readable) {
    return stream;
  }
  return Readable.fromWeb(stream as import("stream/web").ReadableStream);
}

@Injectable()
export class MinioService extends Client implements OnModuleInit {
  constructor(@Inject("MINIO_CONFIG") private readonly minioConfig: MinioConfig) {
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

  /**
   * Ищет объект в бакете по ключу `{id}.{любое_расширение}` (префикс `id.`).
   * Подходит, если файл сохранён как `uuid.jpg`, `uuid.png` и т.д.
   */
  async findObjectNameById(bucket: string, id: string): Promise<string | null> {
    const prefix = `${id}.`;
    return new Promise((resolve, reject) => {
      let settled = false;
      const stream = this.listObjects(bucket, prefix, true);
      const finish = (name: string | null) => {
        if (settled) {
          return;
        }
        settled = true;
        stream.destroy();
        resolve(name);
      };
      stream.on("data", (obj: { name?: string }) => {
        if (obj?.name) {
          finish(obj.name);
        }
      });
      stream.on("error", (err: Error) => {
        if (!settled) {
          settled = true;
          reject(err);
        }
      });
      stream.on("end", () => finish(null));
    });
  }

  /**
   * Поток чтения объекта по id (имя ключа определяется через {@link findObjectNameById}).
   */
  async getObjectStreamById(
    bucket: string,
    id: string
  ): Promise<{ stream: Readable; objectName: string } | null> {
    const objectName = await this.findObjectNameById(bucket, id);
    if (!objectName) {
      return null;
    }
    const raw = await this.getObject(bucket, objectName);
    return { stream: asNodeReadable(raw), objectName };
  }

  /**
   * Временная ссылка на объект, найденный по id (любое расширение после `{id}.`).
   */
  async getPresignedUrlById(
    bucket: string,
    id: string,
    expirySeconds = 3600
  ): Promise<string | null> {
    const objectName = await this.findObjectNameById(bucket, id);
    if (!objectName) {
      return null;
    }
    return this.presignedGetObject(bucket, objectName, expirySeconds);
  }
}
