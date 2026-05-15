import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { CheckCircle2, Loader2, Vote, AlertTriangle, Clock } from 'lucide-react'
import { toast } from 'sonner'

import { PulseBoardLogo } from '../components/brand/PulseBoardLogo'
import { Button } from '../components/ui/button'
import { pollsApi } from '../lib/polls-api'
import { getApiErrorMessage } from '../lib/errors'
import { useAuth } from '../context/AuthContext'

export function PublicVotePage() {
  const { pollId } = useParams<{ pollId: string }>()
  const { isAuthenticated } = useAuth()

  const { data: poll, isLoading, error } = useQuery({
    queryKey: ['public-poll', pollId],
    queryFn: () => pollsApi.getPublicPoll(pollId!),
    enabled: Boolean(pollId),
  })

  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)

  const submitMutation = useMutation({
    mutationFn: () => {
      if (!pollId) throw new Error('No poll ID')
      const answerList = Object.entries(answers).map(([questionId, optionId]) => ({ questionId, optionId }))
      return pollsApi.submitResponse(pollId, {
        answers: answerList,
        anonymousIdentifier: poll?.responseMode === 'ANONYMOUS' ? crypto.randomUUID() : undefined,
      })
    },
    onSuccess: () => {
      setSubmitted(true)
      toast.success('Vote submitted!')
    },
    onError: (err: unknown) => {
      toast.error(getApiErrorMessage(err))
    },
  })

  const handleSubmit = () => {
    if (!poll) return
    const required = poll.questions.filter(q => q.required)
    for (const q of required) {
      if (!answers[q.id]) {
        toast.error(`Please answer: "${q.question}"`)
        return
      }
    }
    submitMutation.mutate()
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    )
  }

  if (error || !poll) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background text-foreground">
        <AlertTriangle className="h-12 w-12 text-amber-400" />
        <p className="text-lg font-medium text-zinc-200">Poll not available</p>
        <p className="text-sm text-zinc-500">This poll may not exist or hasn't been published yet.</p>
      </div>
    )
  }

  if (poll.isExpired) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background text-foreground">
        <Clock className="h-12 w-12 text-zinc-500" />
        <p className="text-lg font-medium text-zinc-200">Poll Expired</p>
        <p className="text-sm text-zinc-500">This poll is no longer accepting responses.</p>
      </div>
    )
  }

  if (poll.responseMode === 'AUTHENTICATED' && !isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background text-foreground">
        <AlertTriangle className="h-12 w-12 text-amber-400" />
        <p className="text-lg font-medium text-zinc-200">Login Required</p>
        <p className="text-sm text-zinc-500">This poll requires you to be signed in to vote.</p>
        <Button className="mt-2 bg-zinc-100 text-zinc-950 hover:bg-zinc-200" onClick={() => window.location.href = '/signin'}>Sign In</Button>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background text-foreground">
        <div className="rounded-full bg-emerald-500/10 p-4">
          <CheckCircle2 className="h-16 w-16 text-emerald-400" />
        </div>
        <p className="text-2xl font-bold text-zinc-50">Thank you!</p>
        <p className="text-sm text-zinc-400">Your response has been recorded.</p>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <PulseBoardLogo className="mx-auto h-10 w-10 text-zinc-300" />
          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-zinc-500">PulseBoard</p>
        </div>

        {/* Poll Info */}
        <div className="mb-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
            <Vote className="h-3 w-3" /> Live Poll
          </div>
          <h1 className="mt-4 text-2xl font-bold text-zinc-50">{poll.title}</h1>
          {poll.description && <p className="mt-2 text-sm text-zinc-400">{poll.description}</p>}
          <p className="mt-3 text-xs text-zinc-500">
            Expires: {new Date(poll.expiresAt).toLocaleString()} · {poll.responseMode === 'ANONYMOUS' ? 'Anonymous' : 'Authenticated'}
          </p>
        </div>

        {/* Questions */}
        <div className="grid gap-4">
          {[...poll.questions].sort((a, b) => a.order - b.order).map(q => (
            <div key={q.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-base font-medium text-zinc-100">
                {q.question}
                {q.required && <span className="ml-1 text-red-400">*</span>}
              </p>
              <div className="mt-4 grid gap-2">
                {q.options.map(opt => {
                  const isSelected = answers[q.id] === opt.id
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt.id }))}
                      className={`flex items-center gap-3 rounded-lg border p-3.5 text-left text-sm transition-all ${
                        isSelected
                          ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-200'
                          : 'border-white/10 bg-white/[0.02] text-zinc-300 hover:border-white/20 hover:bg-white/[0.05]'
                      }`}
                    >
                      <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                        isSelected ? 'border-emerald-400 bg-emerald-400' : 'border-zinc-600'
                      }`}>
                        {isSelected && <div className="h-2 w-2 rounded-full bg-zinc-900" />}
                      </div>
                      {opt.text}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Submit */}
        <div className="mt-6 flex justify-center">
          <Button
            className="bg-zinc-100 px-8 text-zinc-950 hover:bg-zinc-200"
            disabled={submitMutation.isPending}
            onClick={handleSubmit}
          >
            {submitMutation.isPending ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</>
            ) : (
              <><Vote className="h-4 w-4" /> Submit Vote</>
            )}
          </Button>
        </div>

        <p className="mt-8 text-center text-xs text-zinc-600">Powered by PulseBoard</p>
      </div>
    </main>
  )
}
