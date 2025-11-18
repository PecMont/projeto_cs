import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'

interface GoogleUser {
  id: string
  email: string
  name: string
  picture: string
}

export default class SocialController {
  public async redirect({ response }: HttpContext) {
    const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth'

    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
      response_type: 'code',
      scope: 'openid profile email',
      access_type: 'offline',
      prompt: 'consent',
    })

    return response.redirect(`${rootUrl}?${params.toString()}`)
  }

  public async callback({ request, response, auth }: HttpContext) {
    const code = request.qs().code

    if (!code) {
      return response.redirect('/')
    }

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        code,
        grant_type: 'authorization_code',
        redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
      }),
    })

    type TokenData = {
      access_token: string
      refresh_token?: string
      expires_in?: number
      token_type?: string
      scope?: string
      id_token?: string
    }

    const tokenData = (await tokenResponse.json()) as TokenData

    if (!tokenData || !tokenData.access_token) {
      // Failed to obtain access token from Google
      return response.redirect('/')
    }

    const googleUserResponse = await fetch(
      `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokenData.access_token}`
    )

    if (!googleUserResponse.ok) {
      return response.redirect('/')
    }

    const googleUser = (await googleUserResponse.json()) as GoogleUser

    let user = await User.findBy('email', googleUser.email)

    if (!user) {
      user = await User.create({
        email: googleUser.email,
        fullName: googleUser.name,
        password: Math.random().toString(36).slice(-10),
      })
    }

    await auth.use('web').login(user)

    return response.redirect('/')
  }
}
