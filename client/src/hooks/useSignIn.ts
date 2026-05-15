import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '../context/AuthContext'
import { authApi, type SignInRequest } from '../lib/auth-api'
import { getApiErrorMessage } from '../lib/errors'

export function useSignIn() {
  const navigate = useNavigate()
  const { login } = useAuth()

  return useMutation({
    mutationFn: async (values: SignInRequest) => {
      const { token, user } = await authApi.signInWithUser(values)
      return { token, user }
    },
    onSuccess: ({ token, user }) => {
      login(token, user)
      toast.success('Welcome back!')
      navigate('/dashboard')
    },
    onError: (error: unknown) => {
      const isInvalidCredentials =
        (error as { response?: { status?: number } }).response?.status === 401
      
      if (isInvalidCredentials) {
        toast.error('Invalid email or password')
        return
      }

      toast.error(getApiErrorMessage(error))
    },
  })
}
