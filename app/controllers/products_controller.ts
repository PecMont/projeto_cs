import type { HttpContext } from '@adonisjs/core/http'
import Product from '#models/product'
import { createProductValidator } from '#validators/product'
import app from '@adonisjs/core/services/app'
import Image from '#models/image'
import fs from 'node:fs'
import path from 'node:path'
import { GoogleGenerativeAI } from '@google/generative-ai'
import env from '#start/env'


export default class ProductsController {
  public async index({ view }: HttpContext) {
    const products = await Product.all()

    return view.render('pages/products/index', { products })
  }

  public async show({ params, view }: HttpContext) {
  const product = await Product.query()
    .where('id', params.id)
    .preload('images') 
    .firstOrFail()

  return view.render('pages/products/show', { product })
}

  public async create({ view }: HttpContext) {
    return view.render('pages/products/create')
  }

  public async edit({ params, view }: HttpContext) {
    const product = await Product.findOrFail(params.id)

    return view.render('pages/products/create', { product })
  }

  public async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createProductValidator)

    const images = request.files('images', {
      size: '5mb',
      extnames: ['jpg', 'jpeg', 'png', 'webp'],
    })

    async function saveImages(productId: number) {
      for (const image of images) {
        if (!image.isValid) {
          console.error(image.errors)
          continue
        }

        const fileName = `${new Date().getTime()}-${image.clientName}`
        await image.move(app.makePath('public/uploads'), { name: fileName })

        await Image.create({
          name: fileName,
          productId,
        })
      }
    }
  
    // Se o checkbox foi marcado -> cria dois produtos (Direito e Esquerdo)
    if (payload.createBothSides) {
      const { side, createBothSides, ...rest } = payload

      const right = await Product.create({ ...rest, side: 'Direito' })
      const left = await Product.create({ ...rest, side: 'Esquerdo' })

      for (const image of images) {
        if (!image.isValid) {
          console.error(image.errors)
          continue
        }

        const fileName = `${new Date().getTime()}-${image.clientName}`
        await image.move(app.makePath('public/uploads'), { name: fileName })

        // cria registro para os dois produtos
        await Image.create({ name: fileName, productId: right.id })
        await Image.create({ name: fileName, productId: left.id })
      }

      return response.redirect().toRoute('products.index')
    }

    const product = await Product.create(payload)

    await saveImages(product.id)

    return response.redirect().toRoute('products.show', { id: product.id })
  }


 public async update({ params, request, response }: HttpContext) {
    const product = await Product.findOrFail(params.id)

    const payload = await request.validateUsing(createProductValidator)

    product.merge(payload)
    await product.save()

    // Pega novas imagens (se o usuário enviou)
    const images = request.files('images', {
      size: '5mb',
      extnames: ['jpg', 'jpeg', 'png', 'webp'],
    })

    for (const image of images) {
      if (!image.isValid) {
        console.error(image.errors)
        continue
      }

      const fileName = `${new Date().getTime()}-${image.clientName}`
      await image.move(app.makePath('public/uploads'), { name: fileName })

      await Image.create({
        name: fileName,
        productId: product.id,
      })
    }

    return response.redirect().toRoute('products.show', { id: product.id })
  }

  public async destroy({ params, response }: HttpContext) {
    const product = await Product.findOrFail(params.id)

    // Carrega as imagens associadas
    const images = await Image.query().where('product_id', product.id)

    // Apaga os arquivos do HD
    for (const image of images) {
      const filePath = path.join(app.makePath('public/uploads'), image.name)
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath) // remove o arquivo físico
      }
    }

    // Apaga o produto
    await product.delete()

    return response.redirect().toRoute('products.index')
  }


  public async publicIndex({ view }: HttpContext) {
    const products = await Product.query().preload('images')

    return view.render('pages/home', { products })
  }


  public async enhanceDescription({ request, response }: HttpContext) {
    const { text, productName, carManufacturer } = request.body()

    // Validação básica
    if (!text && !productName) {
      return response.badRequest({ error: 'Texto ou nome do produto necessário' })
    }

    try {
      // Inicializa o Gemini
      const genAI = new GoogleGenerativeAI(env.get('GEMINI_API_KEY', ''))
      
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

      const prompt = `
        Você é um especialista em peças automotivas e SEO para e-commerce.
        Sua tarefa é criar ou melhorar a descrição de um produto.
        
        Produto: ${productName}
        Fabricante do Carro: ${carManufacturer}
        Descrição atual (pode estar vazia): "${text}"
        
        Regras:
        1. Escreva um texto comercial e persuasivo em Português do Brasil.
        2. Se a descrição atual for curta, expanda com detalhes técnicos prováveis.
        3. Use tópicos para listar benefícios se achar necessário. 
        4. Retorne APENAS o texto da descrição, sem aspas ou introduções do tipo "Aqui está a descrição:
        5. Não utilize * no texto.
      `

      const result = await model.generateContent(prompt)
      const responseText = result.response.text()

      return response.json({ text: responseText })

    } catch (error) {
      console.error('Erro na IA:', error)
      // Retorna erro 
      return response.status(500).json({ 
        error: 'Não foi possível gerar o texto no momento. Tente novamente mais tarde.' 
      })
    }
  }
}
