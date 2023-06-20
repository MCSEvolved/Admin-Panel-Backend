import { Controller, Get, Patch, Delete, Param, Post, Body } from '@nestjs/common';
import {DockerRo} from "./dto/docker-ro";
import {DockerService} from "./docker.service";
import {DockerCreateDto} from "./dto/docker-create-dto";
import {DockerUpdateDto} from "./dto/docker-update-dto";

@Controller('docker')
export class DockerController {
  constructor(private dockerService: DockerService) {}

  @Get('/all')
  async getAllServices(): Promise<DockerRo[]> {
    return this.dockerService.findAll()
  }

  @Get('/:name')
  async getServiceById(@Param('name') name: string): Promise<DockerRo> {
    return this.dockerService.findByName(name)
  }

  @Post()
  async create(@Body() createDto: DockerCreateDto): Promise<void> {
    return this.dockerService.create(createDto)
  }

  @Patch('/:name')
  async updateById(@Param('name') name: string, @Body() updateDto: DockerUpdateDto) : Promise<void> {
    return this.dockerService.update(name, updateDto)
  }

  @Patch('/:name/start')
  async startService(@Param('name') name: string): Promise<void> {
    return this.dockerService.composeStart(name)
  }

  @Patch('/:name/stop')
  async stopService(@Param('name') name: string): Promise<void> {
    return this.dockerService.composeStop(name)
  }

  @Patch('/:name/restart')
  async restartService(@Param('name') name: string): Promise<void> {
    return this.dockerService.composeRestart(name)
  }

  @Delete('/:name')
  async deleteById(@Param('name') name: string): Promise<void> {
    return this.dockerService.delete(name)
  }

}