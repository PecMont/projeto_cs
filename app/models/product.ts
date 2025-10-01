import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

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

  @column({ columnName: 'image_name' })
  declare imageName: string | null // Mapeia para a coluna 'image_name' no BD

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}