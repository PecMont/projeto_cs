// app/validators/auth.ts

import vine from '@vinejs/vine'

/**
 * Validador para o Registro de novo usuário
 */
export const registerValidator = vine.compile(
  vine.object({
    full_name: vine.string().trim().maxLength(255).optional(), 
    
    // O email deve ser único e formatado corretamente
    email: vine.string().email().unique(async (db, value) => {
      const user = await db.from('users').where('email', value).first()
      return !user // Retorna true se o email não for encontrado (único)
    }),

    password: vine.string().minLength(8).confirmed(), // Pelo menos 8 caracteres
    
    // Garante que a senha de confirmação seja igual à senha
    password_confirmation: vine.string(),
  })
)

/**
 * Validador para o Login (Será usado depois)
 */
export const loginValidator = vine.compile(
  vine.object({
    email: vine.string().email(),
    password: vine.string(),
  })
)