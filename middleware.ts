import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Ajouter les paramètres UTM pour le tracking
  const url = request.nextUrl.clone()
  
  if (url.pathname === '/catch' && !url.searchParams.has('utm_source')) {
    url.searchParams.set('utm_source', 'qr-card')
    url.searchParams.set('utm_campaign', 'bcv2025')
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/catch'
}
