import { useNavigate } from 'react-router-dom'

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
    <main className="min-h-screen bg-background px-4 py-12 text-foreground">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <Card className="border-white/10 bg-card/90 shadow-2xl shadow-black/35">
          <CardHeader className="flex flex-col gap-4 border-b border-white/10 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Dashboard</p>
              <CardTitle className="text-2xl font-semibold text-zinc-50">Welcome back</CardTitle>
            </div>
            <Button className="h-10 bg-zinc-100 text-zinc-950 hover:bg-zinc-200" onClick={handleSignOut}>
              Sign out
            </Button>
          </CardHeader>
          <CardContent className="grid gap-4 p-6 sm:grid-cols-2">
            {isLoading ? (
              <div className="col-span-full rounded-lg border border-white/10 bg-white/[0.03] p-4 text-center">
                <p className="text-sm text-zinc-400">Loading user details...</p>
              </div>
            ) : error ? (
              <div className="col-span-full rounded-lg border border-red-900/30 bg-red-950/10 p-4 text-center">
                <p className="text-sm text-red-400">Failed to load user details</p>
              </div>
            ) : (
              <>
                <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs uppercase tracking-wide text-zinc-500">User</p>
                  <p className="mt-2 text-lg font-semibold text-zinc-50">{user?.username ?? 'Unknown'}</p>
                  <p className="text-sm text-zinc-400">@{user?.id ?? 'missing-id'}</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs uppercase tracking-wide text-zinc-500">Email</p>
                  <p className="mt-2 text-sm font-medium text-zinc-50">{user?.email ?? 'no-email@local'}</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4 sm:col-span-2">
                  <p className="text-xs uppercase tracking-wide text-zinc-500">Created</p>
                  <p className="mt-2 text-sm text-zinc-50">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleString() : 'Unknown'}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
