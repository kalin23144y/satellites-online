import { FactoryProvider, ModuleMetadata } from "@nestjs/common";
import { Prisma } from "./generated/prisma/client";

/**
 * Only the options shared by both Prisma connection modes (adapter vs accelerate).
 * Omitting `adapter`/`accelerateUrl` from the full union still leaves a branch that
 * requires `accelerateUrl` — use Pick instead.
 */
export type SupportedPrismaClientOptions = Pick<
  Prisma.PrismaClientOptions,
  "log" | "errorFormat" | "transactionOptions" | "omit" | "comments"
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
