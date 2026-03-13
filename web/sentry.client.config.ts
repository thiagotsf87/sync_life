import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: process.env.NODE_ENV === 'production',

  // 10% of transactions — fits free tier (5k events/month)
  tracesSampleRate: 0.1,

  // No session replays — saves quota
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,

  // Strip auth tokens and codes from URLs before sending
  beforeSend(event) {
    if (event.request?.url) {
      event.request.url = event.request.url
        .replace(/token=[^&]+/gi, 'token=[REDACTED]')
        .replace(/code=[^&]+/gi, 'code=[REDACTED]')
    }
    return event
  },
})
