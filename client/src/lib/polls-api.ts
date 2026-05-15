import { api } from './axios'

export type PollResponseMode = 'ANONYMOUS' | 'AUTHENTICATED'

export type PollQuestionOption = {
  id: string
  text: string
  order: number
}

export type PollQuestion = {
  id: string
  question: string
  required: boolean
  order: number
  options: PollQuestionOption[]
}

export type Poll = {
  id: string
  title: string
  description: string | null
  creatorId: string
  responseMode: PollResponseMode
  expiresAt: string
  isPublished: boolean
  createdAt: string
  updatedAt: string | null
  questions: PollQuestion[]
}

export type GetMyPollsResponse = {
  message: string
  polls: Poll[]
}

export type CreatePollRequest = {
  title: string
  description?: string
  responseMode: PollResponseMode
  expiresAt: string
  questions: Array<{
    question: string
    required: boolean
    order: number
    options: Array<{
      text: string
      order: number
    }>
  }>
}

export type CreatePollResponse = {
  message: string
  poll: Omit<Poll, 'questions'>
}

export type UpdatePollRequest = {
  title?: string
  description?: string
  responseMode?: PollResponseMode
  expiresAt?: string
  questions?: Array<{
    id?: string
    delete?: boolean
    question?: string
    required?: boolean
    order?: number
    options?: Array<{
      id?: string
      delete?: boolean
      text?: string
      order?: number
    }>
  }>
}

export type UpdatePollResponse = {
  message: string
  poll: Poll
}

export type PublishPollResponse = {
  message: string
  shareableLink: string
}

export type GetPollByIdResponse = {
  message: string
  poll: Poll
}

export const pollsApi = {
  getMyPolls: async () => {
    const response = await api.get<GetMyPollsResponse>('/api/polls')
    return response.data.polls
  },

  getPollById: async (pollId: string) => {
    const response = await api.get<GetPollByIdResponse>(`/api/polls/${pollId}`)
    return response.data.poll
  },

  createPoll: async (payload: CreatePollRequest) => {
    const response = await api.post<CreatePollResponse>('/api/polls', payload)
    return response.data.poll
  },

  updatePoll: async (pollId: string, payload: UpdatePollRequest) => {
    const response = await api.put<UpdatePollResponse>(`/api/polls/${pollId}`, payload)
    return response.data.poll
  },

  publishPoll: async (pollId: string) => {
    const response = await api.patch<PublishPollResponse>(`/api/polls/${pollId}/publish`)
    return response.data
  },

  deletePoll: async (pollId: string) => {
    await api.delete(`/api/polls/${pollId}`)
  },
}
