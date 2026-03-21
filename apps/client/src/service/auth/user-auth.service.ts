import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "@libs/auth";
import type { JwtPayload } from "@libs/auth";
import { PrismaService } from "@libs/database";
import * as bcrypt from "bcryptjs";
import { fakerRU as faker } from "@faker-js/faker";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { AuthResponseDto, MeResponseDto } from "./dto/me-response.dto";

const SALT_ROUNDS = 10;

export type AuthUserView = MeResponseDto;

@Injectable()
export class UserAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const existing = await this.prisma.user.findUnique({
      where: { login: dto.username }
    });
    if (existing) {
      throw new ConflictException("Пользователь с таким логином уже существует");
    }

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const profile = this.generateProfile();

    const user = await this.prisma.user.create({
      data: {
        login: dto.username,
        password: passwordHash,
        email: profile.email,
        firstName: profile.firstName,
        lastName: profile.lastName,
        gender: profile.gender,
        image: profile.image
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
      ...this.toPublicUser(user)
    };
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
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
      ...this.toPublicUser(user)
    };
  }

  private toPublicUser(user: {
    id: string;
    login: string;
    email: string;
    firstName: string;
    lastName: string;
    gender: string;
    image: string;
  }): AuthUserView {
    return {
      id: user.id,
      username: user.login,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      gender: user.gender,
      image: user.image
    };
  }

  async me(userId: string): Promise<MeResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId
      }
    });

    if (!user) {
      throw new UnauthorizedException("Пользователь не найден");
    }

    return this.toPublicUser(user);
  }

  private generateProfile(): Pick<AuthUserView, "email" | "firstName" | "lastName" | "gender" | "image"> {
    const gender = faker.helpers.arrayElement(["male", "female"] as const);
    const firstName = faker.person.firstName(gender);
    const lastName = faker.person.lastName(gender);

    return {
      email: faker.internet.email({ provider: "example.com" }).toLowerCase(),
      firstName,
      lastName,
      gender,
      image: faker.image.avatar()
    };
  }
}
