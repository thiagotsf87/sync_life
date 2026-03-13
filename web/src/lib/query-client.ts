import { QueryClient } from '@tanstack/react-query'

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,          // 1 min — data considered fresh
        gcTime: 300_000,            // 5 min — unused data kept in cache
        refetchOnWindowFocus: true,  // refresh when user returns to tab
        retry: 1,                    // retry once on failure
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined

export function getQueryClient() {
  // Server: always create a new client (no sharing between requests)
  if (typeof window === 'undefined') return makeQueryClient()

  // Browser: reuse the same client
  if (!browserQueryClient) browserQueryClient = makeQueryClient()
  return browserQueryClient
}
