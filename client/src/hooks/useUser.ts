import { useQuery } from '@tanstack/react-query'
import { authApi } from '../lib/auth-api'

export function useUser() {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authApi.getMe,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  })
}
