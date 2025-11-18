import { randomUUID } from 'node:crypto'
import User from '#models/user'
import PasswordResetToken from '#models/password_reset_token'
import mail from '@adonisjs/mail/services/main'
import type { HttpContext } from '@adonisjs/core/http'

export default class PasswordResetsController {
  
//Exibe o formulário de solicitação do e-mail
   
  async requestForm({ view }: HttpContext) {
    return view.render('pages/auth/forgot_password')
  }

  
//Envia e-mail com o token
   
  async sendEmail({ request, response, session }: HttpContext) {
    const email = request.input('email')
    const user = await User.findBy('email', email)

    if (!user) {
      session.flash({ error: 'Email não encontrado.' })
      return response.redirect().back()
    }

    // Gerar token
    const token = randomUUID()

    // Salvar token
    await PasswordResetToken.create({
      email,
      token,
    })

    const resetLink = `http://localhost:3333/reset-password/${token}`

    // Enviar e-mail usando template Edge
    await mail.send((message) => {
      message
        .to(email)
        .subject('Recuperação de Senha - CS Distribuidora')
        .htmlView('emails/reset_password', {
          user,
          resetLink,
        })
    })

    session.flash({
      success: 'Um e-mail foi enviado com instruções para redefinir sua senha.',
    })

    return response.redirect().back()
  }

  //Exibe o formulário de redefinição com o token
   
  async resetForm({ params, view }: HttpContext) {
    return view.render('pages/auth/reset_password', {
      token: params.token,
    })
  }

  
//Recebe a nova senha e aplica
   
  async resetPassword({ request, params, response, session }: HttpContext) {
    const tokenRecord = await PasswordResetToken.findBy('token', params.token)

    if (!tokenRecord) {
        session.flash({ error: 'Token inválido ou expirado.' })
        return response.redirect('/forgot-password')
    }

    const user = await User.findBy('email', tokenRecord.email)

    if (!user) {
        session.flash({ error: 'Usuário não encontrado.' })
        return response.redirect('/forgot-password')
    }

    const password = request.input('password')
    const passwordConfirmation = request.input('password_confirmation')

    if (password !== passwordConfirmation) {
        session.flash({ error: 'As senhas não conferem.' })
        return response.redirect('back')
    }

    user.password = password
    await user.save()

    await tokenRecord.delete()

    session.flash({ success: 'Senha alterada com sucesso! Faça login.' })
    return response.redirect('/login')
}
}
