import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import Product from '#models/product'

export default class CartItem extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  // Mapeia as colunas snake_case do banco (user_id, product_id)
  @column({ columnName: 'user_id' })
  declare userId: number

  @column({ columnName: 'product_id' })
  declare productId: number

  @column()
  declare quantity: number

  @column()
  declare price: number

  @belongsTo(() => User, { foreignKey: 'userId' })
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Product, { foreignKey: 'productId' })
  declare product: BelongsTo<typeof Product>
}