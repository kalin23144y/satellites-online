import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AUTH_MODULE_OPTIONS } from "./auth.constants";
import type { AuthModuleOptions, JwtPayload } from "./auth.interfaces";

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(AUTH_MODULE_OPTIONS) private readonly options: AuthModuleOptions
  ) {}

  async generateToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.options.secret,
      issuer: this.options.issuer,
      audience: this.options.audience,
      expiresIn: this.options.expiresIn ?? "1h"
    });
  }

  async validateToken(token: string): Promise<JwtPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.options.secret,
        issuer: this.options.issuer,
        audience: this.options.audience
      });
      if (!payload?.sub || !payload?.login || !payload?.role) {
        throw new UnauthorizedException("Некорректное содержимое JWT");
      }
      return payload;
    } catch (e) {
      if (e instanceof UnauthorizedException) {
        throw e;
      }
      throw new UnauthorizedException("Недействительный или просроченный токен");
    }
  }
}
