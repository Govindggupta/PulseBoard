import { api } from './axios'
import type { AuthUser } from '../context/AuthContext'

export type SignInRequest = {
  email: string
  password: string
}

export type SignUpRequest = {
  email: string
  username: string
  password: string
}

export type SignInResponse = {
  token: string
}

export type SignUpResponse = {
  token: string
  user: AuthUser
}

export type MeResponse = {
  user: AuthUser
}

export const authApi = {
  signIn: async (credentials: SignInRequest) => {
    const response = await api.post<SignInResponse>('/api/auth/signin', credentials)
    return response.data
  },

  signUp: async (data: SignUpRequest) => {
    const response = await api.post<SignUpResponse>('/api/auth/signup', data)
    return response.data
  },

  getMe: async () => {
    const response = await api.get<MeResponse>('/api/auth/me')
    return response.data.user
  },

  // Two-step signin: get token, then fetch user
  signInWithUser: async (credentials: SignInRequest) => {
    const { token } = await authApi.signIn(credentials)
    
    // Temporarily store token to allow axios interceptor to work
    localStorage.setItem('pb_token', token)
    
    try {
      const user = await authApi.getMe()
      return { token, user }
    } catch (error) {
      // Clean up if fetching user fails
      localStorage.removeItem('pb_token')
      throw error
    }
  },
}
