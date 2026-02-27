// TanStack Query hooks for newsletter subscription

import { useMutation } from '@tanstack/react-query'
import { subscribeApi } from '@/lib/api-client'

export function useSubscribe() {
  return useMutation({
    mutationFn: subscribeApi.subscribe,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  })
}
