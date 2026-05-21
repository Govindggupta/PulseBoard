import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { CheckCircle2, Loader2, Vote, AlertTriangle, BarChart3 } from 'lucide-react'
import { toast } from 'sonner'

import { useDocumentTitle } from '../hooks'
import { PulseBoardLogo } from '../components/brand/PulseBoardLogo'
import { Button } from '../components/ui/button'
import { pollsApi } from '../lib/polls-api'
import { getApiErrorMessage } from '../lib/errors'
import { useAuth } from '../context/AuthContext'
import { useAnimatedNumber } from '../hooks'

// ─── Animated result bar (mirrors PollInsightsPage OptionBar) ────────────────
function AnimatedCount({ value }: { value: number }) {
  return <>{useAnimatedNumber(value)}</>
}

function AnimatedOptionBar({ option }: { option: { text: string; votes: number; percentage: number } }) {
  const barWidth = Math.max(option.percentage, option.votes > 0 ? 4 : 0)
  return (
    <div className="grid gap-2 rounded-lg border border-white/10 bg-white/[0.02] p-3.5">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="min-w-0 flex-1 truncate text-zinc-200">{option.text}</span>
        <span className="shrink-0 tabular-nums text-zinc-500">
          <AnimatedCount value={option.votes} /> vote{option.votes === 1 ? '' : 's'} · {option.percentage.toFixed(2)}%
        </span>
      </div>
      <div className="h-2 rounded-full bg-white/5">
        <div
          className="h-2 rounded-full bg-linear-to-r from-zinc-100 to-emerald-400"
          style={{ width: `${barWidth}%`, transition: 'width 600ms cubic-bezier(0.4, 0, 0.2, 1)' }}
        />
      </div>
    </div>
  )
}

export function PublicVotePage() {
  const { pollId } = useParams<{ pollId: string }>()
  const { isAuthenticated } = useAuth()

  const anonymousIdentifier = useState(() => {
    if (typeof window === 'undefined' || !pollId) {
      return undefined
    }

    const storageKey = `pb_anonymous_identifier:${pollId}`
    const storedIdentifier = localStorage.getItem(storageKey)

    if (storedIdentifier) {
      return storedIdentifier
    }

    const nextIdentifier = crypto.randomUUID()
    localStorage.setItem(storageKey, nextIdentifier)
    return nextIdentifier
  })[0]

  const voteStateKey = pollId ? `pb_poll_voted:${pollId}` : undefined

  const { data: poll, isLoading, error } = useQuery({
    queryKey: ['public-poll', pollId],
    queryFn: () => pollsApi.getPublicPoll(pollId!, anonymousIdentifier),
    enabled: Boolean(pollId),
  })
  useDocumentTitle(poll?.title)

  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (!voteStateKey || typeof window === 'undefined') {
      return
    }

    setSubmitted(Boolean(localStorage.getItem(voteStateKey)))
  }, [voteStateKey])

  const hasAlreadyVoted = Boolean(submitted || poll?.viewerHasResponded)

  const submitMutation = useMutation({
    mutationFn: () => {
      if (!pollId) throw new Error('No poll ID')
      const answerList = Object.entries(answers).map(([questionId, optionId]) => ({ questionId, optionId }))
      return pollsApi.submitResponse(pollId, {
        answers: answerList,
        anonymousIdentifier: poll?.responseMode === 'ANONYMOUS' ? anonymousIdentifier : undefined,
      })
    },
    onSuccess: () => {
      setSubmitted(true)
      if (voteStateKey && typeof window !== 'undefined') {
        localStorage.setItem(voteStateKey, 'true')
      }
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
      <main className="min-h-screen bg-background text-foreground">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
          <div className="mb-8 text-center">
            <PulseBoardLogo className="mx-auto h-10 w-10 text-zinc-300" />
            <p className="mt-2 text-xs uppercase tracking-[0.2em] text-zinc-500">PulseBoard</p>
          </div>

          <div className="mb-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
              <BarChart3 className="h-3 w-3" /> Final Results
            </div>
            <h1 className="mt-4 text-2xl font-bold text-zinc-50">{poll.title}</h1>
            {poll.description && <p className="mt-2 text-sm text-zinc-400">{poll.description}</p>}
            <p className="mt-3 text-xs text-zinc-500">
              Closed: {new Date(poll.expiresAt).toLocaleString()} · {poll.responseMode === 'ANONYMOUS' ? 'Anonymous' : 'Authenticated'}
            </p>
          </div>

          <div className="grid gap-4">
            {(poll.results?.questions ?? []).length === 0 ? (
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 text-center text-sm text-zinc-500">
                Results are not available yet.
              </div>
            ) : (
              poll.results!.questions.map(question => (
              <div key={question.questionId} className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-base font-medium text-zinc-100">
                    {question.question}
                    {question.required && <span className="ml-1 text-red-400">*</span>}
                  </p>
                  <span className="shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300">
                    {question.options.reduce((sum, option) => sum + option.votes, 0)} vote{question.options.reduce((sum, option) => sum + option.votes, 0) === 1 ? '' : 's'}
                  </span>
                </div>
                <div className="mt-4 grid gap-2">
                  {question.options.map(option => (
                    <AnimatedOptionBar key={option.optionId} option={option} />
                  ))}
                </div>
              </div>
              ))
            )}
          </div>

          <p className="mt-8 text-center text-xs text-zinc-600">Voting has closed on this link.</p>
        </div>
      </main>
    )
  }

  if (hasAlreadyVoted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background text-foreground">
        <div className="rounded-full bg-emerald-500/10 p-4">
          <CheckCircle2 className="h-16 w-16 text-emerald-400" />
        </div>
        <p className="text-2xl font-bold text-zinc-50">Already voted</p>
        <p className="text-sm text-zinc-400">This poll does not accept another response from you.</p>
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
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4 text-center text-foreground">
        <div className="rounded-full bg-emerald-500/10 p-4">
          <CheckCircle2 className="h-16 w-16 text-emerald-400" />
        </div>
        <div>
          <p className="text-2xl font-bold text-zinc-50">Thank you!</p>
          <p className="mt-2 text-sm text-zinc-400">Your response has been recorded.</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="ghost"
            className="border border-white/10 text-zinc-300 hover:bg-white/5"
            onClick={() => window.location.href = '/'}
          >
            <PulseBoardLogo className="h-4 w-4" /> Home
          </Button>
          {poll?.isExpired && (
            <Button
              className="bg-zinc-100 text-zinc-950 hover:bg-zinc-200"
              onClick={() => window.location.href = window.location.href}
            >
              <BarChart3 className="h-4 w-4" /> View Results
            </Button>
          )}
        </div>
        <p className="text-xs text-zinc-600">Powered by PulseBoard</p>
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
