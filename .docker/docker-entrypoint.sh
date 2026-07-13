#!/bin/sh
set -e
# Support legacy NUXT_API_URL: if set and NUXT_PUBLIC_API_BASE is not, copy over.
# Nuxt only overrides runtimeConfig.public.apiBase from NUXT_PUBLIC_API_BASE.
if [ -n "$NUXT_API_URL" ] && [ -z "$NUXT_PUBLIC_API_BASE" ]; then
  export NUXT_PUBLIC_API_BASE="$NUXT_API_URL"
fi
# Support legacy FOLIGO_ANALYTICS_KEY → NUXT_PUBLIC_FOLIGO_ANALYTICS_KEY
if [ -n "$FOLIGO_ANALYTICS_KEY" ] && [ -z "$NUXT_PUBLIC_FOLIGO_ANALYTICS_KEY" ]; then
  export NUXT_PUBLIC_FOLIGO_ANALYTICS_KEY="$FOLIGO_ANALYTICS_KEY"
fi
exec "$@"
