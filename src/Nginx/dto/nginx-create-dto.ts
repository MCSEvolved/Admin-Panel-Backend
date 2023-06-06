export interface NginxCreateDto {
  serviceName: string
  location: string
  port: number
  websocketsEnabled: boolean
}