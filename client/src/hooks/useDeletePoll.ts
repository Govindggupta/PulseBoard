import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getApiErrorMessage } from '../lib/errors'
import { pollsApi } from '../lib/polls-api'

export function useDeletePoll() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (pollId: string) => pollsApi.deletePoll(pollId),
    onSuccess: () => {
      toast.success('Poll deleted', { position: 'top-center' })
      queryClient.invalidateQueries({ queryKey: ['polls', 'mine'] })
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error))
    },
  })
}
