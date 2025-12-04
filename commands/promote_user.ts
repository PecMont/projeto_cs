import { BaseCommand, args } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import User from '#models/user'

export default class PromoteUser extends BaseCommand {
  // Nome do comando no terminal
  public static commandName = 'user:promote'
  
  // Descrição que aparece no help
  public static description = 'Torna um usuário administrador através do email'

  // Carrega a aplicação 
  public static options: CommandOptions = {
    startApp: true
  }

  
  @args.string({ description: 'Email do usuário que será promovido' })
  declare email: string

  public async run() {
    // Busca o usuário pelo email
    const user = await User.findBy('email', this.email)

    // Se não achar, avisa e para
    if (!user) {
      this.logger.error(`Usuário com email '${this.email}' não foi encontrado.`)
      return
    }

    // Verifica se já é admin
    if (user.isAdmin) {
      this.logger.warning(`O usuário '${user.fullName}' (${this.email}) já é um administrador.`)
      return
    }

    //. Promove e Salva
    user.isAdmin = true
    await user.save()

    this.logger.success(`Sucesso! O usuário '${user.fullName}' agora é um Administrador.`)
  }
}