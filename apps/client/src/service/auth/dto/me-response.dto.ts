import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, IsUUID } from "class-validator";

export class MeResponseDto {
  @ApiProperty({ type: String, format: "uuid" })
  @IsUUID()
  id: string;

  @ApiProperty({ type: String })
  @IsString()
  username: string;

  @ApiProperty({ type: String, format: "email" })
  @IsEmail()
  email: string;

  @ApiProperty({ type: String })
  @IsString()
  firstName: string;

  @ApiProperty({ type: String })
  @IsString()
  lastName: string;

  @ApiProperty({ type: String })
  @IsString()
  gender: string;

  @ApiProperty({ type: String })
  @IsString()
  image: string;
}

export class AuthResponseDto {
  @ApiProperty({ type: String })
  @IsString()
  accessToken: string;

  @ApiProperty({ type: String, format: "uuid" })
  @IsUUID()
  id: string;

  @ApiProperty({ type: String })
  @IsString()
  username: string;

  @ApiProperty({ type: String, format: "email" })
  @IsEmail()
  email: string;

  @ApiProperty({ type: String })
  @IsString()
  firstName: string;

  @ApiProperty({ type: String })
  @IsString()
  lastName: string;

  @ApiProperty({ type: String })
  @IsString()
  gender: string;

  @ApiProperty({ type: String })
  @IsString()
  image: string;
}
