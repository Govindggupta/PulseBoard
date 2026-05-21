import { type FormEvent, useState, type DragEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDocumentTitle } from '../hooks'
import {
  CalendarClock, ChevronRight, GripVertical, LayoutDashboard,
  Loader2, LogOut, PlusCircle, Trash2, User, X,
} from 'lucide-react'
import { toast } from 'sonner'

import { PulseBoardLogo } from '../components/brand/PulseBoardLogo'
import { DateTimePicker24h } from '../components/ui/datetimePicker'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { useAuth } from '../context/AuthContext'
import { useAnimatedNumber, useCreatePoll, useMyPolls } from '../hooks'
import type { PollResponseMode } from '../lib/polls-api'

/* ── Local question types for the builder ── */
type LocalOption = { localId: string; text: string }
type LocalQuestion = {
  localId: string
  question: string
  required: boolean
  options: LocalOption[]
}

const uid = () => crypto.randomUUID()

const emptyQuestion = (): LocalQuestion => ({
  localId: uid(),
  question: '',
  required: true,
  options: [
    { localId: uid(), text: '' },
    { localId: uid(), text: '' },
  ],
})

/* ── Animated stat card ── */
function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const display = useAnimatedNumber(value)
  return (
    <div className="rounded-xl border border-white/10 bg-white/3 p-5">
      <p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p>
      <p className={`mt-2 text-3xl font-bold tabular-nums ${color}`}>{display}</p>
    </div>
  )
}

/* ── Poll status badge ── */
function PollStatusBadge({ poll }: { poll: { isPublished: boolean; expiresAt: string } }) {
  if (!poll.isPublished) {
    return (
      <span className="shrink-0 rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-medium text-amber-300">
        Draft
      </span>
    )
  }
  const isExpired = new Date() > new Date(poll.expiresAt)
  if (isExpired) {
    return (
      <span className="shrink-0 rounded-full border border-zinc-500/40 bg-zinc-500/10 px-2.5 py-0.5 text-[11px] font-medium text-zinc-400">
        Expired
      </span>
    )
  }
  return (
    <span className="shrink-0 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-300">
      Active
    </span>
  )
}

