import { Module } from "@nestjs/common";
import { UserAuthService } from "./user-auth.service";
import { AuthController } from "./auth.controller";

@Module({
  controllers: [AuthController],
  providers: [UserAuthService]
})
export class UserAuthModule {}
