import { IsOptional, IsString, IsNotEmpty, Matches, IsBoolean } from "class-validator"

export class NginxUpdateDto {

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  serviceName?: string
  
  @IsOptional()
  @IsString()
  @Matches(/\/[a-z-]+/)
  location?: string

  @IsOptional()
  @IsBoolean()
  websocketsEnabled?: boolean
}