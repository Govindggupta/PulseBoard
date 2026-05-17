import { type FormEvent, useState, useEffect, type DragEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft, BarChart3, Check, Copy, ExternalLink, GripVertical,
  Link2, Loader2, PlusCircle, Send, Trash2, X,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { DateTimePicker24h } from '../components/ui/datetimePicker'
import { usePoll, useUpdatePoll, usePublishPoll, useDeletePoll } from '../hooks'
import type { PollResponseMode } from '../lib/polls-api'

type LocalOption = { localId: string; serverId?: string; text: string }
type LocalQuestion = {
  localId: string; serverId?: string
  question: string; required: boolean; options: LocalOption[]
}

const uid = () => crypto.randomUUID()

export function PollDetailPage() {
  const { pollId } = useParams<{ pollId: string }>()
  const navigate = useNavigate()
  const { data: poll, isLoading, error } = usePoll(pollId)
  const updateMutation = useUpdatePoll(pollId ?? '')
  const publishMutation = usePublishPoll(pollId ?? '')
  const deleteMutation = useDeletePoll()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [responseMode, setResponseMode] = useState<PollResponseMode>('AUTHENTICATED')
  const [expiresAt, setExpiresAt] = useState<Date | undefined>()
  const [questions, setQuestions] = useState<LocalQuestion[]>([])
  const [editingQ, setEditingQ] = useState<LocalQuestion | null>(null)
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (poll && !initialized) {
      setTitle(poll.title)
      setDescription(poll.description ?? '')
      setResponseMode(poll.responseMode)
      setExpiresAt(new Date(poll.expiresAt))
      setQuestions(
        [...poll.questions].sort((a, b) => a.order - b.order).map(q => ({
          localId: uid(), serverId: q.id, question: q.question, required: q.required,
          options: [...q.options].sort((a, b) => a.order - b.order).map(o => ({ localId: uid(), serverId: o.id, text: o.text })),
        }))
      )
      setInitialized(true)
    }
  }, [poll, initialized])

  if (isLoading) return <div className="flex min-h-screen items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-zinc-400" /></div>
  if (error || !poll) return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background text-foreground">
      <p className="text-zinc-400">Poll not found</p>
      <Button variant="ghost" onClick={() => navigate('/dashboard')}><ArrowLeft className="h-4 w-4" /> Back</Button>
    </div>
  )

  const voteUrl = `${window.location.origin}/vote/${poll.id}`
  const analyticsUrl = `/poll/${poll.id}/analytics`
  const resultsUrl = `/poll/${poll.id}/results`
  const copyLink = async () => {
    await navigator.clipboard.writeText(voteUrl)
    setCopied(true)
    toast.success('Link copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  const openEditor = (q: LocalQuestion) => setEditingQ({ ...q, options: q.options.map(o => ({ ...o })) })
  const saveQuestion = () => {
    if (!editingQ) return
    if (!editingQ.question.trim()) { toast.error('Question text required'); return }
    if (editingQ.options.filter(o => o.text.trim()).length < 2) { toast.error('At least 2 options'); return }
    setQuestions(prev => {
      const idx = prev.findIndex(q => q.localId === editingQ.localId)
      if (idx >= 0) { const next = [...prev]; next[idx] = editingQ; return next }
      return [...prev, editingQ]
    })
    setEditingQ(null)
  }
  const deleteQuestion = (lid: string) => setQuestions(prev => prev.filter(q => q.localId !== lid))
  const addNewQuestion = () => {
    const q: LocalQuestion = { localId: uid(), question: '', required: true, options: [{ localId: uid(), text: '' }, { localId: uid(), text: '' }] }
    setQuestions(prev => [...prev, q])
    openEditor(q)
  }

  const onDragStart = (idx: number) => (e: DragEvent) => { setDragIdx(idx); e.dataTransfer.effectAllowed = 'move' }
  const onDragOver = (e: DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move' }
  const onDrop = (tgt: number) => (e: DragEvent) => {
    e.preventDefault()
    if (dragIdx === null || dragIdx === tgt) return
    setQuestions(prev => { const n = [...prev]; const [m] = n.splice(dragIdx, 1); n.splice(tgt, 0, m); return n })
    setDragIdx(null)
  }

  const handleSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!expiresAt) { toast.error('Expiry required'); return }

    const origIds = poll.questions.map(q => q.id)
    const currIds = questions.filter(q => q.serverId).map(q => q.serverId!)
    const deletedIds = origIds.filter(id => !currIds.includes(id))

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const qPayload: any[] = []
    for (const id of deletedIds) qPayload.push({ id, delete: true })

    for (const [idx, q] of questions.entries()) {
      if (q.serverId) {
        const origQ = poll.questions.find(oq => oq.id === q.serverId)
        const origOptIds = origQ?.options.map(o => o.id) ?? []
        const currOptIds = q.options.filter(o => o.serverId).map(o => o.serverId!)
        const delOpts = origOptIds.filter(id => !currOptIds.includes(id))
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const opts: any[] = []
        for (const oid of delOpts) opts.push({ id: oid, delete: true })
        for (const [oi, o] of q.options.entries()) {
          if (o.serverId) opts.push({ id: o.serverId, text: o.text.trim(), order: oi + 1 })
          else if (o.text.trim()) opts.push({ text: o.text.trim(), order: oi + 1 })
        }
        qPayload.push({ id: q.serverId, question: q.question.trim(), required: q.required, order: idx + 1, options: opts })
      } else if (q.question.trim()) {
        qPayload.push({ question: q.question.trim(), required: q.required, order: idx + 1, options: q.options.filter(o => o.text.trim()).map((o, oi) => ({ text: o.text.trim(), order: oi + 1 })) })
      }
    }

    await updateMutation.mutateAsync({ title: title.trim(), description: description.trim() || undefined, responseMode, expiresAt: expiresAt.toISOString(), questions: qPayload })
    setInitialized(false)
  }

  const handlePublish = async () => { await publishMutation.mutateAsync(); setInitialized(false) }
  const handleDelete = async () => { await deleteMutation.mutateAsync(poll.id); navigate('/dashboard') }

  const inputCls = "h-11 rounded-md border border-white/10 bg-white/[0.03] px-3 text-zinc-50 outline-none placeholder:text-zinc-500 focus:border-zinc-300/40"

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Top Bar */}
      <header className="sticky top-0 z-20 border-b border-white/10 bg-zinc-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 sm:px-6">
          <Button type="button" variant="ghost" size="sm" className="text-zinc-400 hover:text-zinc-100" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-zinc-100">{poll.title}</p>
            <p className="text-xs text-zinc-500">ID: {poll.id}</p>
          </div>
          <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${poll.isPublished ? 'border border-emerald-500/40 bg-emerald-500/10 text-emerald-300' : 'border border-amber-500/40 bg-amber-500/10 text-amber-300'}`}>
            {poll.isPublished ? 'Published' : 'Draft'}
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {/* Share Link */}
        <div className="mb-6 rounded-xl border border-white/10 bg-white/3 p-4">
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <Link2 className="h-4 w-4 shrink-0" />
            <span className="font-medium text-zinc-300">Vote Link {!poll.isPublished && <span className="text-amber-400">(publish first to enable voting)</span>}</span>
          </div>
          <div className="mt-2 flex gap-2">
            <div className="flex min-w-0 flex-1 items-center rounded-md border border-white/10 bg-white/3 px-3 py-2">
              <code className="truncate text-sm text-zinc-300">{voteUrl}</code>
            </div>
            <Button type="button" variant="outline" className="shrink-0 border-white/10 text-zinc-300" onClick={copyLink}>
              {copied ? <><Check className="h-4 w-4 text-emerald-400" /> Copied</> : <><Copy className="h-4 w-4" /> Copy</>}
            </Button>
            {poll.isPublished && (
              <Button type="button" variant="outline" className="shrink-0 border-white/10 text-zinc-300" onClick={() => window.open(voteUrl, '_blank')}>
                <ExternalLink className="h-4 w-4" /> Open
              </Button>
            )}
          </div>
          {poll.isPublished && (
            <div className="mt-3 flex flex-wrap gap-2">
              <Button type="button" size="sm" className="bg-zinc-100 text-zinc-950 hover:bg-zinc-200" onClick={() => navigate(analyticsUrl)}>
                <BarChart3 className="h-4 w-4" /> Analytics
              </Button>
              <Button type="button" size="sm" variant="ghost" className="text-zinc-300 hover:bg-white/5 hover:text-zinc-50" onClick={() => navigate(resultsUrl)}>
                Results
              </Button>
            </div>
          )}
        </div>

        {poll.isPublished ? (
          <Card className="border-white/10 bg-card/90 shadow-2xl shadow-black/35">
            <CardHeader className="border-b border-white/10"><CardTitle className="text-xl text-zinc-50">Poll Summary (Published)</CardTitle></CardHeader>
            <CardContent className="grid gap-4 p-6">
              <p className="text-sm text-zinc-400">This poll is live and cannot be edited.</p>
              <div className="grid gap-3">
                {[...poll.questions].sort((a, b) => a.order - b.order).map(q => (
                  <div key={q.id} className="rounded-lg border border-white/10 bg-white/3 p-4">
                    <p className="text-sm font-medium text-zinc-100">{q.question} {q.required && <span className="text-red-400">*</span>}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">{q.options.map(o => <span key={o.id} className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs text-zinc-400">{o.text}</span>)}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <form onSubmit={handleSave} className="grid gap-6 lg:grid-cols-2">
            {/* LEFT – Details */}
            <Card className="border-white/10 bg-card/90 shadow-2xl shadow-black/35">
              <CardHeader className="border-b border-white/10"><CardTitle className="text-xl text-zinc-50">Poll Details</CardTitle></CardHeader>
              <CardContent className="grid gap-4 p-6">
                <div className="grid gap-1.5">
                  <label className="text-sm font-medium text-zinc-200">Title</label>
                  <input className={inputCls} value={title} onChange={e => setTitle(e.target.value)} required />
                </div>
                <div className="grid gap-1.5">
                  <label className="text-sm font-medium text-zinc-200">Description</label>
                  <textarea className="min-h-24 rounded-md border border-white/10 bg-white/3 px-3 py-2 text-zinc-50 outline-none placeholder:text-zinc-500 focus:border-zinc-300/40" value={description} onChange={e => setDescription(e.target.value)} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-1.5">
                    <label className="text-sm font-medium text-zinc-200">Response Mode</label>
                    <select className={inputCls} value={responseMode} onChange={e => setResponseMode(e.target.value as PollResponseMode)}>
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

            {/* RIGHT – Questions */}
            <Card className="border-white/10 bg-card/90 shadow-2xl shadow-black/35">
              <CardHeader className="flex flex-row items-center justify-between border-b border-white/10">
                <CardTitle className="text-xl text-zinc-50">Questions</CardTitle>
                <Button type="button" size="sm" className="bg-zinc-100 text-zinc-950 hover:bg-zinc-200" onClick={addNewQuestion}><PlusCircle className="h-4 w-4" /> Add</Button>
              </CardHeader>
              <CardContent className="p-4">
                {questions.length === 0 ? (
                  <div className="py-10 text-center"><p className="text-sm text-zinc-500">No questions.</p></div>
                ) : (
                  <div className="grid gap-2">
                    {questions.map((q, idx) => (
                      <div key={q.localId} draggable onDragStart={onDragStart(idx)} onDragOver={onDragOver} onDrop={onDrop(idx)}
                        className={`group flex items-start gap-2 rounded-lg border border-white/10 bg-white/3 p-3 transition-all hover:border-white/20 ${dragIdx === idx ? 'opacity-50' : ''}`}>
                        <GripVertical className="mt-0.5 h-4 w-4 shrink-0 cursor-grab text-zinc-600" />
                        <div className="min-w-0 flex-1 cursor-pointer" onClick={() => openEditor(q)}>
                          <p className="truncate text-sm font-medium text-zinc-100">{q.question || <span className="italic text-zinc-500">Untitled</span>}</p>
                          <div className="mt-1 flex flex-wrap gap-1">{q.options.filter(o => o.text.trim()).map(o => <span key={o.localId} className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-zinc-400">{o.text}</span>)}</div>
                        </div>
                        <Button type="button" size="icon" variant="ghost" className="h-7 w-7 shrink-0 text-zinc-500 opacity-0 hover:text-red-400 group-hover:opacity-100" onClick={() => deleteQuestion(q.localId)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex flex-wrap gap-3 lg:col-span-2">
              <Button type="submit" className="bg-zinc-100 text-zinc-950 hover:bg-zinc-200" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : <><Check className="h-4 w-4" /> Save Changes</>}
              </Button>
              <Button type="button" className="bg-emerald-600 text-white hover:bg-emerald-500" disabled={publishMutation.isPending} onClick={handlePublish}>
                {publishMutation.isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Publishing...</> : <><Send className="h-4 w-4" /> Publish Poll</>}
              </Button>
              <div className="flex-1" />
              <Button type="button" variant="ghost" className="text-red-400 hover:text-red-300" onClick={handleDelete}>
                <Trash2 className="h-4 w-4" /> Delete
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* Question Editor Modal */}
      {editingQ && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditingQ(null)} />
          <div className="relative z-10 w-full max-w-lg rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <h3 className="text-lg font-semibold text-zinc-50">Edit Question</h3>
              <Button type="button" size="icon" variant="ghost" className="h-8 w-8 text-zinc-400" onClick={() => setEditingQ(null)}><X className="h-4 w-4" /></Button>
            </div>
            <div className="grid gap-4 p-6">
              <div className="grid gap-1.5">
                <label className="text-sm font-medium text-zinc-200">Question Text</label>
                <input className={inputCls} value={editingQ.question} onChange={e => setEditingQ({ ...editingQ, question: e.target.value })} />
              </div>
              <label className="flex items-center gap-2 text-sm text-zinc-300">
                <input type="checkbox" checked={editingQ.required} onChange={e => setEditingQ({ ...editingQ, required: e.target.checked })} /> Required
              </label>
              <div className="grid gap-2">
                <label className="text-sm font-medium text-zinc-200">Options</label>
                {editingQ.options.map((opt, i) => (
                  <div key={opt.localId} className="flex gap-2">
                    <input className="h-10 flex-1 rounded-md border border-white/10 bg-white/3 px-3 text-zinc-50 outline-none placeholder:text-zinc-500 focus:border-zinc-300/40" placeholder={`Option ${i + 1}`} value={opt.text}
                      onChange={e => { const o = [...editingQ.options]; o[i] = { ...o[i], text: e.target.value }; setEditingQ({ ...editingQ, options: o }) }} />
                    {editingQ.options.length > 2 && (
                      <Button type="button" size="icon" variant="ghost" className="h-10 w-10 text-zinc-500 hover:text-red-400" onClick={() => setEditingQ({ ...editingQ, options: editingQ.options.filter((_, j) => j !== i) })}><Trash2 className="h-3.5 w-3.5" /></Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="ghost" className="justify-start text-zinc-400" onClick={() => setEditingQ({ ...editingQ, options: [...editingQ.options, { localId: uid(), text: '' }] })}><PlusCircle className="h-4 w-4" /> Add Option</Button>
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t border-white/10 px-6 py-4">
              <Button type="button" variant="ghost" className="text-zinc-400" onClick={() => setEditingQ(null)}>Cancel</Button>
              <Button type="button" className="bg-zinc-100 text-zinc-950 hover:bg-zinc-200" onClick={saveQuestion}>Save Question</Button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
