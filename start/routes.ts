/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'



import ProductsController from '#controllers/products_controller'
import AuthController from '#controllers/auth_controller'
import ProfileController from '#controllers/profile_controller'
import ImagesController from '#controllers/images_controller'
import CartController from '#controllers/carts_controller'
import SocialController from '#controllers/social_controller'
import PasswordResetsController from '#controllers/password_resets_controller'


// GOOLGE AUTH
router.get('/auth/google/redirect', [SocialController, 'redirect']).as('google.redirect')
router.get('/auth/google/callback', [SocialController, 'callback']).as('google.callback')

// HOME
router.get('/', async ({ view }) => {
  const Product = (await import('#models/product')).default
  const products = await Product.query().preload('images')
  return view.render('pages/home', { products })
})


// REGISTRO 
router.get('register', [AuthController, 'registerShow']).as('register.show')
router.post('register', [AuthController, 'register']).as('register') 

// LOGIN 
router.get('login', [AuthController, 'loginShow']).as('login.show') 
router.post('login', [AuthController, 'login']).as('login') 
router.post('logout', [AuthController, 'logout']).as('logout').use(middleware.auth())

// PERFIL
router.get('/profile', [ProfileController, 'show']).as('profile.show').use(middleware.auth())
router.post('/profile', [ProfileController, 'update']).as('profile.update').use(middleware.auth())

// IMAGENS
router.get('/images/:name', [ImagesController, 'show']).as('images.show')



// PRODUTOS 
router.group(() => {
    router.get('/products', [ProductsController, 'index']).as('products.index')
    router.get('/products/create', [ProductsController, 'create']).as('products.create')
    router.post('/products', [ProductsController, 'store']).as('products.store')
    router.get('/products/:id/edit', [ProductsController, 'edit']).as('products.edit')
    router.put('/products/:id', [ProductsController, 'update']).as('products.update')
    router.delete('/products/:id', [ProductsController, 'destroy']).as('products.destroy')
  })
  .use([middleware.auth(), middleware.admin()])

router.get('/products/:id', [ProductsController, 'show']).as('products.show')

router.get('/debug/users', async () => {
const User = (await import('#models/user')).default
return User.all()
})

router.get('/make-admin/:id', async ({ params }) => {
  const User = (await import('#models/user')).default
  const user = await User.find(params.id)

  if (!user) return { message: 'Usuário não encontrado' }

  user.isAdmin = true
  await user.save()

  return { message: `Usuário ${user.fullName} agora é admin!`, user }
})

// CARRINHO
router.group(() => {
    router.get('/cart', [CartController, 'index']).as('cart.index')
    router.post('/cart/add/:id', [CartController, 'add']).as('cart.add')
    router.delete('/cart/remove/:itemId', [CartController, 'remove']).as('cart.remove')
    router.post('/cart/clear', [CartController, 'clear']).as('cart.clear')
  })
  .use([middleware.auth()])

// REDEFINIÇÃO DE SENHA
router.get('/forgot-password', [PasswordResetsController, 'requestForm']).as('password.request')
router.post('/forgot-password', [PasswordResetsController, 'sendEmail']).as('password.email')
router.get('/reset-password/:token', [PasswordResetsController, 'resetForm']).as('password.reset')
router.post('/reset-password/:token', [PasswordResetsController, 'resetPassword']).as('password.update')