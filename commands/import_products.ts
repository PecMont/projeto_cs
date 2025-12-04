import { BaseCommand } from '@adonisjs/core/ace'
import fs from 'fs'
import Product from '#models/product'


export default class ImportProducts extends BaseCommand {
  public static commandName = 'import:products'
  public static description = 'Importa produtos a partir de um arquivo TXT'

  public static options = {
    startApp: true
  }
  //Detecta se o produto é Lado Direito, Esquerdo ou Ambos
   
  private detectSide(name: string): 'Direito' | 'Esquerdo' | 'Ambos' {
  const text = name.toLowerCase()

  const rightPatterns = [
    /\bld\b/, /\bl\.?d\.?\b/, /\bdireito\b/, /\bdireita\b/,
    /\bdir\b/, /\bd\.?r\.?\b/,
  ]

  const leftPatterns = [
    /\ble\b/, /\bl\.?e\.?\b/, /\besquerdo\b/, /\besquerda\b/,
    /\besq\b/, /\be\.?s\.?\b/,
  ]

  for (const p of rightPatterns) {
    if (p.test(text)) return 'Direito'
  }

  for (const p of leftPatterns) {
    if (p.test(text)) return 'Esquerdo'
  }

  return 'Ambos'
}

  public async run() {
    const filePath = 'produtos.txt'

    const fileContent = fs.readFileSync(filePath, 'utf8')
    const lines = fileContent.split('\n')

    for (let line of lines) {
      line = line.trim()
      if (!line || line.toLowerCase().includes('inativo')) continue

      const [_, nameRaw] = line.split(';')
      if (!nameRaw) continue

      const name = nameRaw.trim()
      const side = this.detectSide(name)

      
      await Product.create({
      name: name,
      carManufacturer: 'Não definido',
      side: side as 'Direito' | 'Esquerdo' | 'Ambos',
      price: 0,
      description: name
    })

    this.logger.info(`Criado: ${name} | Lado: ${side}`)
    }

    this.logger.success('Importação concluída!')
  }
}
