import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '../context/AuthContext'
import { authApi, type SignUpRequest } from '../lib/auth-api'
import { getApiErrorMessage } from '../lib/errors'

export function useSignUp() {
  const navigate = useNavigate()
  const { login } = useAuth()

  return useMutation({
    mutationFn: async (values: SignUpRequest) => {
      const response = await authApi.signUp(values)
      return response
    },
    onSuccess: (data) => {
      login(data.token, data.user)
      toast.success('Welcome!')
      navigate('/dashboard')
    },
    onError: (error: unknown) => {
      const isEmailInUse =
        (error as { response?: { status?: number } }).response?.status === 409
      
      if (isEmailInUse) {
        toast.error('Email already in use')
        return
      }

      toast.error(getApiErrorMessage(error))
    },
  })
}
