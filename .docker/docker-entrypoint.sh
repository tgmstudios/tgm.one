#!/bin/sh
set -e
# Support legacy NUXT_API_URL: if set and NUXT_PUBLIC_API_BASE is not, copy over.
# Nuxt only overrides runtimeConfig.public.apiBase from NUXT_PUBLIC_API_BASE.
if [ -n "$NUXT_API_URL" ] && [ -z "$NUXT_PUBLIC_API_BASE" ]; then
  export NUXT_PUBLIC_API_BASE="$NUXT_API_URL"
fi
exec "$@"
