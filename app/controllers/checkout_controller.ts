// app/controllers/checkout_controller.ts
import Product from '#models/product'
import CartItem from '#models/cart_item'
import { stripe } from '#services/stripe_service'
import type { HttpContext } from '@adonisjs/core/http'

export default class CheckoutController {
  public async createSession({ params, response }: HttpContext) {
    const product = await Product.find(params.id)

    if (!product) {
      return response.status(404).json({ error: 'Produto não encontrado' })
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: product.name,
            },
            unit_amount: Math.round(product.price * 100), // Stripe exige centavos
          },
          quantity: 1,
        },
      ],
      success_url: 'http://localhost:3333/success',
      cancel_url: `http://localhost:3333/checkout/cancel?product_id=${product.id}`,
    })

    return response.json({ checkoutUrl: session.url })
  }

  public async success({ auth, request, view }: HttpContext) {
    const user = auth.user!
    const from = request.qs().from

    // Se a compra veio do carrinho → limpa o carrinho
    if (from === 'cart') {
      await CartItem.query().where('user_id', user.id).delete()
    }

    return view.render('pages/checkout/success')
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
      success_url:'http://localhost:3333/success?from=cart',
      cancel_url: `http://localhost:3333/checkout/cancel?from=cart`,
    })

    return response.redirect(session.url!)
  }

  
}
