import { IsOptional, IsString, IsNotEmpty } from "class-validator"

export class DockerUpdateDto {

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  serviceName?: string
}