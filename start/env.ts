import { Env } from '@adonisjs/core/env'

export default await Env.create(new URL('../', import.meta.url), {
  NODE_ENV: Env.schema.enum(['development', 'production', 'test'] as const),
  PORT: Env.schema.number(),
  APP_KEY: Env.schema.string(),
  HOST: Env.schema.string({ format: 'host' }),
  LOG_LEVEL: Env.schema.string(),

  /*
  |----------------------------------------------------------
  | Variables for configuring session package
  |----------------------------------------------------------
  */
  SESSION_DRIVER: Env.schema.enum(['cookie', 'memory'] as const),

  /*
  |----------------------------------------------------------
  | Variables for configuring the drive package
  |----------------------------------------------------------
  */
  DRIVE_DISK: Env.schema.enum(['fs'] as const),

  /*
  |----------------------------------------------------------
  | SMTP / EMAIL VARIABLES  (necessário para enviar emails)
  |----------------------------------------------------------
  */
  MAIL_DRIVER: Env.schema.enum(['smtp'] as const),
  MAIL_HOST: Env.schema.string(),
  MAIL_PORT: Env.schema.number(),
  MAIL_USERNAME: Env.schema.string(),
  MAIL_PASSWORD: Env.schema.string(),
  MAIL_FROM: Env.schema.string(),
})
