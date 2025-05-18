import http from 'src/utils/http'

const URL = 'chat'

export interface Message {
    id?: number,
    fromUserId: number,
    toUserId: number,
    content: string,
    readAt?: Date,
    createdAt?: Date
}

export interface MessagesResponse {
    data: Message[],
    totalItems: number,
    page: number,
    limit?: number,
    totalPages: number
    receiver: {
        id: number,
        name: string,
        avatar: string,
        email: string,
    }
}

interface Params {
    page?: number | string // default: 1
    limit?: number | string // default: 10
    fromUserId: number | string,
    toUserId: number | string,
}

const chatApi = {
  getMessages: (params: Params) => {
    return http.get<MessagesResponse>(URL, {
      params
    })
  },
  getReceivers: () => {
    return http.get(`${URL}/receivers`)
  }
}

export default chatApi
