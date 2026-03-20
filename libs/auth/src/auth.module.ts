import { DynamicModule, FactoryProvider, Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AUTH_MODULE_OPTIONS } from "./auth.constants";
import { AuthModuleAsyncOptions, AuthModuleOptions } from "./auth.interfaces";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { JwtStrategy } from "./jwt.strategy";

@Module({})
export class AuthModule {
  static forRootAsync(options: AuthModuleAsyncOptions): DynamicModule {
    const optionsProvider: FactoryProvider = {
      provide: AUTH_MODULE_OPTIONS,
      inject: options.inject ?? [],
      useFactory: async (...args: any[]): Promise<AuthModuleOptions> => {
        return options.useFactory(...args);
      }
    };

    return {
      module: AuthModule,
      imports: [
        ...(options.imports ?? []),
        JwtModule.registerAsync({
          inject: [AUTH_MODULE_OPTIONS],
          useFactory: (authOptions: AuthModuleOptions) => ({
            secret: authOptions.secret,
            signOptions: {
              issuer: authOptions.issuer,
              audience: authOptions.audience,
              expiresIn: authOptions.expiresIn ?? "1h"
            }
          })
        })
      ],
      providers: [optionsProvider, AuthService, JwtStrategy, JwtAuthGuard],
      exports: [AuthService, JwtAuthGuard]
    };
  }
}
