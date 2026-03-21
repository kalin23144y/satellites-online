import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsString } from "class-validator";

export class FileParamsDto {
  @ApiProperty({
    type: String
  })
  @IsString()
  id: string;
}

export class FileUpdateActivateBodyDto {
  @ApiProperty({
    type: Boolean,
    description: "Активация файла"
  })
  @IsBoolean()
  isActive: boolean;
}

export class FileUpdateNameBodyDto {
  @ApiProperty({
    type: String,
    description: "Новое имя файла"
  })
  @IsString()
  name: string;
}
