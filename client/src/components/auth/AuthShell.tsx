import type { ReactNode } from 'react'
import { BarChart3, MessageSquareText, ShieldCheck, UsersRound } from 'lucide-react'

import { PulseBoardLogo } from '../brand/PulseBoardLogo'
import { Badge } from '../ui/badge'
import { Separator } from '../ui/separator'

type AuthShellProps = {
  children: ReactNode
  eyebrow: string
  title: string
  description: string
  highlight: string
}

const responseRows = [
  { label: 'Product roadmap', value: 86, color: 'bg-zinc-100' },
  { label: 'Team workflow', value: 68, color: 'bg-zinc-400' },
  { label: 'Launch readiness', value: 54, color: 'bg-zinc-600' },
]

export function AuthShell({ children, eyebrow, title, description, highlight }: AuthShellProps) {
  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <div className="relative min-h-screen">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.055)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.055)_1px,transparent_1px)] bg-[size:72px_72px] opacity-45" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),transparent_32%,rgba(113,113,122,0.1)_72%,transparent)]" />

        <div className="relative z-10 grid min-h-screen grid-cols-1 lg:grid-cols-[minmax(440px,1fr)_minmax(420px,0.86fr)]">
          <section className="flex min-h-screen items-center justify-center px-5 py-8 sm:px-8 lg:px-12">
            <div className="w-full max-w-[462px]">
              <div className="mb-8 flex items-center gap-3">
                <div className="flex items-center gap-3">
                  <PulseBoardLogo className="h-11 w-11 text-zinc-50" />
                  <div>
                    <p className="text-sm font-semibold text-zinc-50">PulseBoard</p>
                    <p className="text-xs text-muted-foreground">Feedback workspace</p>
                  </div>
                </div>
              </div>

              {children}
            </div>
          </section>

          <aside className="relative hidden min-h-screen items-center overflow-hidden border-l border-white/10 bg-zinc-950/75 px-8 py-10 lg:flex">
            <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/30 to-transparent" />

            <div className="relative z-10 w-full max-w-lg">
              <div>
                <p className="text-sm font-medium text-zinc-300">{eyebrow}</p>
                <h1 className="mt-4 max-w-lg text-4xl font-semibold leading-tight tracking-normal text-zinc-50">
                  {title}
                </h1>
                <p className="mt-4 max-w-md text-sm leading-6 text-zinc-400">{description}</p>
              </div>

              <div className="mt-8 rounded-lg border border-white/10 bg-zinc-950/80 p-4 shadow-2xl shadow-black/40 backdrop-blur">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium text-zinc-200">
                      <MessageSquareText className="h-4 w-4 text-zinc-400" />
                      Sample poll
                    </div>
                    <p className="mt-2 max-w-sm text-xl font-semibold leading-snug tracking-normal text-zinc-50">
                      What should the team prioritize next?
                    </p>
                  </div>
                  <Badge className="border-white/10 bg-white/[0.04] text-zinc-300" variant="outline">
                    {highlight}
                  </Badge>
                </div>

                <Separator className="my-5 bg-white/10" />

                <div className="space-y-4">
                  {responseRows.map((row) => (
                    <div key={row.label} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-300">{row.label}</span>
                        <span className="font-medium text-zinc-100">{row.value}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-white/10">
                        <div className={`${row.color} h-full rounded-full`} style={{ width: `${row.value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 grid grid-cols-3 gap-2">
                  <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
                    <BarChart3 className="h-4 w-4 text-zinc-400" />
                    <p className="mt-3 text-2xl font-semibold tracking-normal text-zinc-50">243</p>
                    <p className="mt-1 text-xs text-zinc-500">responses</p>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
                    <UsersRound className="h-4 w-4 text-zinc-400" />
                    <p className="mt-3 text-2xl font-semibold tracking-normal text-zinc-50">91%</p>
                    <p className="mt-1 text-xs text-zinc-500">engaged</p>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
                    <ShieldCheck className="h-4 w-4 text-zinc-400" />
                    <p className="mt-3 text-2xl font-semibold tracking-normal text-zinc-50">42</p>
                    <p className="mt-1 text-xs text-zinc-500">minutes</p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
