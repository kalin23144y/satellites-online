import { FactoryProvider, ModuleMetadata } from "@nestjs/common";
import { Prisma } from "./generated/prisma/client";

type SupportedPrismaClientOptions = Omit<
  Prisma.PrismaClientOptions,
  "adapter" | "accelerateUrl"
>;

export interface DatabaseModuleOptions {
  datasourceUrl?: string;
  prismaOptions?: SupportedPrismaClientOptions;
}

export interface DatabaseModuleAsyncOptions
  extends Pick<ModuleMetadata, "imports"> {
  inject?: FactoryProvider["inject"];
  useFactory: (
    ...args: any[]
  ) => Promise<DatabaseModuleOptions> | DatabaseModuleOptions;
}
