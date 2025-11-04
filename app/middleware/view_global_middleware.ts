import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class ViewGlobalMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    // Compartilha variáveis globais com todas as views
    ctx.view.share({
      auth: {
        isAuthenticated: ctx.auth?.isAuthenticated || false,
        user: ctx.auth?.user || null,
      },
    })

    // Segue o fluxo normal
    await next()
  }
}
