import type { HttpContext } from '@adonisjs/core/http'
import Order from '#models/order'

export default class AdminSalesController {
  
  // Lista todas as vendas (Resumo)
  public async index({ view }: HttpContext) {
    // Ordena da mais recente para a mais antiga
    const sales = await Order.query()
      .preload('user')
      .orderBy('createdAt', 'desc')

    return view.render('pages/sales/index.edge', { sales })
  }

  // Mostra detalhes de uma venda específica
  public async show({ params, view }: HttpContext) {
    const sale = await Order.query()
      .where('id', params.id)
      .preload('user')      // Carrega dados do comprador
      .preload('product')   // Carrega dados do produto 
      .firstOrFail()

    return view.render('pages/sales/show.edge', { sale })
  }
}