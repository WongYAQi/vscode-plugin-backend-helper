import { createDockerFactory } from './docker'

function main () {
  let docker = createDockerFactory()
  docker?.getContainers().then(res => {
    console.log('list containers: ', res)
  })
}
main()