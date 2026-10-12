import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const forwardedHost = request.headers.get('x-forwarded-host')
      const proto = request.headers.get('x-forwarded-proto')
      const host = forwardedHost || request.headers.get('host')
      const redirectUrl = proto && host ? `${proto}://${host}${next}` : next
      return NextResponse.redirect(redirectUrl)
    }
  }

  // return the user to an error page with some instructions
  return NextResponse.redirect(new URL('/login?error=Auth+Error', request.url))
}
