import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import fs from 'node:fs'
import path from 'node:path'

export default class ImagesController {
  public async show({ params, response }: HttpContext) {
    const filePath = path.join(app.makePath('public/uploads'), params.name)

    // Verifica se o arquivo existe
    if (!fs.existsSync(filePath)) {
      return response.notFound('Imagem não encontrada')
    }

    // Retorna o arquivo diretamente
    return response.download(filePath)
  }
}
