import session = require('express-session');
import process = require('process')

declare module 'express-session' {
  interface SessionData {
    user: string
  }
}

declare global {
  namespace NodeJS {
    interface ProcessEnv extends Dict<string> {
      'DOCKER_ENV': 'dev' | 'prod'
    }
  }
}