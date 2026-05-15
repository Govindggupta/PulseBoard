import { useQuery } from '@tanstack/react-query'
import { pollsApi } from '../lib/polls-api'

export function usePoll(pollId: string | undefined) {
  return useQuery({
    queryKey: ['polls', pollId],
    queryFn: () => pollsApi.getPollById(pollId!),
    enabled: Boolean(pollId),
    staleTime: 15 * 1000,
  })
}
