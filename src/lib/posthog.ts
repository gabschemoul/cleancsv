import posthog from 'posthog-js'

let initialized = false

export function initPostHog() {
  if (initialized) return

  const apiKey = import.meta.env.VITE_POSTHOG_KEY

  if (!apiKey) {
    return
  }

  // Defer PostHog initialization to not block initial render
  const init = () => {
    if (initialized) return
    initialized = true

    posthog.init(apiKey, {
      api_host: 'https://eu.i.posthog.com',
      person_profiles: 'identified_only',
      capture_pageview: true,
      capture_pageleave: true,
      // Disable session recording to improve mobile performance
      disable_session_recording: true,
      // Load lazily
      loaded: (posthog) => {
        if (import.meta.env.DEV) {
          posthog.debug()
        }
      },
    })
  }

  // Use requestIdleCallback if available, otherwise setTimeout
  if ('requestIdleCallback' in window) {
    requestIdleCallback(init, { timeout: 3000 })
  } else {
    setTimeout(init, 1000)
  }
}

export { posthog }
