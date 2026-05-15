import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getApiErrorMessage } from '../lib/errors'
import { pollsApi, type UpdatePollRequest } from '../lib/polls-api'

export function useUpdatePoll(pollId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdatePollRequest) => pollsApi.updatePoll(pollId, payload),
    onSuccess: () => {
      toast.success('Poll updated successfully', { position: 'top-center' })
      queryClient.invalidateQueries({ queryKey: ['polls', pollId] })
      queryClient.invalidateQueries({ queryKey: ['polls', 'mine'] })
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error))
    },
  })
}
