import { CreateUserReqBody, UpdateUserReqBody, User, UserList } from 'src/types/user.type'
import http from 'src/utils/http'

const URL = 'users'
const userApi = {
  getList: (params: { page: number; limit: number }) => {
    return http.get<UserList>(URL, { params })
  },
  create: (body: CreateUserReqBody) => {
    return http.post<User>(`${URL}`, body)
  },
  update: (userId: number, body: UpdateUserReqBody) => {
    return http.put<User>(`${URL}/${userId}`, body)
  },
  delete: (id: number) => {
    return http.delete<{ message: string }>(`${URL}/${id}`)
  },
  detail: (id: number) => {
    return http.get<User>(`${URL}/${id}`)
  }
}
export default userApi