/* ── Component ── */
export function DashboardPage() {
  useDocumentTitle('Dashboard')
  const { user: cachedUser, logout } = useAuth()
  const navigate = useNavigate()
  const { data: myPolls, isLoading: isPollsLoading, error: pollsError } = useMyPolls()
  const createPollMutation = useCreatePoll()

  const [activePanel, setActivePanel] = useState<'dashboard' | 'create'>('dashboard')

  // create-poll state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [responseMode, setResponseMode] = useState<PollResponseMode>('AUTHENTICATED')
  const [expiresAt, setExpiresAt] = useState<Date | undefined>(() => new Date(Date.now() + 86400000))
  const [questions, setQuestions] = useState<LocalQuestion[]>([emptyQuestion()])

  // question-editor modal
  const [editingQ, setEditingQ] = useState<LocalQuestion | null>(null)

  // drag state
  const [dragIdx, setDragIdx] = useState<number | null>(null)

  const user = cachedUser

  const handleSignOut = () => {
    logout()
    navigate('/signin')
  }

  /* ── Question helpers ── */
  const openEditor = (q: LocalQuestion) =>
    setEditingQ({ ...q, options: q.options.map((o) => ({ ...o })) })

  const saveQuestion = () => {
    if (!editingQ) return
    if (!editingQ.question.trim()) {
      toast.error('Question text is required')
      return
    }
    if (editingQ.options.filter((o) => o.text.trim()).length < 2) {
      toast.error('At least 2 options required')
      return
    }
    setQuestions((prev) => {
      const idx = prev.findIndex((q) => q.localId === editingQ.localId)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = editingQ
        return next
      }
      return [...prev, editingQ]
    })
    setEditingQ(null)
  }

  const deleteQuestion = (localId: string) =>
    setQuestions((prev) => prev.filter((q) => q.localId !== localId))

  const addNewQuestion = () => {
    const q = emptyQuestion()
    setQuestions((prev) => [...prev, q])
    openEditor(q)
  }

  /* ── Drag & Drop ── */
  const onDragStart = (idx: number) => (e: DragEvent) => {
    setDragIdx(idx)
    e.dataTransfer.effectAllowed = 'move'
  }
  const onDragOver = (e: DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }
  const onDrop = (targetIdx: number) => (e: DragEvent) => {
    e.preventDefault()
    if (dragIdx === null || dragIdx === targetIdx) return
    setQuestions((prev) => {
      const next = [...prev]
      const [moved] = next.splice(dragIdx, 1)
      next.splice(targetIdx, 0, moved)
      return next
    })
    setDragIdx(null)
  }

  /* ── Submit ── */
  const handleCreate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!title.trim()) {
      toast.error('Title is required')
      return
    }
    if (!expiresAt) {
      toast.error('Expiry date is required')
      return
    }
    const validQs = questions.filter(
      (q) => q.question.trim() && q.options.filter((o) => o.text.trim()).length >= 2,
    )
    if (validQs.length === 0) {
      toast.error('Add at least one question with 2 options')
      return
    }

    const poll = await createPollMutation.mutateAsync({
      title: title.trim(),
      description: description.trim() || undefined,
      responseMode,
      expiresAt: expiresAt.toISOString(),
      questions: validQs.map((q, i) => ({
        question: q.question.trim(),
        required: q.required,
        order: i + 1,
        options: q.options
          .filter((o) => o.text.trim())
          .map((o, j) => ({ text: o.text.trim(), order: j + 1 })),
      })),
    })

    navigate(`/poll/${poll.id}`)
  }

  /* ── Sidebar ── */
  const sidebar = (
    <aside className="hidden h-screen flex-col justify-between border-r border-white/10 bg-card/90 p-4 shadow-2xl shadow-black/35 md:sticky md:top-0 md:flex">
      <div>
        <div className="flex items-center gap-3 border-b border-white/10 px-1 pb-4">
          <PulseBoardLogo className="h-9 w-9 text-zinc-100" />
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Workspace</p>
            <p className="text-lg font-semibold text-zinc-50">PulseBoard</p>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          className={`mt-4 w-full justify-start text-zinc-200 hover:bg-white/10 hover:text-zinc-50 ${
            activePanel === 'dashboard' ? 'bg-white/10 text-zinc-50' : 'bg-transparent'
          }`}
          onClick={() => setActivePanel('dashboard')}
        >
          <LayoutDashboard className="h-4 w-4" /> Dashboard
        </Button>
        <Button
          type="button"
          variant="ghost"
          className={`mt-2 w-full justify-start text-zinc-200 hover:bg-white/10 hover:text-zinc-50 ${
            activePanel === 'create' ? 'bg-white/10 text-zinc-50' : 'bg-transparent'
          }`}
          onClick={() => setActivePanel('create')}
        >
          <PlusCircle className="h-4 w-4" /> Create Poll
        </Button>
      </div>
      <div className="space-y-2 border-t border-white/10 pt-3">
        <div className="flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-zinc-100">
          <User className="h-4 w-4 text-zinc-300" />
          <span className="truncate text-sm font-medium">{user?.username ?? 'User'}</span>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start text-zinc-300 hover:bg-white/10 hover:text-zinc-50"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" /> Sign out
        </Button>
      </div>
    </aside>
  )

  /* ── Dashboard View ── */
  const dashboardView = (
    <>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Polls" value={myPolls?.length ?? 0} color="text-zinc-50" />
        <StatCard label="Published" value={myPolls?.filter((p) => p.isPublished).length ?? 0} color="text-emerald-400" />
        <StatCard label="Drafts" value={myPolls?.filter((p) => !p.isPublished).length ?? 0} color="text-amber-400" />
      </div>

      {isPollsLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
        </div>
      ) : pollsError ? (
        <div className="rounded-xl border border-red-900/30 bg-red-950/10 p-6 text-center">
          <p className="text-sm text-red-400">Failed to load polls</p>
        </div>
      ) : !myPolls?.length ? (
        <div className="rounded-xl border border-white/10 bg-white/3 p-10 text-center">
          <PlusCircle className="mx-auto h-10 w-10 text-zinc-600" />
          <p className="mt-3 text-sm text-zinc-400">No polls yet. Create your first poll to get started.</p>
          <Button
            className="mt-4 bg-zinc-100 text-zinc-950 hover:bg-zinc-200"
            onClick={() => setActivePanel('create')}
          >
            <PlusCircle className="h-4 w-4" /> Create Poll
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {myPolls.map((poll) => (
            <div
              key={poll.id}
              onClick={() => navigate(`/poll/${poll.id}/edit`)}
              className="group cursor-pointer rounded-xl border border-white/10 bg-white/3 p-5 transition-all hover:border-white/20 hover:bg-white/6 hover:shadow-lg hover:shadow-black/20"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-base font-semibold text-zinc-50 line-clamp-1">{poll.title}</p>
                <PollStatusBadge poll={poll} />
              </div>
              {poll.description && (
                <p className="mt-2 text-sm text-zinc-400 line-clamp-2">{poll.description}</p>
              )}
              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500">
                <span className="inline-flex items-center gap-1">
                  <CalendarClock className="h-3 w-3" />
                  {new Date(poll.expiresAt).toLocaleDateString()}
                </span>
                <span>
                  {poll.questions.length} question{poll.questions.length !== 1 ? 's' : ''}
                </span>
                <span>{poll.responseMode.toLowerCase()}</span>
              </div>
              <div className="mt-3 flex items-center gap-1 text-xs text-zinc-500 opacity-0 transition-opacity group-hover:opacity-100">
                <span>Open</span>
                <ChevronRight className="h-3 w-3" />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="border-white/10 text-zinc-300 hover:bg-white/5"
                  onClick={(event) => {
                    event.stopPropagation()
                    navigate(`/poll/${poll.id}/edit`)
                  }}
                >
                  Edit
                </Button>
                {poll.isPublished && (
                  <>
                    <Button
                      type="button"
                      size="sm"
                      className="bg-zinc-100 text-zinc-950 hover:bg-zinc-200"
                      onClick={(event) => {
                        event.stopPropagation()
                        navigate(`/poll/${poll.id}/analytics`)
                      }}
                    >
                      Analytics
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="text-zinc-300 hover:bg-white/5 hover:text-zinc-50"
                      onClick={(event) => {
                        event.stopPropagation()
                        navigate(`/poll/${poll.id}/results`)
                      }}
                    >
                      Results
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )

  /* ── Create Poll View (Split Layout) ── */
  const createView = (
    <form onSubmit={handleCreate} className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      {/* LEFT - Poll Details */}
      <Card className="border-white/10 bg-card/90 shadow-2xl shadow-black/35">
        <CardHeader className="border-b border-white/10">
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Step 1</p>
          <CardTitle className="text-xl font-semibold text-zinc-50">Poll Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 p-6">
          <div className="grid gap-1.5">
            <label className="text-sm font-medium text-zinc-200">Title</label>
            <input
              className="h-11 rounded-md border border-white/10 bg-white/3 px-3 text-zinc-50 outline-none placeholder:text-zinc-500 focus:border-zinc-300/40"
              placeholder="Weekly product feedback"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-1.5">
            <label className="text-sm font-medium text-zinc-200">
              Description <span className="text-zinc-500">(optional)</span>
            </label>
            <textarea
              className="min-h-24 rounded-md border border-white/10 bg-white/3 px-3 py-2 text-zinc-50 outline-none placeholder:text-zinc-500 focus:border-zinc-300/40"
              placeholder="Tell participants what this poll is about"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <label className="text-sm font-medium text-zinc-200">Response Mode</label>
              <select
                className="h-11 rounded-md border border-white/10 bg-white/3 px-3 text-zinc-50 outline-none focus:border-zinc-300/40"
                value={responseMode}
                onChange={(e) => setResponseMode(e.target.value as PollResponseMode)}
              >
                <option className="bg-zinc-900" value="AUTHENTICATED">Authenticated</option>
                <option className="bg-zinc-900" value="ANONYMOUS">Anonymous</option>
              </select>
            </div>
            <div className="grid gap-1.5">
              <label className="text-sm font-medium text-zinc-200">Expires At</label>
              <DateTimePicker24h value={expiresAt} onChange={setExpiresAt} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* RIGHT - Questions */}
      <Card className="border-white/10 bg-card/90 shadow-2xl shadow-black/35">
        <CardHeader className="flex flex-row items-center justify-between border-b border-white/10">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Step 2</p>
            <CardTitle className="text-xl font-semibold text-zinc-50">Questions</CardTitle>
          </div>
          <Button
            type="button"
            size="sm"
            className="bg-zinc-100 text-zinc-950 hover:bg-zinc-200"
            onClick={addNewQuestion}
          >
            <PlusCircle className="h-4 w-4" /> Add
          </Button>
        </CardHeader>
        <CardContent className="p-4">
          {questions.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm text-zinc-500">No questions added yet.</p>
              <Button
                type="button"
                variant="ghost"
                className="mt-2 text-zinc-300"
                onClick={addNewQuestion}
              >
                <PlusCircle className="h-4 w-4" /> Add your first question
              </Button>
            </div>
          ) : (
            <div className="grid gap-2">
              {questions.map((q, idx) => (
                <div
                  key={q.localId}
                  draggable
                  onDragStart={onDragStart(idx)}
                  onDragOver={onDragOver}
                  onDrop={onDrop(idx)}
                  className={`group flex items-start gap-2 rounded-lg border border-white/10 bg-white/3 p-3 transition-all hover:border-white/20 ${
                    dragIdx === idx ? 'opacity-50' : ''
                  }`}
                >
                  <GripVertical className="mt-0.5 h-4 w-4 shrink-0 cursor-grab text-zinc-600 active:cursor-grabbing" />
                  <div className="min-w-0 flex-1 cursor-pointer" onClick={() => openEditor(q)}>
                    <p className="truncate text-sm font-medium text-zinc-100">
                      {q.question || <span className="italic text-zinc-500">Untitled question</span>}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {q.options.filter((o) => o.text.trim()).length > 0
                        ? q.options
                            .filter((o) => o.text.trim())
                            .map((o) => (
                              <span
                                key={o.localId}
                                className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-zinc-400"
                              >
                                {o.text}
                              </span>
                            ))
                        : <span className="text-[11px] italic text-zinc-600">No options</span>}
                    </div>
                  </div>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 shrink-0 text-zinc-500 opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100"
                    onClick={() => deleteQuestion(q.localId)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bottom Actions */}
      <div className="flex flex-wrap gap-3 lg:col-span-2">
        <Button
          type="submit"
          className="bg-zinc-100 text-zinc-950 hover:bg-zinc-200"
          disabled={createPollMutation.isPending}
        >
          {createPollMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Creating...
            </>
          ) : (
            <>
              <PlusCircle className="h-4 w-4" /> Create Poll
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="text-zinc-400"
          onClick={() => setActivePanel('dashboard')}
        >
          Cancel
        </Button>
      </div>
    </form>
  )

  /* ── Question Editor Modal ── */
  const editorModal = editingQ && (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditingQ(null)} />
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl shadow-black/50">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <h3 className="text-lg font-semibold text-zinc-50">Edit Question</h3>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-zinc-400 hover:text-zinc-100"
            onClick={() => setEditingQ(null)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid gap-4 p-6">
          <div className="grid gap-1.5">
            <label className="text-sm font-medium text-zinc-200">Question Text</label>
            <input
              className="h-11 rounded-md border border-white/10 bg-white/3 px-3 text-zinc-50 outline-none placeholder:text-zinc-500 focus:border-zinc-300/40"
              placeholder="e.g. How satisfied are you?"
              value={editingQ.question}
              onChange={(e) => setEditingQ({ ...editingQ, question: e.target.value })}
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={editingQ.required}
              onChange={(e) => setEditingQ({ ...editingQ, required: e.target.checked })}
              className="rounded border-white/10"
            />{' '}
            Required
          </label>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-zinc-200">Options</label>
            {editingQ.options.map((opt, i) => (
              <div key={opt.localId} className="flex gap-2">
                <input
                  className="h-10 flex-1 rounded-md border border-white/10 bg-white/3 px-3 text-zinc-50 outline-none placeholder:text-zinc-500 focus:border-zinc-300/40"
                  placeholder={`Option ${i + 1}`}
                  value={opt.text}
                  onChange={(e) => {
                    const opts = [...editingQ.options]
                    opts[i] = { ...opts[i], text: e.target.value }
                    setEditingQ({ ...editingQ, options: opts })
                  }}
                />
                {editingQ.options.length > 2 && (
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-10 w-10 shrink-0 text-zinc-500 hover:text-red-400"
                    onClick={() =>
                      setEditingQ({
                        ...editingQ,
                        options: editingQ.options.filter((_, j) => j !== i),
                      })
                    }
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="ghost"
              className="justify-start text-zinc-400 hover:text-zinc-200"
              onClick={() =>
                setEditingQ({
                  ...editingQ,
                  options: [...editingQ.options, { localId: uid(), text: '' }],
                })
              }
            >
              <PlusCircle className="h-4 w-4" /> Add Option
            </Button>
          </div>
        </div>
        <div className="flex justify-end gap-3 border-t border-white/10 px-6 py-4">
          <Button type="button" variant="ghost" className="text-zinc-400" onClick={() => setEditingQ(null)}>
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-zinc-100 text-zinc-950 hover:bg-zinc-200"
            onClick={saveQuestion}
          >
            Save Question
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <main className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <div className="mx-auto w-full md:grid md:min-h-screen md:grid-cols-[18rem_minmax(0,1fr)]">
        {sidebar}

        {/* Mobile header */}
        <div className="md:hidden px-4 pt-6">
          <div className="rounded-xl border border-white/10 bg-card/90 p-4 shadow-2xl shadow-black/35">
            <div className="flex items-center gap-3">
              <PulseBoardLogo className="h-8 w-8 text-zinc-100" />
              <p className="text-base font-semibold text-zinc-50">PulseBoard</p>
            </div>
            <div className="mt-3 flex gap-2">
              <Button
                variant="ghost"
                className={`flex-1 justify-center text-zinc-100 hover:bg-white/10 ${
                  activePanel === 'dashboard' ? 'bg-white/10' : ''
                }`}
                onClick={() => setActivePanel('dashboard')}
              >
                <LayoutDashboard className="h-4 w-4" /> Dashboard
              </Button>
              <Button
                variant="ghost"
                className={`flex-1 justify-center text-zinc-100 hover:bg-white/10 ${
                  activePanel === 'create' ? 'bg-white/10' : ''
                }`}
                onClick={() => setActivePanel('create')}
              >
                <PlusCircle className="h-4 w-4" /> Create
              </Button>
            </div>
          </div>
        </div>

        <div className="w-full px-4 py-6 pb-28 md:px-8 md:py-8 md:pb-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-zinc-50">
              {activePanel === 'create' ? 'Create New Poll' : 'Dashboard'}
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              {activePanel === 'create'
                ? 'Set up your poll details and add questions'
                : 'Manage and monitor your polls'}
            </p>
          </div>
          <div className="flex flex-col gap-6">
            {activePanel === 'create' ? createView : dashboardView}
          </div>
        </div>
      </div>

      {/* Mobile bottom bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-zinc-950/95 p-3 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-md gap-2">
          <div className="flex flex-1 items-center justify-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 text-zinc-100">
            <User className="h-4 w-4" />
            <span className="truncate text-sm font-medium">{user?.username ?? 'User'}</span>
          </div>
          <Button
            className="flex-1 justify-center bg-zinc-100 text-zinc-950 hover:bg-zinc-200"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
        </div>
      </div>

      {editorModal}
    </main>
  )
}
