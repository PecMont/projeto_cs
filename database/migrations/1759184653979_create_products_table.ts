import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'products'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      // Nome da balança
      table.string('name', 255).notNullable() 

      // Fabricante do carro
      table.string('car_manufacturer', 100).notNullable() 

      // Lado da peça (Direito, Esquerdo ou Ambos)
      table.enum('side', ['Direito', 'Esquerdo', 'Ambos']).notNullable()

      // Valor (price)
      table.decimal('price', 10, 2).notNullable() 

      // Descrição
      table.text('description').nullable()

      // Colunas de Data/Hora automáticas
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}