import { useQuery } from '@tanstack/react-query'
import { pollsApi } from '../lib/polls-api'

export function useMyPolls() {
  return useQuery({
    queryKey: ['polls', 'mine'],
    queryFn: pollsApi.getMyPolls,
    staleTime: 30 * 1000,
  })
}
