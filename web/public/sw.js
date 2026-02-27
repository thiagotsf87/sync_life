// SyncLife Service Worker v1
// Estratégia: Network-first para navegação, Cache-first para estáticos

const CACHE_NAME = 'synclife-v1'

// ── Install ──────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  // Ativa imediatamente sem esperar tabs antigas fecharem
  self.skipWaiting()
})

// ── Activate ─────────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  )
})

// ── Fetch ─────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Ignora requisições que não sejam do mesmo origin ou não sejam GET
  if (url.origin !== self.location.origin || request.method !== 'GET') {
    return
  }

  // Ignora rotas de API e Supabase
  if (url.pathname.startsWith('/api/') || url.hostname.includes('supabase')) {
    return
  }

  // Navegação: Network-first com fallback offline
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match(request).then((cached) => {
          if (cached) return cached
          // Fallback offline mínimo
          return new Response(
            `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SyncLife — Sem conexão</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{background:#03071a;color:#dff0ff;font-family:system-ui,sans-serif;
         display:flex;align-items:center;justify-content:center;min-height:100vh;
         flex-direction:column;gap:16px;padding:24px;text-align:center}
    .icon{font-size:64px;margin-bottom:8px}
    h1{font-size:22px;font-weight:700;color:#10b981}
    p{font-size:14px;color:#6e90b8;max-width:320px;line-height:1.6}
    a{color:#10b981;text-decoration:none;font-weight:600}
  </style>
</head>
<body>
  <div class="icon">📡</div>
  <h1>Sem conexão</h1>
  <p>Verifique sua internet e <a href="/">tente novamente</a>.</p>
</body>
</html>`,
            { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          )
        })
      )
    )
    return
  }

  // Estáticos (_next/static): Cache-first
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
          }
          return response
        })
      })
    )
    return
  }

  // Imagens e fontes: Cache-first com TTL implícito via versão do cache
  if (
    request.destination === 'image' ||
    request.destination === 'font' ||
    url.pathname.startsWith('/icons/')
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
          }
          return response
        })
      })
    )
  }
})
