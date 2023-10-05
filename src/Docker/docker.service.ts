import { Injectable } from '@nestjs/common';
import { DockerRo } from "./dto/docker-ro";
import { DockerUpdateDto } from "./dto/docker-update-dto";
import { DockerCreateDto } from "./dto/docker-create-dto";
import { ConfigService } from '@nestjs/config';
import { HttpStatus } from '@nestjs/common';
import { HttpException } from '@nestjs/common';
import { exec, spawn } from "child_process";
import { parse } from 'yaml'
import { ComposeSpecification } from "./docker-compose-spec";
import { rmSync, writeFileSync } from 'fs';
import { join } from 'node:path';
import Convert from 'ansi-to-html'
const convert = new Convert()

@Injectable()
export class DockerService {
  constructor(private configService: ConfigService) { }
  public async findAll(): Promise<DockerRo[]> {
    const list: { Name: string, Status: string, ConfigFiles: string }[] = await new Promise((resolve, reject) => {
      exec('sudo docker compose ls -a --format json', (err, json) => {
        if (err) {
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
    for (const service of list) {
      if (service.serviceName === name) return service
    }
  }

  public async findLogsByName(name: string): Promise<string> {
    return new Promise((resolve) => {
      let allLogs = ""
      const cmd = spawn("/bin/docker", ['compose', '--ansi=always', '-p', name, 'logs'])
        .on("exit", () => resolve(allLogs))
      cmd.stdout.on('data', data => {
        try {
          allLogs += convert.toHtml(`${data} `)
        } catch (e) {
          console.error(e)
        }
      })
    })
  }

  public async create(createDto: DockerCreateDto): Promise<void> {
    //try to parse the yaml to make sure it is valid
    this.getYaml(createDto.composeData)
    const dir = this.configService.get<string>('DOCKER_COMPOSE_DIR')
    const ymlPath = join(dir, `${createDto.serviceName}.yml`)
    writeFileSync(ymlPath, createDto.composeData)

    return new Promise((resolve, reject) => {
      exec(`sudo docker compose -f ${ymlPath} -p ${createDto.serviceName} create --pull always`, (err) => {
        if (err) reject(new HttpException(`failed to create service, err: ${err}`, HttpStatus.INTERNAL_SERVER_ERROR))
        else resolve()
      })
    })
  }

  public async update(name: string, updateDto: DockerUpdateDto): Promise<void> {
    //try to parse the yaml to make sure it is valid
    this.getYaml(updateDto.composeData)
    const { configFilePath } = await this.findByName(name)
    writeFileSync(configFilePath, updateDto.composeData)
  }

  public async delete(name: string): Promise<void> {
    const { configFilePath } = await this.findByName(name)
    rmSync(configFilePath)

    return new Promise((resolve, reject) => {
      exec(`sudo docker compose -p ${name} down`, (err) => {
        if (err) reject(new HttpException(`failed to delete service, err: ${err}`, HttpStatus.INTERNAL_SERVER_ERROR))
        resolve()
      })
    })
  }

  public async composeStart(name: string): Promise<void> {
    return new Promise((resolve, reject) => {
      exec(`sudo docker compose -p ${name} start`, (err) => {
        if (err) reject(new HttpException(`failed to start service, err: ${err}`, HttpStatus.INTERNAL_SERVER_ERROR))
        resolve()
      })
    })
  }

  public async composeStop(name: string): Promise<void> {
    return new Promise((resolve, reject) => {
      exec(`sudo docker compose -p ${name} stop`, (err) => {
        if (err) reject(new HttpException(`failed to stop service, err: ${err}`, HttpStatus.INTERNAL_SERVER_ERROR))
        resolve()
      })
    })
  }

  public async composeRestart(name: string): Promise<void> {
    return new Promise((resolve, reject) => {
      exec(`sudo docker compose -p ${name} restart`, (err) => {
        if (err) reject(new HttpException(`failed to restart service, err: ${err}`, HttpStatus.INTERNAL_SERVER_ERROR))
        resolve()
      })
    })
  }

  public async reset(name: string): Promise<void> {
    const { configFilePath } = await this.findByName(name)
    return new Promise((resolve, reject) => {
      exec(`sudo docker compose -p ${name} down`, err => {
        if (err) reject(new HttpException(`failed to update service while removing old service, err: ${err}`, HttpStatus.INTERNAL_SERVER_ERROR))
        else
          exec(`sudo docker compose -f ${configFilePath} -p ${name} up --pull always -d`, err => {
            if (err) reject(new HttpException(`failed to update service while creating new service, err: ${err}`, HttpStatus.INTERNAL_SERVER_ERROR))
            else resolve()
          })
      })
    })
  }

  //=== utils ====================

  private getYaml(yamlString: string): ComposeSpecification {
    const composeConfig = parse(yamlString) as ComposeSpecification
    if (composeConfig.networks) {
      Object.entries(composeConfig.networks).forEach(([network_name, network]) => {
        if (network?.external && ((network.name !== undefined && network.name !== "mcs_net") || (!network.name && network_name !== "mcs_net"))) throw new HttpException(`only "mcs_net" is allowed as external network`, HttpStatus.BAD_REQUEST)
      })
    }
    if (composeConfig.volumes) {
      Object.entries(composeConfig.volumes).forEach(([volume_name, volume]) => {
        if (volume?.external && ((volume.name !== undefined && volume.name !== "firebase-cert") || (!volume.name && volume_name !== "firebase-cert"))) throw new HttpException(`only firebase-cert is allowed as external volume`, HttpStatus.BAD_REQUEST)
      })
    }
    return composeConfig;
  }

}
