import env from '#start/env'
import { defineConfig, transports } from '@adonisjs/mail'

export default defineConfig({
  /*
  |--------------------------------------------------------------------------
  | Mail driver padrão
  |--------------------------------------------------------------------------
  */
  default: env.get('MAIL_DRIVER', 'smtp'),

  /*
  |--------------------------------------------------------------------------
  | Configuração dos mailers
  |--------------------------------------------------------------------------
  */
  mailers: {
    smtp: transports.smtp({
      host: env.get('MAIL_HOST'),
      port: env.get('MAIL_PORT'), 
      auth: {
        user: env.get('MAIL_USERNAME'),
        pass: env.get('MAIL_PASSWORD'),
        type: 'login',
      },
      secure: false, // Gmail usa STARTTLS (porta 587)
    }),
  },
})
