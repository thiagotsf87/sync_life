import * as Sentry from '@sentry/nextjs'

export function setSentryUser(userId: string, email?: string) {
  Sentry.setUser({ id: userId, ...(email ? { email } : {}) })
}

export function clearSentryUser() {
  Sentry.setUser(null)
}

export function captureApiError(
  routeName: string,
  error: unknown,
  extra?: Record<string, unknown>,
) {
  Sentry.captureException(error, {
    tags: { api_route: routeName },
    extra,
  })
}
