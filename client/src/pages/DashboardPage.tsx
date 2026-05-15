import { useNavigate } from 'react-router-dom'
import { LayoutDashboard, LogOut, Mail, User } from 'lucide-react'

import { PulseBoardLogo } from '../components/brand/PulseBoardLogo'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { useAuth } from '../context/AuthContext'
import { useUser } from '../hooks'

export function DashboardPage() {
  const { user: cachedUser, logout } = useAuth()
  const navigate = useNavigate()
  const { data: freshUser, isLoading, error } = useUser()

  const user = freshUser || cachedUser

  const handleSignOut = () => {
    logout()
    navigate('/signin')
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <div className="mx-auto w-full md:grid md:min-h-screen md:grid-cols-[18rem_minmax(0,1fr)]">
        <aside className="hidden h-screen flex-col justify-between border-r border-white/10 bg-card/90 p-4 shadow-2xl shadow-black/35 md:sticky md:top-0 md:flex">
          <div>
            <div className="flex items-center gap-3 border-b border-white/10 px-1 pb-4">
              <PulseBoardLogo className="h-9 w-9 text-zinc-100" />
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Workspace</p>
                <p className="text-lg font-semibold text-zinc-50">PulseBoard</p>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-white/10 bg-white/3 p-3">
              <div className="flex items-center gap-2 text-zinc-200">
                <LayoutDashboard className="h-4 w-4 text-zinc-300" />
                <span className="text-sm font-medium">Dashboard</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 border-t border-white/10 pt-3">
            <div className="flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-zinc-100">
              <User className="h-4 w-4 text-zinc-300" />
              <span className="truncate text-sm font-medium">{user?.username ?? 'User'}</span>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start text-zinc-300 hover:bg-white/5 hover:text-zinc-50"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </div>
        </aside>

        <div className="md:hidden px-4 pt-6">
          <div className="rounded-xl border border-white/10 bg-card/90 p-4 shadow-2xl shadow-black/35">
            <div className="flex items-center gap-3">
              <PulseBoardLogo className="h-8 w-8 text-zinc-100" />
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Workspace</p>
                <p className="text-base font-semibold text-zinc-50">PulseBoard</p>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full px-4 py-6 pb-28 md:px-8 md:py-8 md:pb-8">
          <section className="flex min-w-0 flex-1 flex-col gap-6">
          <Card className="border-white/10 bg-card/90 shadow-2xl shadow-black/35">
            <CardHeader className="border-b border-white/10">
              <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Dashboard</p>
              <CardTitle className="text-2xl font-semibold text-zinc-50">Welcome back</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 p-6 sm:grid-cols-2">
              {isLoading ? (
                <div className="col-span-full rounded-lg border border-white/10 bg-white/3 p-4 text-center">
                  <p className="text-sm text-zinc-400">Loading user details...</p>
                </div>
              ) : error ? (
                <div className="col-span-full rounded-lg border border-red-900/30 bg-red-950/10 p-4 text-center">
                  <p className="text-sm text-red-400">Failed to load user details</p>
                </div>
              ) : (
                <>
                  <div className="rounded-lg border border-white/10 bg-white/3 p-4">
                    <p className="text-xs uppercase tracking-wide text-zinc-500">User</p>
                    <p className="mt-2 text-lg font-semibold text-zinc-50">{user?.username ?? 'Unknown'}</p>
                    <p className="text-sm text-zinc-400">@{user?.id ?? 'missing-id'}</p>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-white/3 p-4">
                    <p className="text-xs uppercase tracking-wide text-zinc-500">Email</p>
                    <p className="mt-2 flex items-center gap-2 text-sm font-medium text-zinc-50">
                      <Mail className="h-4 w-4 text-zinc-400" />
                      {user?.email ?? 'no-email@local'}
                    </p>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-white/3 p-4 sm:col-span-2">
                    <p className="text-xs uppercase tracking-wide text-zinc-500">Created</p>
                    <p className="mt-2 text-sm text-zinc-50">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleString() : 'Unknown'}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-card/90 shadow-2xl shadow-black/35">
            <CardHeader className="border-b border-white/10">
              <CardTitle className="text-lg font-semibold text-zinc-50">Overview</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 p-6 sm:grid-cols-3">
              <div className="rounded-lg border border-white/10 bg-white/3 p-4">
                <p className="text-xs uppercase tracking-wide text-zinc-500">Active Polls</p>
                <p className="mt-2 text-2xl font-semibold text-zinc-50">3</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/3 p-4">
                <p className="text-xs uppercase tracking-wide text-zinc-500">Total Responses</p>
                <p className="mt-2 text-2xl font-semibold text-zinc-50">2847</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/3 p-4">
                <p className="text-xs uppercase tracking-wide text-zinc-500">Published</p>
                <p className="mt-2 text-2xl font-semibold text-zinc-50">2</p>
              </div>
            </CardContent>
          </Card>
          </section>
        </div>
      </div>

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
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </div>
    </main>
  )
}
