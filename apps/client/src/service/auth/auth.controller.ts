import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards
} from "@nestjs/common";
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
import { AuthResponseDto, MeResponseDto } from "./dto/me-response.dto";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly userAuth: UserAuthService) {}

  @Post("register")
  @ApiOperation({ summary: "Регистрация" })
  @ApiResponse({ status: 201, description: "Пользователь создан, выдан токен", type: AuthResponseDto })
  @ApiResponse({ status: 409, description: "Логин уже занят" })
  async register(@Body() dto: RegisterDto) {
    return this.userAuth.register(dto);
  }

  @Post("login")
  @ApiOperation({ summary: "Вход" })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: "Успешная авторизация", type: AuthResponseDto })
  @ApiResponse({ status: 401, description: "Неверные учётные данные" })
  async login(@Body() dto: LoginDto) {
    return this.userAuth.login(dto);
  }


  @Post("logout")
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Выход (удалите токен на клиенте)" })
  @ApiResponse({ status: 204, description: "Успешный выход" })
  @ApiResponse({ status: 401, description: "Нет или невалидный токен" })
  logout() {}

  @Get("me")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Текущий пользователь (JWT)" })
  @ApiResponse({ status: 200, description: "Профиль текущего пользователя", type: MeResponseDto })
  @ApiResponse({ status: 401, description: "Нет или невалидный токен" })
  me(@User() user: JwtPayload) {
    return this.userAuth.me(user.sub);
  }
}
