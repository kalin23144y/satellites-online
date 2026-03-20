import { FactoryProvider, ModuleMetadata } from "@nestjs/common";
import { JwtSignOptions } from "@nestjs/jwt";

export interface AuthModuleOptions {
  secret: string;
  issuer?: string;
  audience?: string;
  expiresIn?: JwtSignOptions["expiresIn"];
}

export interface AuthModuleAsyncOptions extends Pick<ModuleMetadata, "imports"> {
  inject?: FactoryProvider["inject"];
  useFactory: (
    ...args: any[]
  ) => Promise<AuthModuleOptions> | AuthModuleOptions;
}

export interface JwtPayload {
  sub: string;
  login: string;
  role: "admin" | "user";
}
