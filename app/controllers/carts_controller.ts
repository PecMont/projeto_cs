import type { HttpContext } from '@adonisjs/core/http'
import CartItem from '#models/cart_item'
import Product from '#models/product'

export default class CartController {

  // Listar itens do carrinho
  public async index({ auth, view }: HttpContext) {
    const user = auth.user!
    const items = await CartItem.query()
      .where('user_id', user.id)
      .preload('product')

    const total = items.reduce((sum, item) => sum + item.quantity * Number(item.price), 0)

    return view.render('pages/cart/index', { items, total })
  }

  // Adicionar produto ao carrinho
  public async add({ auth, params, response }: HttpContext) {
    const user = auth.user!
    const product = await Product.findOrFail(params.id)

    const existingItem = await CartItem.query()
      .where('user_id', user.id)
      .where('product_id', product.id)
      .first()

    if (existingItem) {
      existingItem.quantity++
      await existingItem.save()
    } else {
      await CartItem.create({
        userId: user.id,
        productId: product.id,
        quantity: 1,
        price: product.price,
      })
    }

    return response.redirect().back()
  }

  // Remover item
  public async remove({ auth, params, response }: HttpContext) {
    const user = auth.user!

    await CartItem.query()
      .where('user_id', user.id)
      .where('id', params.itemId)
      .delete()

    return response.redirect().back()
  }

  // Limpar carrinho
  public async clear({ auth, response }: HttpContext) {
    await CartItem.query().where('user_id', auth.user!.id).delete()
    return response.redirect().back()
  }

}
