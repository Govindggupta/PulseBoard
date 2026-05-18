import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getApiErrorMessage } from '../lib/errors'
import { pollsApi } from '../lib/polls-api'

export function usePublishPoll(pollId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => pollsApi.publishPoll(pollId),
    onSuccess: (response) => {
      toast.success(response.message, { position: 'top-center' })
      // If server returned the updated poll, set it directly for instant UI update
      if (response && (response as any).poll) {
        queryClient.setQueryData(['polls', pollId], (response as any).poll)
      } else {
        queryClient.invalidateQueries({ queryKey: ['polls', pollId] })
      }
      queryClient.invalidateQueries({ queryKey: ['polls', 'mine'] })
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error))
    },
  })
}
