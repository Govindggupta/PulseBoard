import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getApiErrorMessage } from '../lib/errors'
import { pollsApi } from '../lib/polls-api'

export function usePublishPoll(pollId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => pollsApi.publishPoll(pollId),
    onSuccess: () => {
      toast.success('Poll published successfully!', { position: 'top-center' })
      queryClient.invalidateQueries({ queryKey: ['polls', pollId] })
      queryClient.invalidateQueries({ queryKey: ['polls', 'mine'] })
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error))
    },
  })
}
