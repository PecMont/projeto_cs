import type { HttpContext } from '@adonisjs/core/http'
import CartItem from '#models/cart_item'
import Product from '#models/product'
import { stripe } from '#services/stripe_service'

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

  public async checkoutCart({ auth, response }: HttpContext) {
  const user = auth.user!

  // Carregar itens do carrinho
  const items = await CartItem.query().where('user_id', user.id).preload('product')

  if (items.length === 0) {
    return response.redirect().back()
  }

  // Construir line_items para o Stripe
  const line_items = items.map((item) => ({
    price_data: {
      currency: 'brl',
      product_data: {
        name: `${item.product.name} (${item.product.side})`,
      },
      unit_amount: Math.round(Number(item.price) * 100),
    },
    quantity: item.quantity,
  }))

  // Criar sessão do Stripe
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items,
    success_url: `http://localhost:3333/checkout/success`,
    cancel_url: `http://localhost:3333/checkout/cancel?from=cart`,
  })

  return response.redirect(session.url!)
  }

}
