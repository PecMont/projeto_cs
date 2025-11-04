
import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Image from './image.js'

export default class Product extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string // Nome da balança

  @column({ columnName: 'car_manufacturer' })
  declare carManufacturer: string // Fabricante do carro

  @column({ columnName: 'side' })
  declare side: 'Direito' | 'Esquerdo' | 'Ambos' // Lado da peça 

  @column()
  declare price: number // Valor 

  @column()
  declare description: string // Descrição

  @hasMany(() => Image, {
    foreignKey: 'productId'
  })
  declare images: HasMany<typeof Image>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}