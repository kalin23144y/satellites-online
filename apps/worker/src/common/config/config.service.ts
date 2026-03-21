import { type MinioConfig } from "@libs/minio";
import { Injectable } from "@nestjs/common";
import { ConfigService as NestConfigService } from "@nestjs/config";

@Injectable()
export class ConfigService {
  constructor(private readonly configService: NestConfigService) {}

  private getNumber(key: string, fallback: number): number {
    const raw = this.configService.get<string | number>(key, fallback);
    if (typeof raw === "number") {
      return raw;
    }
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  private getBool(key: string, fallback: boolean): boolean {
    const raw = String(this.configService.get<string>(key, String(fallback)));
    return raw.toLowerCase() !== "false";
  }

  get app() {
    return {
      port: this.getNumber("APP_CLIENT_PORT", 3000),
      corsEnabled: this.getBool("CORS_ENABLED", true),
      env: this.configService.get<string>("APP_TYPE", "dev") === "prod" ? "prod" : "dev"
    };
  }

  get settings() {
    const mediaPort = this.getNumber("APP_MEDIA_PORT", 3005);
    return {
      mediaUrl: this.configService.get<string>("MEDIA_URL", `http://localhost:${mediaPort}`)
    };
  }

  get isDev() {
    return this.app.env === "dev";
  }

  get database() {
    return {
      // Keep compatibility with both old and current env keys
      url:
        this.configService.get<string>("DATABASE_URL") ??
        this.configService.getOrThrow<string>("DATABASE_URL_ACCOUNT"),
      accountUrl:
        this.configService.get<string>("DATABASE_URL_ACCOUNT") ??
        this.configService.getOrThrow<string>("DATABASE_URL")
    };
  }

  get jwt() {
    const SESSION_TTL_24H = 24 * 60 * 60;
    const raw = this.configService.get<string | number>("JWT_EXPIRES_IN", SESSION_TTL_24H);
    const expiresInSeconds =
      typeof raw === "number" ? raw : parseInt(String(raw), 10) || SESSION_TTL_24H;
    return {
      secret:
        this.configService.get<string>("JWT_SECRET_CLIENT") ??
        this.configService.getOrThrow<string>("JWT_SECRET"),
      expiresIn: expiresInSeconds
    };
  }

  get redis() {
    return {
      host: this.configService.getOrThrow<string>("REDIS_HOST"),
      port: +this.configService.getOrThrow<number>("REDIS_PORT"),
      url: this.configService.getOrThrow<string>("REDIS_URL"),
      password: this.configService.getOrThrow<string>("REDIS_PASSWORD")
    };
  }

  get rabbit() {
    return {
      url: this.configService.getOrThrow<string>("RABBITMQ_URL")
    };
  }

  get satcat() {
    return {
      count: this.getNumber("SATCAT_COUNT", 68261),
      take: this.getNumber("SATCAT_TAKE", 100),
      offset: this.getNumber("SATCAT_OFFSET", 0)
    };
  }

  get minio(): MinioConfig {
    return {
      accessKey: this.configService.getOrThrow<string>("MINIO_ACCESS_KEY"),
      endPoint: this.configService.getOrThrow<string>("MINIO_ENDPOINT"),
      port: 9000,
      secretKey: this.configService.getOrThrow<string>("MINIO_SECRET_KEY")
    };
  }

  get gatewayEmailQueue() {
    return this.configService.get<string>("GATEWAY_EMAIL_QUEUE", "gateway.email");
  }

  get pendingRegistrationTtlSeconds() {
    return 5 * 60;
  }

  get resendCodeCooldownSeconds() {
    return 60;
  }

  get registerBlockTtlSeconds() {
    return 24 * 60 * 60;
  }

  get registerIpLimitPerHour() {
    return 5;
  }

  get registerIpWindowSeconds() {
    return 3600;
  }

  get loginAttemptsPerMinute() {
    return 5;
  }

  get loginAttemptsWindowSeconds() {
    return 60;
  }

  get passwordResetAttemptsPerHour() {
    return 3;
  }

  get passwordResetAttemptsWindowSeconds() {
    return 3600;
  }

  get passwordResetTokenTtlSeconds() {
    return 15 * 60;
  }

  get changeEmailTtlSeconds() {
    return 15 * 60;
  }

  get changeEmailCooldownSeconds() {
    return 60;
  }

  get changeEmailRequestsPerHour() {
    return 3;
  }

  get changeEmailRequestsWindowSeconds() {
    return 3600;
  }

  get changeEmailCodeAttempts() {
    return 5;
  }
}
