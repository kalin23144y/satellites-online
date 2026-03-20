import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags
} from "@nestjs/swagger";
import { JwtAuthGuard } from "@libs/auth";
import type { JwtPayload } from "@libs/auth";
import { User } from "./decorators/user.decorator";
import { UserAuthService } from "./user-auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly userAuth: UserAuthService) {}

  @Post("register")
  @ApiOperation({ summary: "Регистрация" })
  @ApiResponse({ status: 201, description: "Пользователь создан, выдан токен" })
  @ApiResponse({ status: 409, description: "Логин уже занят" })
  async register(@Body() dto: RegisterDto) {
    return this.userAuth.register(dto);
  }

  @Post("login")
  @ApiOperation({ summary: "Вход" })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: "Успешная авторизация" })
  @ApiResponse({ status: 401, description: "Неверные учётные данные" })
  async login(@Body() dto: LoginDto) {
    return this.userAuth.login(dto);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Текущий пользователь (JWT)" })
  @ApiResponse({ status: 200, description: "Данные из токена" })
  @ApiResponse({ status: 401, description: "Нет или невалидный токен" })
  me(@User() user: JwtPayload) {
    return { user };
  }
}
