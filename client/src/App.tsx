import type { ReactElement } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom'
import { SignInPage } from './pages/SignInPage'
import { SignUpPage } from './pages/SignUpPage'
import { DashboardPage } from './pages/DashboardPage'
import { PollDetailPage } from './pages/PollDetailPage'
import { PollAnalyticsPage, PollResultsPage } from './pages/PollInsightsPage'
import { PublicVotePage } from './pages/PublicVotePage'
import { useAuth } from './context/AuthContext'
import { HomePage } from './pages/HomePage'

type GuardProps = {
  children: ReactElement
}

function RequireAuth({ children }: GuardProps) {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />
  }

  return children
}

function RedirectIfAuth({ children }: GuardProps) {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

function PollEditRedirect() {
  const { pollId } = useParams<{ pollId: string }>()

  if (!pollId) {
    return <Navigate to="/dashboard" replace />
  }

  return <Navigate to={`/poll/${pollId}/edit`} replace />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/signin"
          element={
            <RedirectIfAuth>
              <SignInPage />
            </RedirectIfAuth>
          }
        />
        <Route
          path="/signup"
          element={
            <RedirectIfAuth>
              <SignUpPage />
            </RedirectIfAuth>
          }
        />
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <DashboardPage />
            </RequireAuth>
          }
        />
        <Route
          path="/poll/:pollId"
          element={<PollEditRedirect />}
        />
        <Route
          path="/poll/:pollId/edit"
          element={
            <RequireAuth>
              <PollDetailPage />
            </RequireAuth>
          }
        />
        <Route
          path="/poll/:pollId/analytics"
          element={
            <RequireAuth>
              <PollAnalyticsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/poll/:pollId/results"
          element={
            <RequireAuth>
              <PollResultsPage />
            </RequireAuth>
          }
        />
        <Route path="/vote/:pollId" element={<PublicVotePage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
