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


router.get('/', async ({ view }) => {
  const Product = (await import('#models/product')).default
  const products = await Product.all()
  return view.render('pages/home', { products })
})




// REGISTRO 
router.get('register', [AuthController, 'registerShow']).as('register.show')
router.post('register', [AuthController, 'register']).as('register') 

// LOGIN 
router.get('login', [AuthController, 'loginShow']).as('login.show') 
router.post('login', [AuthController, 'login']).as('login') 
router.post('logout', [AuthController, 'logout']).as('logout').use(middleware.auth())

router.get('/profile', [ProfileController, 'show']).as('profile.show').use(middleware.auth())
router.post('/profile', [ProfileController, 'update']).as('profile.update').use(middleware.auth())



router.get('/debug/users', async () => {
const User = (await import('#models/user')).default
return User.all()
})



router.resource('/products', ProductsController).as('products').use('*', [middleware.auth()])



