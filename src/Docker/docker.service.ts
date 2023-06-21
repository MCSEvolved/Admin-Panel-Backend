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
import {join} from 'node:path';

@Injectable()
export class DockerService {
  constructor(private configService: ConfigService) {}
  public async findAll(): Promise<DockerRo[]> {
    const list: {Name: string, Status: string, ConfigFiles: string}[] = await new Promise((resolve, reject) => {
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
        configFilePath: service.ConfigFiles
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

  public async findLogsByName(name: string): Promise<string> {
    return new Promise((resolve) => {
      exec(`sudo docker compose -p ${name} logs`, (err, logs) => resolve(logs))
    })
  }

  public async create(createDto: DockerCreateDto): Promise<void> {
    //try to parse the yaml to make sure it is valid
    this.getYaml(createDto.composeData)
    const dir = this.configService.get<string>('DOCKER_COMPOSE_DIR')
    const ymlPath = join(dir, `${createDto.serviceName}.yml`)
    writeFileSync(ymlPath, createDto.composeData)
    
    return new Promise((resolve, reject) => {
      exec(`sudo docker compose -f ${ymlPath} -p ${createDto.serviceName} create`, (err) => {
        if(err) reject(new HttpException(`failed to create service, err: ${err}`, HttpStatus.INTERNAL_SERVER_ERROR))
        resolve()
      })
    })
  }

  public async update(name: string, updateDto: DockerUpdateDto): Promise<void> {
    //try to parse the yaml to make sure it is valid
    this.getYaml(updateDto.composeData)
    const {configFilePath} = await this.findByName(name)
    writeFileSync(configFilePath, updateDto.composeData)
  }

  public async delete(name: string): Promise<void> {
    const {configFilePath} = await this.findByName(name)
    rmSync(configFilePath)

    return new Promise((resolve) => {
      exec(`sudo docker compose -p ${name} down`, () => resolve())
    })
  }

  public async composeStart(name: string): Promise<void> {
    return new Promise((resolve) => {
      exec(`sudo docker compose -p ${name} start`, () => resolve())
    })
  }

  public async composeStop(name: string): Promise<void> {
    return new Promise((resolve) => {
      exec(`sudo docker compose -p ${name} stop`, () => resolve())
    })
  }

  public async composeRestart(name: string): Promise<void> {
    return new Promise((resolve) => {
      exec(`sudo docker compose -p ${name} restart`, () => resolve())
    })
  }

  //=== utils ====================

  private getYaml(yamlString: string): ComposeSpecification {
    const composeConfig = parse(yamlString) as ComposeSpecification
    if(composeConfig.networks) {
      Object.entries(composeConfig.networks).forEach(([network_name, network]) => {
        if(network?.external && ((network.name !== undefined && network.name !== "mcs_net") || (!network.name && network_name !== "mcs_net"))) throw new HttpException(`only "mcs_net" is allowed as external network`, HttpStatus.BAD_REQUEST)
      })
    }
    if(composeConfig.volumes){
      Object.values(composeConfig.volumes).forEach(volume => {
        if(volume?.external) throw new HttpException(`external volumes are not allowed`, HttpStatus.BAD_REQUEST)
      })
    }
    return composeConfig;
  }

}
