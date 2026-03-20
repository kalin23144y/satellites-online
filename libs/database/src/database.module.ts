import { DynamicModule, FactoryProvider, Global, Module } from "@nestjs/common";
import { DATABASE_MODULE_OPTIONS } from "./database.constants";
import type {
  DatabaseModuleAsyncOptions,
  DatabaseModuleOptions
} from "./database.interfaces";
import { PrismaService } from "./prisma.service";

@Global()
@Module({})
export class DatabaseModule {
  static forRootAsync(options: DatabaseModuleAsyncOptions): DynamicModule {
    const optionsProvider: FactoryProvider = {
      provide: DATABASE_MODULE_OPTIONS,
      inject: options.inject ?? [],
      useFactory: async (...args: any[]): Promise<DatabaseModuleOptions> => {
        return options.useFactory(...args);
      }
    };

    return {
      module: DatabaseModule,
      imports: options.imports ?? [],
      providers: [optionsProvider, PrismaService],
      exports: [PrismaService]
    };
  }
}
