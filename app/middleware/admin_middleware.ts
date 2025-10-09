import type { HttpContext } from '@adonisjs/core/http'

export default class AdminMiddleware {
  async handle({ auth, response }: HttpContext, next: () => Promise<void>) {
    const user = auth.user

    // Se não estiver logado ou não for admin, bloqueia
    if (!user || !user.isAdmin) {
      return response.unauthorized('Acesso restrito a administradores')
    }

    await next()
  }
}
