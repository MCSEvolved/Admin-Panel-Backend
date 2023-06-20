import { IsNotEmpty, IsString } from "class-validator"

export class DockerCreateDto {
  @IsString()
  @IsNotEmpty()
  serviceName: string;

  @IsString()
  @IsNotEmpty()
  composeData: string;
}