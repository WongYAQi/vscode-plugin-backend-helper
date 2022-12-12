import Dockerode = require('dockerode')
import fs = require('fs')
import http = require('http')
import path = require('path')
import { createDockerFactory } from './docker'
import lodash from 'lodash'
/**
 * 读取当前机器上的文件文本信息
 * @param path 
 */
export function readFile (path: string) {
  return fs.readFileSync(path, { encoding: 'utf-8' })
}

export function sleep (ms: number) {
  return new Promise<void>((resolve, reject) => {
    setTimeout(() => {
      resolve()
    }, ms)
  })
}

export function getUserAllConfigs (username: string): Record<string, string> {
  let jsonPath = path.resolve(__dirname, './database/' + username + '.json')
  let jsonStr = fs.readFileSync(jsonPath, { encoding: 'utf-8' })
  let json = JSON.parse(jsonStr) || {}
  return json
}
export function getUserConfig (username: string, config: string) {
  let jsonPath = path.resolve(__dirname, './database/' + username + '.json')
  let jsonStr = fs.readFileSync(jsonPath, { encoding: 'utf-8' })
  let json = JSON.parse(jsonStr) || {}
  return lodash.get(json, config)
}

export function setUserConfig (username: string, config: string, value: any) {
  let jsonPath = path.resolve(__dirname, './database/' + username + '.json')
  let jsonStr = fs.readFileSync(jsonPath, { encoding: 'utf-8' })
  let json = JSON.parse(jsonStr) || {}
  let newJson = lodash.set(json, config, value)
  fs.writeFileSync(jsonPath, JSON.stringify(newJson, null, 2), { encoding: 'utf-8' })
}

export async function copyAndCreateServerPropertiesV2InDocker (username: string) {
  let docker = createDockerFactory()
  let container = await docker.checkAndCreateContainer({ name: username + '.node', img: 'node:16' })

  let backendText = fs.readFileSync(path.resolve(__dirname, './files/application-server.properties'), { encoding: 'utf-8' })
  console.log(backendText)
  const userDefaultSetting = require(path.resolve(__dirname, './files/default-user-setting.json'))
  let userConfigs = require(path.resolve(__dirname, './database/' + username + '.json'))

  const fn = (f: (obj: Record<string, any>) => string) => f(userConfigs) || f(userDefaultSetting)

  // postgres config
  backendText = backendText.replace(/spring.datasource.url=(.*?)\n/, `spring.datasource.url=jdbc:postgresql://${fn(o => o.postgres?.ip)}:${fn(o => o.postgres?.port)}/${fn(o => o.postgres?.database)}\n`)
  backendText = backendText.replace(/spring.datasource.username=(.*?)\n/, `spring.datasource.username=${fn(o => o.postgres?.username)}\n`)
  backendText = backendText.replace(/spring.datasource.password=(.*?)\n/, `spring.datasource.password=${fn(o => o.postgres?.password)}\n`)

  // redis config
  backendText = backendText.replace(/spring.redis.port=(.*?)\n/, `spring.redis.port=${fn(o => o.redis?.port)}\n`)
  backendText = backendText.replace(/spring.redis.host=(.*?)\n/, `spring.redis.host=${fn(o => o.redis?.ip)}\n`)

  // zookeeper config
  backendText = backendText.replace(/logwire.register-center-server-list=(.*?)\n/, `logwire.register-center-server-list==${fn(o => o.zookeeper?.ip)}:${fn(o => o.zookeeper?.port)}\n`)

  // rocketmq config
  backendText = backendText.replace(/logwire.mq.name-srv-address=(.*?)\n/, `logwire.mq.name-srv-address=${fn(o => o.rocketmq?.ip)}:${fn(o => o.rocketmq?.port)}\n`)

  // tenants config
  backendText = backendText.replace(/logwire.tenants\[0\].id=(.*?)\n/, `logwire.tenants[0].id=${fn(o => o.tenants?.id)}\n`)
  backendText = backendText.replace(/logwire.tenants\[0\].host=(.*?)\n/, `logwire.tenants[0].host=${fn(o => o.tenants?.host)}\n`)
  backendText = backendText.replace(/logwire.tenants\[0\].database-schema=(.*?)\n/, `logwire.tenants[0].database-schema=${fn(o => o.tenants?.["database-schema"])}\n`)
  backendText = backendText.replace(/logwire.tenants\[0\].primary-namespace=(.*?)\n/, `logwire.tenants[0].primary-namespace=${fn(o => o.tenants?.["primary-namespace"])}\n`)

  await docker.writeFile({ container, path: '/var/logwire-backend/build-output/backend/config/application-server.properties', text: '\'' + backendText.replace(/'/g, '"') + '\'' })
}

export async function copyAndCreateGatewayPropertiesV2InDocker (username: string) {
  let docker = createDockerFactory()
  let container = await docker.checkAndCreateContainer({ name: username + '.node', img: 'node:16' })

  let gatewayText = fs.readFileSync(path.resolve(__dirname, './files/application-gateway.properties'), { encoding: 'utf-8' })
  const userDefaultSetting = require(path.resolve(__dirname, './files/default-user-setting.json'))
  let userConfigs = require(path.resolve(__dirname, './database/' + username + '.json'))

  const fn = (f: (obj: Record<string, any>) => string) => f(userConfigs) || f(userDefaultSetting)

  // zookeeper config
  gatewayText = gatewayText.replace(/gateway.register-center-server-list=(.*?)\n/, `gateway.register-center-server-list=${fn(o => o.zookeeper?.ip)}:${fn(o => o.zookeeper?.port)}\n`)
  // rocketmq config
  gatewayText = gatewayText.replace(/gateway.mq.name-srv-address=(.*?)\n/, `gateway.mq.name-srv-address=${fn(o => o.rocketmq?.ip)}:${fn(o => o.rocketmq?.port)}`)

   await docker.writeFile({ container, path: '/var/logwire-backend/build-output/gateway/config/application-gateway.properties', text: '\'' + gatewayText.replace(/'/g, '"') + '\'' })
}

// 在目标服务器上，获取 node 可用的端口
export async function getAvailableNodePort (startPort = 30000) {
  const tryPortAvailable = function (port: number) {
    return new Promise((resolve, reject) => {
      let server = http.createServer().listen(port)
      server.on('listening', function () {
        server.close()
        resolve(port)
      })
      server.on('error', function (err: any) {
        if (err.code === 'EADDRINUSE') {
          resolve(tryPortAvailable(++port))
        } else {
          reject(err)
        }
      })
    })
  }
  return tryPortAvailable(startPort)
}
