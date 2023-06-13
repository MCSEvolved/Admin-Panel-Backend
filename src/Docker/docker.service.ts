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

@Injectable()
export class DockerService {
  constructor(private configService: ConfigService) {}
  public async findAll(): Promise<DockerRo[]> {
  }

  public async findById(id: number): Promise<DockerRo> {
  }

  public async create(createDto: DockerCreateDto): Promise<void> {
  }

  public async update(id: number, updateDto: DockerUpdateDto): Promise<void> {
  }

  public async delete(id: number): Promise<void> {
  }

  public async composeUp(id: number): Promise<void> {
  }

  public async composeDown(id: number): Promise<void>{

  }

  //=== utils ====================

  private getYaml(yamlString: string) {
    const composeConfig = parse(yamlString) as ComposeSpecification
    if(composeConfig.networks) {
      Object.values(composeConfig.networks).forEach(network => {
        if(network.external && network.name === "host") throw new HttpException(`Not allowed to use host network`, HttpStatus.BAD_REQUEST)
      })
    }
  }

}
