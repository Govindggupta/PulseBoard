import { useQuery } from '@tanstack/react-query'
import { pollsApi } from '../lib/polls-api'

export function usePollAnalytics(pollId: string | undefined) {
  return useQuery({
    queryKey: ['polls', pollId, 'analytics'],
    queryFn: () => pollsApi.getPollAnalytics(pollId!),
    enabled: Boolean(pollId),
    staleTime: 10 * 1000,
    refetchInterval: 5000,
  })
}