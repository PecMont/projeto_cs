import type { HttpContext } from '@adonisjs/core/http'
import Product from '#models/product'

export default class SearchController {
  public async index({ request, view }: HttpContext) {
    const q = (request.input('q', '') as string).trim()

    if (!q) {
      return view.render('pages/search/results', {
        products: [],
        query: q,
      })
    }

    const likeQuery = `%${q.toLowerCase()}%`

    const products = await Product.query()
      .whereRaw('LOWER(name) LIKE ?', [likeQuery])
      .orWhereRaw('LOWER(description) LIKE ?', [likeQuery])
      .orWhereRaw('LOWER(car_manufacturer) LIKE ?', [likeQuery])
      .orWhereRaw('LOWER(side) LIKE ?', [likeQuery])
      .preload('images')

    return view.render('pages/search/results', {
      products,
      query: q,
    })
  }
}
