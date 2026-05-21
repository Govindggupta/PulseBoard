import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { socket } from '../lib/socket'
import type { PollAnalyticsResponse } from '../lib/polls-api'

type LiveUpdate = {
  pollId: string
  totalResponses: number
  questions: Array<{
    questionId: string
    options: Array<{ optionId: string; votes: number }>
  }>
}

/**
 * Connects to the poll's socket.io room and merges live vote updates
 * directly into the React Query cache so the UI updates instantly.
 */
export function usePollSocket(pollId: string | undefined) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!pollId) return

    // Connect (no-op if already connected)
    socket.connect()
    socket.emit('join_poll', pollId)

    const handleUpdate = (update: LiveUpdate) => {
      if (update.pollId !== pollId) return

      queryClient.setQueryData<PollAnalyticsResponse>(
        ['polls', pollId, 'analytics'],
        (prev) => {
          if (!prev) return prev

          // Build a vote lookup: questionId → optionId → votes
          const votesMap = new Map<string, Map<string, number>>()
          for (const q of update.questions) {
            const optMap = new Map<string, number>()
            for (const o of q.options) {
              optMap.set(o.optionId, o.votes)
            }
            votesMap.set(q.questionId, optMap)
          }

          const updatedQuestions = prev.questions.map((question) => {
            const optMap = votesMap.get(question.questionId)
            if (!optMap) return question

            const updatedOptions = question.options.map((option) => {
              const votes = optMap.get(option.optionId) ?? option.votes
              const percentage =
                update.totalResponses === 0
                  ? 0
                  : Number(((votes / update.totalResponses) * 100).toFixed(2))
              return { ...option, votes, percentage }
            })

            return { ...question, options: updatedOptions }
          })

          return {
            ...prev,
            totalResponses: update.totalResponses,
            questions: updatedQuestions,
          }
        },
      )
    }

    socket.on('poll_response_update', handleUpdate)

    return () => {
      socket.off('poll_response_update', handleUpdate)
      socket.emit('leave_poll', pollId)
      // Disconnect only if no other rooms are active
      socket.disconnect()
    }
  }, [pollId, queryClient])
}
