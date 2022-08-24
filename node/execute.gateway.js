const { exec } = require("child_process");

let child = exec('java -jar logwire-gateway-starter.jar', { cwd: './logwire-backend/build-output/gateway' })
child.stdout.on('data', data => console.log(data))
child.stderr.on('data', data => console.log(data))
