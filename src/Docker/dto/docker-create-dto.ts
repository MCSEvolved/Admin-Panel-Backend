import { IsLowercase, IsNotEmpty, IsString } from "class-validator"

export class DockerCreateDto {
  @IsString()
  @IsNotEmpty()
  @IsLowercase()
  serviceName: string;

  @IsString()
  @IsNotEmpty()
  composeData: string;
}