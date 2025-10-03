import type { HttpContext } from '@adonisjs/core/http'



export default class ProfileController {
  
  
  public async show({ view, auth }: HttpContext) {
    const user = auth.user!
    return view.render('pages/auth/profile', { user })
  }

  
  public async update({ request, response, session, auth }: HttpContext) {
    const user = auth.user!
    const { full_name, email, password, password_confirmation } = request.only([
      'full_name',
      'email',
      'password',
      'password_confirmation',
    ])

    // Atualiza apenas se houver mudança
    if (full_name) user.fullName = full_name
    if (email) user.email = email
    if (password && password === password_confirmation) user.password = password

    await user.save()

    session.flash('notification', {
      type: 'success',
      message: 'Perfil atualizado com sucesso!',
    })

    return response.redirect().back()
  }
}
