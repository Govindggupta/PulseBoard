import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  Clock3,
  Edit3,
  ExternalLink,
  Loader2,
  Target,
  TrendingUp,
  Vote,
} from 'lucide-react'

import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { usePollAnalytics } from '../hooks'

type InsightsVariant = 'analytics' | 'results'

type PollInsightsPageProps = {
  variant: InsightsVariant
}

function formatPercent(value: number) {
  return `${value.toFixed(2)}%`
}

function InsightHeader({
  variant,
  title,
  isExpired,
  expiresAt,
  totalResponses,
  onBack,
  onEdit,
  onOpenVote,
}: {
  variant: InsightsVariant
  title: string
  isExpired: boolean
  expiresAt: string
  totalResponses: number
  onBack: () => void
  onEdit: () => void
  onOpenVote: () => void
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/4 p-6 shadow-2xl shadow-black/25">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-300">
            {variant === 'results' || isExpired ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> : <BarChart3 className="h-3.5 w-3.5 text-sky-400" />}
            {variant === 'results' || isExpired ? 'Final results' : 'Live analytics'}
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">{title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
            {variant === 'results' || isExpired
              ? 'The poll has closed. These are the final numbers recorded before the deadline.'
              : 'Monitor how responses are trending while the poll is active and close to the deadline.'}
          </p>
          <div className="mt-4 flex flex-wrap gap-3 text-xs text-zinc-500">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
              <Vote className="h-3.5 w-3.5" /> {totalResponses} response{totalResponses === 1 ? '' : 's'}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
              <Clock3 className="h-3.5 w-3.5" /> Ends {new Date(expiresAt).toLocaleString()}
            </span>
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 ${isExpired || variant === 'results' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-sky-500/30 bg-sky-500/10 text-sky-300'}`}>
              <TrendingUp className="h-3.5 w-3.5" /> {isExpired || variant === 'results' ? 'Closed' : 'Live'}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="ghost" className="border border-white/10 text-zinc-300 hover:bg-white/5 hover:text-zinc-50" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <Button type="button" variant="outline" className="border-white/10 text-zinc-200 hover:bg-white/5" onClick={onEdit}>
            <Edit3 className="h-4 w-4" /> Edit Poll
          </Button>
          <Button type="button" className="bg-zinc-100 text-zinc-950 hover:bg-zinc-200" onClick={onOpenVote}>
            <ExternalLink className="h-4 w-4" /> Open Vote Link
          </Button>
        </div>
      </div>
    </div>
  )
}

function PollInsightsPage({ variant }: PollInsightsPageProps) {
  const { pollId } = useParams<{ pollId: string }>()
  const navigate = useNavigate()
  const { data, isLoading, error } = usePollAnalytics(pollId)

  const isExpired = useMemo(() => {
    if (!data?.expiresAt) return false
    return new Date() > new Date(data.expiresAt)
  }, [data?.expiresAt])

  const voteUrl = pollId ? `${window.location.origin}/vote/${pollId}` : ''

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    )
  }

  if (error || !data || !pollId) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center text-foreground">
        <p className="text-lg font-medium text-zinc-100">Poll analytics unavailable</p>
        <p className="max-w-md text-sm text-zinc-500">You may not have access to this poll, or it no longer exists.</p>
        <Button className="bg-zinc-100 text-zinc-950 hover:bg-zinc-200" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </Button>
      </div>
    )
  }

  const totalQuestions = data.questions.length
  const topQuestion = data.questions.reduce<{ question: string; votes: number } | null>((currentBest, question) => {
    const questionVotes = question.options.reduce((sum, option) => sum + option.votes, 0)
    if (!currentBest || questionVotes > currentBest.votes) {
      return { question: question.question, votes: questionVotes }
    }
    return currentBest
  }, null)

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
        <InsightHeader
          variant={variant}
          title={data.title}
          isExpired={isExpired}
          expiresAt={data.expiresAt}
          totalResponses={data.totalResponses}
          onBack={() => navigate('/dashboard')}
          onEdit={() => navigate(`/poll/${pollId}/edit`)}
          onOpenVote={() => window.open(voteUrl, '_blank', 'noopener,noreferrer')}
        />

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Card className="border-white/10 bg-card/90 shadow-2xl shadow-black/25">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-zinc-400">Total responses</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-zinc-50">{data.totalResponses}</p>
              <p className="mt-2 text-xs text-zinc-500">Across all submitted ballots</p>
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-card/90 shadow-2xl shadow-black/25">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-zinc-400">Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-zinc-50">{totalQuestions}</p>
              <p className="mt-2 text-xs text-zinc-500">Tracked in the poll</p>
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-card/90 shadow-2xl shadow-black/25">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-zinc-400">Leading question</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="line-clamp-2 text-sm font-medium text-zinc-50">{topQuestion?.question ?? 'No votes yet'}</p>
              <p className="mt-2 text-xs text-zinc-500">
                {topQuestion ? `${topQuestion.votes} vote${topQuestion.votes === 1 ? '' : 's'} total` : 'Responses will appear here once voting starts'}
              </p>
            </CardContent>
          </Card>
        </div>

        {data.totalResponses === 0 ? (
          <Card className="mt-6 border-white/10 bg-card/90 shadow-2xl shadow-black/25">
            <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <Target className="h-10 w-10 text-zinc-600" />
              <p className="text-lg font-medium text-zinc-100">No responses yet</p>
              <p className="max-w-md text-sm text-zinc-500">
                Share the vote link to start collecting responses. This board will update automatically as votes come in.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="mt-6 grid gap-4">
            {data.questions.map((question) => {
              const questionTotal = question.options.reduce((sum, option) => sum + option.votes, 0)

              return (
                <Card key={question.questionId} className="border-white/10 bg-card/90 shadow-2xl shadow-black/25">
                  <CardHeader className="border-b border-white/10">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <CardTitle className="text-lg text-zinc-50">{question.question}</CardTitle>
                        <p className="mt-1 text-xs text-zinc-500">{question.required ? 'Required' : 'Optional'}</p>
                      </div>
                      <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300">
                        {questionTotal} total vote{questionTotal === 1 ? '' : 's'}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="grid gap-3 p-6">
                    {question.options.map((option) => (
                      <div key={option.optionId} className="grid gap-2 rounded-xl border border-white/10 bg-white/3 p-4">
                        <div className="flex items-center justify-between gap-3 text-sm">
                          <span className="min-w-0 flex-1 truncate text-zinc-100">{option.text}</span>
                          <span className="shrink-0 text-zinc-400">
                            {option.votes} vote{option.votes === 1 ? '' : 's'} · {formatPercent(option.percentage)}
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-white/5">
                          <div
                            className="h-2 rounded-full bg-linear-to-r from-zinc-100 to-emerald-400"
                            style={{ width: `${Math.max(option.percentage, option.votes > 0 ? 4 : 0)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}

export function PollAnalyticsPage() {
  return <PollInsightsPage variant="analytics" />
}

export function PollResultsPage() {
  return <PollInsightsPage variant="results" />
}