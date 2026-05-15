import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getApiErrorMessage } from '../lib/errors'
import { pollsApi, type CreatePollRequest } from '../lib/polls-api'

export function useCreatePoll() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreatePollRequest) => pollsApi.createPoll(payload),
    onSuccess: () => {
      toast.success('Poll created successfully', { position: 'top-center' })
      queryClient.invalidateQueries({ queryKey: ['polls', 'mine'] })
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error))
    },
  })
}
