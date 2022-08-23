const { exec } = require("child_process");

exec('java -jar logwire-backend-starter.jar', { cwd: './logwire-backend/backend' })