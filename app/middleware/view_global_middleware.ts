import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class ViewGlobalMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    /**
     * Middleware logic goes here (before the next call)
     */
    //ctx.logger.info('Entrou no publicIndex')

    /**
     * Call next method in the pipeline and return its output
     */
    const output = await next()
    return output
  }
}
