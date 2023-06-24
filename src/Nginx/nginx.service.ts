import { Injectable } from '@nestjs/common';
import {NginxRo} from "./dto/nginx-ro";
import {NginxUpdateDto} from "./dto/nginx-update-dto";
import {NginxCreateDto} from "./dto/nginx-create-dto";
import { readFile, writeFile } from 'fs/promises';
import { ConfigService } from '@nestjs/config';
import { HttpStatus } from '@nestjs/common';
import { HttpException } from '@nestjs/common';
import { exec } from "child_process";

@Injectable()
export class NginxService {
  constructor(private configService: ConfigService) {}
  
  private id: number = -1;

  private async getConfigContent(): Promise<string> {
    const file = await readFile(this.configService.get<string>('CONFIG_FILE_PATH'))
    return file.toString()
  }

  private parseRules(configString: string): NginxRo[] {
    const matches = configString.matchAll(
      /#id=(?<id>.*)\n\s*#serviceName=(?<serviceName>.+)\n\s*location (?<location>.+) {\n\s*proxy_pass http:\/\/localhost:(?<port>[0-9]+);.*\n.*}(?<websocketsEnabled>\n.*location \/.*\/ws .*{\n.*proxy_pass http:\/\/localhost:....\/ws;)?/g
    )
    const rules: NginxRo[] = []
    for(const match of matches) {
      rules.push({
        id: parseInt(match.groups.id),
        serviceName: match.groups.serviceName,
        location: match.groups.location,
        port: parseInt(match.groups.port),
        websocketsEnabled: !!match.groups.websocketsEnabled,
      })
    }
    return rules
  }

  private makeRule(rule: NginxRo): string {
    let ruleString = `
    #id=${rule.id}
    #serviceName=${rule.serviceName}
    location ${rule.location} {
        proxy_pass http://localhost:${rule.port};
    }`
    console.log(rule.websocketsEnabled)
    if(rule.websocketsEnabled) {
      ruleString += `
    location ${rule.location}/ws {
      proxy_pass http://localhost:${rule.port}/ws;
      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection "upgrade";
    }`
    }
    return ruleString
  }

  private async reloadServer(): Promise<void> {
    return new Promise((resolve, reject) => {
      exec('sudo /etc/init.d/nginx reload', (err) => {
        if(err) {
          console.error(err)
          reject(new HttpException('failed to reload nginx server', HttpStatus.INTERNAL_SERVER_ERROR))
        }
        resolve()
      })
    })
    

  }

  public async findAll(): Promise<NginxRo[]> {
    const content = await this.getConfigContent()
    return this.parseRules(content)
  }

  public async findById(id: number): Promise<NginxRo> {
    const rules = await this.findAll()
    return rules.find(rule => rule.id === id)
  }

  public async create(createDto: NginxCreateDto): Promise<void> {
    const content = await this.getConfigContent()
    if(this.id === -1) {
      const rules = this.parseRules(content)
      this.id = rules.reduce((acc,cur) => cur.id > acc ? cur.id : acc, -1)
    }

    this.id++

    const newRule = this.makeRule({
      id: this.id,
      port: 9000+this.id,
      ...createDto,
    })

    const currentConfig = content.match(/(?<begin>.*}).*}/s).groups.begin
    const newConfig = `${currentConfig}\n${newRule}\n}`

    await writeFile(this.configService.get<string>('CONFIG_FILE_PATH'), newConfig)
    await this.reloadServer()
  }

  public async update(id: number, updateDto: NginxUpdateDto): Promise<void> {
    let content = await this.getConfigContent()
    const rules = this.parseRules(content)
    const currentRule = rules.find(rule => rule.id === id)

    if(!currentRule) throw new HttpException(`no rule found with id ${id}`, HttpStatus.NOT_FOUND)
    
    const oldRuleString = this.makeRule(currentRule)
    const newRuleString = this.makeRule({
      id: id,
      port: currentRule.port,
      serviceName: updateDto.serviceName || currentRule.serviceName,
      location: updateDto.location || currentRule.location,
      websocketsEnabled: updateDto.websocketsEnabled
    })

    content = content.replace(oldRuleString, newRuleString)

    await writeFile(this.configService.get<string>('CONFIG_FILE_PATH'), content)
    await this.reloadServer()
  }

  public async delete(id: number): Promise<void> {
    let content = await this.getConfigContent()
    const rules = this.parseRules(content)
    const currentRule = rules.find(rule => rule.id === id)

    if(!currentRule) throw new HttpException(`no rule found with id ${id}`, HttpStatus.NOT_FOUND)
    
    const oldRuleString = this.makeRule(currentRule)
    console.log(oldRuleString)
    content = content.replace(oldRuleString, '')

    await writeFile(this.configService.get<string>('CONFIG_FILE_PATH'), content)
    await this.reloadServer()
  }

}
