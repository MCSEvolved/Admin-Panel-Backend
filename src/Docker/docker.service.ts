import { Injectable } from '@nestjs/common';
import {DockerRo} from "./dto/docker-ro";
import {DockerUpdateDto} from "./dto/docker-update-dto";
import {DockerCreateDto} from "./dto/docker-create-dto";
import { readFile, writeFile } from 'fs/promises';
import { ConfigService } from '@nestjs/config';
import { HttpStatus } from '@nestjs/common';
import { HttpException } from '@nestjs/common';
import { exec } from "child_process";
import { parse } from 'yaml'
import {ComposeSpecification} from "./docker-compose-spec";
import { rmSync, writeFileSync } from 'fs';
import path from 'node:path';

@Injectable()
export class DockerService {
  constructor(private configService: ConfigService) {}
  public async findAll(): Promise<DockerRo[]> {
    const list: {Name: string, Status: string}[] = await new Promise((resolve, reject) => {
      exec('sudo docker compose ls -a --format json', (err, json) => {
        if(err) {
          console.error(err)
          reject(new HttpException('failed to list services', HttpStatus.INTERNAL_SERVER_ERROR))
        }
        resolve(JSON.parse(json))
      })
    })

    const ro: DockerRo[] = []
    list.forEach(service => {
      ro.push({
        serviceName: service.Name,
        status: service.Status,
      })
    })

    return ro
  }

  public async findByName(name: string): Promise<DockerRo> {
    const list = await this.findAll()
    for(const service of list) {
      if(service.serviceName === name) return service
    }
  }

  public async create(createDto: DockerCreateDto): Promise<void> {
    //try to parse the yaml to make sure it is valid
    this.getYaml(createDto.composeData)
    const dir = this.configService.get<string>('DOCKER_COMPOSE_DIR')
    const ymlPath = path.join(dir, `${createDto.serviceName}.yml`)
    writeFileSync(ymlPath, createDto.composeData)
    
    return new Promise((resolve) => {
      exec(`sudo docker compose -f ${ymlPath} -p ${createDto.serviceName} create`, () => resolve())
    })
  }

  public async update(name: string, updateDto: DockerUpdateDto): Promise<void> {
    //try to parse the yaml to make sure it is valid
    this.getYaml(updateDto.composeData)
    const dir = this.configService.get<string>('DOCKER_COMPOSE_DIR')
    const ymlPath = path.join(dir, `${name}.yml`)
    writeFileSync(ymlPath, updateDto.composeData)
  }

  public async delete(name: string): Promise<void> {
    const dir = this.configService.get<string>('DOCKER_COMPOSE_DIR')
    const ymlPath = path.join(dir, `${name}.yml`)
    rmSync(ymlPath)

    return new Promise((resolve) => {
      exec(`sudo docker compose down -p ${name}`, () => resolve())
    })
  }

  public async composeStart(name: string): Promise<void> {
    return new Promise((resolve) => {
      exec(`sudo docker compose start -p ${name}`, () => resolve())
    })
  }

  public async composeStop(name: string): Promise<void> {
    return new Promise((resolve) => {
      exec(`sudo docker compose stop -p ${name}`, () => resolve())
    })
  }

  public async composeRestart(name: string): Promise<void> {
    return new Promise((resolve) => {
      exec(`sudo docker compose restart -p ${name}`, () => resolve())
    })
  }

  //=== utils ====================

  private getYaml(yamlString: string): ComposeSpecification {
    const composeConfig = parse(yamlString) as ComposeSpecification
    if(composeConfig.networks) {
      Object.values(composeConfig.networks).forEach(network => {
        if(network.external) throw new HttpException(`external networks are not allowed`, HttpStatus.BAD_REQUEST)
      })
    }
    if(composeConfig.volumes){
      Object.values(composeConfig.volumes).forEach(volume => {
        if(volume.external) throw new HttpException(`external volumes are not allowed`, HttpStatus.BAD_REQUEST)
      })
    }
    return composeConfig;
  }

}
