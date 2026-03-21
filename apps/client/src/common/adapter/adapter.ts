import { Injectable } from "@nestjs/common";
import { ConfigService } from "../config/config.service";
import { IoAdapter } from "@nestjs/platform-socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { Redis } from "ioredis";

@Injectable()
export class RedisIoAdapter extends IoAdapter {
  constructor(private readonly configService: ConfigService) {
    super();
  }
  private adapterConstructor: ReturnType<typeof createAdapter>;

  async connectToRedis(): Promise<void> {
    const pubClient = new Redis({
      host: this.configService.redis.host,
      port: this.configService.redis.port,
      password: this.configService.redis.password,
      lazyConnect: true
    });
    const subClient = pubClient.duplicate();

    await Promise.all([pubClient.connect(), subClient.connect()]);

    this.adapterConstructor = createAdapter(pubClient, subClient);
  }

  createIOServer(port: number, options?: any): any {
    const server = super.createIOServer(port, options);
    server.of("/").adapter = this.adapterConstructor;
    return server;
  }
}
