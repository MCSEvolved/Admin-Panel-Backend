import { Injectable } from '@nestjs/common';
import {NginxRo} from "./dto/nginx-ro";
import {NginxUpdateDto} from "./dto/nginx-update-dto";
import {NginxCreateDto} from "./dto/nginx-create-dto";

@Injectable()
export class NginxService {

  findAll(): NginxRo[] {
    return []
  }

  findByName(name: string): NginxRo {
    return {} as NginxRo
  }

  create(createDto: NginxCreateDto): NginxRo {
    return {} as NginxRo
  }

  update(name: string, updateDto: NginxUpdateDto): NginxRo {
    return {} as NginxRo
  }

  delete(name: string): boolean {
    return false
  }



}