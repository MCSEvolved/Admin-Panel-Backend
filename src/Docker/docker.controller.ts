import { Controller, Get, Patch, Delete, Param, Post, Body } from '@nestjs/common';
import {DockerRo} from "./dto/docker-ro";
import {DockerService} from "./docker.service";
import {DockerCreateDto} from "./dto/docker-create-dto";
import {DockerUpdateDto} from "./dto/docker-update-dto";
import { ParseIntPipe } from '@nestjs/common';

@Controller('docker')
export class DockerController {
  constructor(private dockerService: DockerService) {}

  @Get('/all')
  async getAllRules(): Promise<DockerRo[]> {
    return this.dockerService.findAll()
  }

  @Get('/:id')
  async getByName(@Param('id', new ParseIntPipe()) id: number): Promise<DockerRo> {
    return this.dockerService.findById(id)
  }

  @Post()
  async create(@Body() createDto: DockerCreateDto): Promise<void> {
    return this.dockerService.create(createDto)
  }

  @Patch('/:id')
  async updateByName(@Param('id', new ParseIntPipe()) id: number, @Body() updateDto: DockerUpdateDto) : Promise<void> {
    return this.dockerService.update(id, updateDto)
  }

  @Delete('/:id')
  async deleteByName(@Param('id', new ParseIntPipe()) id: number): Promise<void> {
    return this.dockerService.delete(id)
  }

}