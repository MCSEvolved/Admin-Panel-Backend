import { Controller, Get, Patch, Delete, Param, Post, Body } from '@nestjs/common';
import {NginxRo} from "./dto/nginx-ro";
import {NginxService} from "./nginx.service";
import {NginxCreateDto} from "./dto/nginx-create-dto";
import {NginxUpdateDto} from "./dto/nginx-update-dto";
import { ParseIntPipe } from '@nestjs/common';

@Controller('nginx')
export class NginxController {
  constructor(private nginxService: NginxService) {}

  @Get('/all')
  async getAllRules(): Promise<NginxRo[]> {
    return this.nginxService.findAll()
  }

  @Get('/:id')
  async getByName(@Param('id', new ParseIntPipe()) id: number): Promise<NginxRo> {
    return this.nginxService.findById(id)
  }

  @Post()
  async create(@Body() createDto: NginxCreateDto): Promise<void> {
    return this.nginxService.create(createDto)
  }

  @Patch('/:id')
  async updateByName(@Param('id', new ParseIntPipe()) id: number, @Body() updateDto: NginxUpdateDto) : Promise<void> {
    return this.nginxService.update(id, updateDto)
  }

  @Delete('/:id')
  async deleteByName(@Param('id', new ParseIntPipe()) id: number): Promise<void> {
    return this.nginxService.delete(id)
  }

}