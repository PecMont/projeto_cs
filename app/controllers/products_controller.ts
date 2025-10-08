import type { HttpContext } from '@adonisjs/core/http'

import Product from '#models/product'

import { createProductValidator } from '#validators/product'
import app from '@adonisjs/core/services/app'
import Image from '#models/image'
import fs from 'node:fs'
import path from 'node:path'


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
      extnames: ['jpg', 'jpeg', 'png'],
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
      // ignora o side do payload
      const { side, createBothSides, ...rest } = payload

      const right = await Product.create({ ...rest, side: 'Direito' })
      const left = await Product.create({ ...rest, side: 'Esquerdo' })

      await saveImages(right.id)
      await saveImages(left.id)

      return response.redirect().toRoute('products.index')
    }

    // Caso normal -> cria só um produto com o lado escolhido
     if (!payload.side) {
      return response.redirect().back()
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
      extnames: ['jpg', 'jpeg', 'png'],
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

    // Agora apaga o produto (isso também apaga os registros da tabela images)
    await product.delete()

    return response.redirect().toRoute('products.index')
  }


  public async publicIndex({ view }: HttpContext) {
    const products = await Product.query().preload('images')

    return view.render('pages/home', { products })
  }
}
