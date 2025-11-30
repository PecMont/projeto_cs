// app/controllers/checkout_controller.ts
import Product from '#models/product'
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
}
