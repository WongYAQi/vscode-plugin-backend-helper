const { exec } = require("child_process");

let child = exec('java -jar logwire-backend-starter.jar', { cwd: './logwire-backend/build-output/backend' })
child.stdout.on('data', data => console.log(data))
child.stderr.on('data', data => console.log(data))
