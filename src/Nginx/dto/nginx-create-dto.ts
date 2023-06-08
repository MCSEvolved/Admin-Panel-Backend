import { IsBoolean, IsNotEmpty, IsString, Matches } from "class-validator"

export class NginxCreateDto {
  @IsString()
  @IsNotEmpty()
  serviceName: string
  
  @IsString()
  @Matches(/\/[a-z-]+/)
  location: string

  @IsBoolean()
  websocketsEnabled: boolean
}