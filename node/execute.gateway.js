const { exec } = require("child_process");

exec('java -jar logwire-gateway-starter.jar', { cwd: './logwire-backend/gateway' })