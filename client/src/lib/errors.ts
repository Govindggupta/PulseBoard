import axios from 'axios'

type ApiErrorData = {
  message?: string
  error?: string
}

export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong') {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiErrorData | undefined
    return data?.message ?? data?.error ?? fallback
  }

  if (error instanceof Error) {
    return error.message
  }

  return fallback
}