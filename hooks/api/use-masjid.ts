// TanStack Query hooks for masjid operations

import { useMutation } from '@tanstack/react-query'
import { masjidApi } from '@/lib/api-client'

export function useRegisterMasjid() {
  return useMutation({
    mutationFn: masjidApi.register,
    retry: 1,
    retryDelay: 2000
  })
}
