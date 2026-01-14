import posthog from 'posthog-js'

export function initPostHog() {
  const apiKey = import.meta.env.VITE_POSTHOG_KEY

  if (!apiKey) {
    console.warn('PostHog API key not configured')
    return
  }

  posthog.init(apiKey, {
    api_host: 'https://eu.i.posthog.com',
    person_profiles: 'identified_only',
    capture_pageview: true,
    capture_pageleave: true,
  })
}

export { posthog }
