import { Controller, Get, Patch, Delete, Param, Post, Body } from '@nestjs/common';
import {NginxRo} from "./dto/nginx-ro";
import {NginxService} from "./nginx.service";
import {NginxCreateDto} from "./dto/nginx-create-dto";
import {NginxUpdateDto} from "./dto/nginx-update-dto";

@Controller('nginx')
export class NginxController {
  constructor(private nginxService: NginxService) {}

  @Get('/all')
  getAllRules(): NginxRo[] {
    return this.nginxService.findAll()
  }

  @Get('/byName/:name')
  getByName(@Param('name') name: string): NginxRo {
    return this.nginxService.findByName(name)
  }

  @Post()
  create(@Body() createDto: NginxCreateDto): NginxRo{
    return this.nginxService.create(createDto)
  }

  @Patch('/byName/:name')
  updateByName(@Param('name') name: string, @Body() updateDto: NginxUpdateDto) : NginxRo {
    return this.nginxService.update(name, updateDto)
  }

  @Delete('/byName/:name')
  deleteByName(@Param('name') name: string): boolean {
    return this.nginxService.delete(name)
  }

}