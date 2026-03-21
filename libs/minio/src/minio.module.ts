import { DynamicModule, FactoryProvider, Global, Module, ModuleMetadata } from "@nestjs/common";

import { MinioService } from "./minio.service";
import type { MinioConfig } from "./minio-config.type";

export interface MinioModuleAsyncOptions extends Pick<ModuleMetadata, "imports"> {
  inject?: FactoryProvider["inject"];
  useFactory: (...args: any[]) => Promise<MinioConfig> | MinioConfig;
}

export const MINIO_CONFIG = "MINIO_CONFIG";

@Global()
@Module({})
export class MinioModule {
  static register(minioConfig: MinioConfig): DynamicModule {
    return {
      module: MinioModule,
      providers: [
        {
          provide: MINIO_CONFIG,
          useValue: minioConfig
        },
        MinioService
      ],
      exports: [MinioService]
    };
  }

  static registerAsync(options: MinioModuleAsyncOptions): DynamicModule {
    const optionsProvider: FactoryProvider = {
      provide: MINIO_CONFIG,
      inject: options.inject ?? [],
      useFactory: async (...args: any[]): Promise<MinioConfig> => {
        return options.useFactory(...args);
      }
    };

    return {
      module: MinioModule,
      imports: options.imports ?? [],
      providers: [optionsProvider, MinioService],
      exports: [MinioService]
    };
  }
}
