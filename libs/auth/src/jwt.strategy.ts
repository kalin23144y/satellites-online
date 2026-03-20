import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { AUTH_MODULE_OPTIONS } from "./auth.constants";
import { AuthModuleOptions, JwtPayload } from "./auth.interfaces";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(
    @Inject(AUTH_MODULE_OPTIONS) private readonly options: AuthModuleOptions
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: options.secret,
      issuer: options.issuer,
      audience: options.audience
    });
  }

  validate(payload: JwtPayload): JwtPayload {
    if (!payload?.sub || !payload?.login || !payload?.role) {
      throw new UnauthorizedException("Invalid JWT payload");
    }

    return payload;
  }
}
