import vine from '@vinejs/vine'

/**
 * Validates the product's creation action
 */
export const createProductValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(3).maxLength(255), 
    
    carManufacturer: vine.string().trim().maxLength(100), 
    
    side: vine.enum(['Direito', 'Esquerdo', 'Ambos']).optional(),
    
    price: vine.number().positive(), 
    
    description: vine.string().trim().optional(),

    createBothSides: vine.boolean().optional(),
  })
)