import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { supabaseConfig } from './config'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    supabaseConfig.url,
    supabaseConfig.anonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Public routes — accessible without authentication
  const isPublicRoute =
    pathname === '/' ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/cadastro') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/auth')

  // Protected routes — require authentication
  const isProtectedRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/transacoes') ||
    pathname.startsWith('/configuracoes') ||
    pathname.startsWith('/financas') ||
    pathname.startsWith('/futuro') ||
    pathname.startsWith('/tempo') ||
    pathname.startsWith('/corpo') ||
    pathname.startsWith('/mente') ||
    pathname.startsWith('/patrimonio') ||
    pathname.startsWith('/carreira') ||
    pathname.startsWith('/experiencias') ||
    pathname.startsWith('/conquistas') ||
    pathname.startsWith('/onboarding')

  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users: landing page and auth pages → app
  if (user && isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/financas'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
