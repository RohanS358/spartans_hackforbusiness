import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  
  if (!code) {
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}?error=no_code`)
  }

  try {
    // Exchange code for access token
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
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/google/callback`,
      }),
    })

    const tokens = await tokenResponse.json()

    if (!tokens.access_token) {
      throw new Error('Failed to get access token')
    }

    // Get user info from Google
    const userResponse = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokens.access_token}`)
    const userData = await userResponse.json()

    // Store user data in your database or session
    // You can create your own user creation/login logic here
    
    // Redirect back to your app with success
    const redirectUrl = new URL(process.env.NEXTAUTH_URL!)
    redirectUrl.searchParams.append('google_auth', 'success')
    redirectUrl.searchParams.append('user_email', userData.email)
    redirectUrl.searchParams.append('user_name', userData.name)
    
    return NextResponse.redirect(redirectUrl.toString())
    
  } catch (error) {
    console.error('Google OAuth error:', error)
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}?error=oauth_failed`)
  }
}