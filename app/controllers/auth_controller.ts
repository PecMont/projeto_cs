import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user' 
import { registerValidator, loginValidator } from '#validators/auth' 


export default class AuthController {

// GET: Exibir formulário de registro
  public async registerShow({ view }: HttpContext) {
    return view.render('pages/auth/register')
  }

   // POST: Processar registro
  public async register({ request, response, session }: HttpContext) {
    // Valida os dados de entrada
    const payload = await request.validateUsing(registerValidator)
    const { password_confirmation, ...userData } = payload as any // Remove password_confirmation
    // Cria o usuário
    await User.create(userData)

    session.flash('notification', {
      type: 'success',
      message: 'Conta criada com sucesso! Faça login.',
    })

    // Redireciona para a página de login
    return response.redirect().toRoute('login.show')
  }

  // GET: Exibir formulário de login
  public async loginShow({ view }: HttpContext) {
    // A lógica de proteção (middleware guest) virá depois
    return view.render('pages/auth/login')
  }

  // POST: Fazer login
  public async login({ request, response, auth, session }: HttpContext) {
    try {
      const { email, password } = await request.validateUsing(loginValidator)

      // tenta autenticar
      const user = await User.verifyCredentials(email, password)
      await auth.use('web').login(user)

      // Redireciona após login
      return response.redirect('/') 
    } catch (error) {
      session.flash('errors', { login: 'Email ou senha inválidos' })
      return response.redirect().back()
    }

    

  }

  // GET: Logout
  public async logout({ auth, response }: HttpContext) {
    await auth.use('web').logout()
    return response.redirect().toRoute('login.show')
  }

}