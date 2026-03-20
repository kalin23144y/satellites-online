import {
  INestApplication,
  Inject,
  Injectable,
  OnModuleInit
} from "@nestjs/common";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";
import { DATABASE_MODULE_OPTIONS } from "./database.constants";
import type { DatabaseModuleOptions } from "./database.interfaces";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor(
    @Inject(DATABASE_MODULE_OPTIONS)
    private readonly databaseOptions: DatabaseModuleOptions
  ) {
    const connectionString =
      databaseOptions.datasourceUrl ?? process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error(
        "DATABASE_URL is not set. Provide datasourceUrl or DATABASE_URL env."
      );
    }

    super({
      ...(databaseOptions.prismaOptions ?? {}),
      adapter: new PrismaPg({ connectionString })
    });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async enableShutdownHooks(app: INestApplication): Promise<void> {
    process.on("beforeExit", async () => {
      await app.close();
    });
  }
}
