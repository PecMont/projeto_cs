import type { HttpContext } from '@adonisjs/core/http'
import hash from '@adonisjs/core/services/hash' // Importante: Importar o Hash

export default class ProfileController {

  public async show({ view, auth }: HttpContext) {
    const user = auth.user!
    return view.render('pages/auth/profile', { user })
  }

  public async update({ request, response, session, auth }: HttpContext) {
    const user = auth.user!

    const { full_name, password, password_confirmation, current_password } = request.only([
      'full_name',
      'password',
      'password_confirmation',
      'current_password',
    ])

    // Atualiza o nome (se foi enviado)
    if (full_name) {
      user.fullName = full_name
    }

    // Lógica de troca de senha
    if (password) {
      // Verifica se a senha atual foi informada
      if (!current_password) {
        session.flash('errors', { current_password: 'Para alterar a senha, informe sua senha atual.' })
        return response.redirect().back()
      }

      // Verifica se a senha atual bate com a do banco
      const isSame = await hash.verify(user.password, current_password)
      if (!isSame) {
        session.flash('errors', { current_password: 'A senha atual está incorreta.' })
        return response.redirect().back()
      }

      //  Verifica se a confirmação bate
      if (password !== password_confirmation) {
        session.flash('errors', { password_confirmation: 'A confirmação da nova senha não confere.' })
        return response.redirect().back()
      }

      //  Define a nova senha
      user.password = password
    }

    await user.save()

    session.flash('notification', {
      type: 'success',
      message: 'Perfil atualizado com sucesso!',
    })

    return response.redirect().back()
  }
}