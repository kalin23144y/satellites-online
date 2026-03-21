import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "@libs/auth";
import type { JwtPayload } from "@libs/auth";
import { PrismaService } from "@libs/database";
import * as bcrypt from "bcryptjs";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";

const SALT_ROUNDS = 10;

export type AuthUserView = {
  id: string;
  login: string;
  createdAt: Date;
};

@Injectable()
export class UserAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService
  ) {}

  async register(dto: RegisterDto): Promise<{ accessToken: string; user: AuthUserView }> {
    const existing = await this.prisma.user.findUnique({
      where: { login: dto.username }
    });
    if (existing) {
      throw new ConflictException("Пользователь с таким логином уже существует");
    }

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        login: dto.username,
        password: passwordHash
      }
    });

    const payload: JwtPayload = {
      sub: user.id,
      login: user.login,
      role: "user"
    };

    const accessToken = await this.authService.generateToken(payload);

    return {
      accessToken,
      user: this.toPublicUser(user)
    };
  }

  async login(dto: LoginDto): Promise<{ accessToken: string; user: AuthUserView }> {
    const user = await this.prisma.user.findUnique({
      where: { login: dto.username }
    });

    if (!user) {
      throw new UnauthorizedException("Неверный логин или пароль");
    }

    const ok = await bcrypt.compare(dto.password, user.password);
    if (!ok) {
      throw new UnauthorizedException("Неверный логин или пароль");
    }

    const payload: JwtPayload = {
      sub: user.id,
      login: user.login,
      role: "user"
    };

    const accessToken = await this.authService.generateToken(payload);

    return {
      accessToken,
      user: this.toPublicUser(user)
    };
  }

  private toPublicUser(user: {
    id: string;
    login: string;
    createdAt: Date;
    password: string;
  }): AuthUserView {
    return {
      id: user.id,
      login: user.login,
      createdAt: user.createdAt
    };
  }
}
