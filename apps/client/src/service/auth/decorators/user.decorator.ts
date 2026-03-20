import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException
} from "@nestjs/common";
import type { JwtPayload } from "@libs/auth";

export const User = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayload => {
    const request = ctx.switchToHttp().getRequest<{ user?: JwtPayload }>();
    const user = request.user;
    if (!user) {
      throw new UnauthorizedException("Требуется авторизация");
    }
    return user;
  }
);
