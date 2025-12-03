// app/controllers/orders_controller.ts
import type { HttpContext } from '@adonisjs/core/http'
import Order from '#models/order'

export default class OrdersController {
  /** Lista todas as compras do usuário autenticado */
  public async index({ auth, view }: HttpContext) {
    const orders = await Order
      .query()
      .where('user_id', auth.user!.id)
      .orderBy('created_at', 'desc')

    return view.render('pages/checkout/orders', { orders })
  }
}
