import { CreateRoleReqBody, Role, RoleList, UpdateRoleReqBody } from 'src/types/role.type'
import http from 'src/utils/http'

const URL = 'roles'
const roleApi = {
  getList: (params: { page: number; limit: number }) => {
    return http.get<RoleList>(URL, { params })
  },
  detail: (id: number) => {
    return http.get<Role>(`${URL}/${id}`)
  },
  delete: (id: number) => {
    return http.delete<{ message: string }>(`${URL}/${id}`)
  },
  create: (body: CreateRoleReqBody) => {
    return http.post<Role>(`${URL}`, body)
  },
  update: (id: number, body: UpdateRoleReqBody) => {
    return http.put<Role>(`${URL}/${id}`, body)
  }
}
export default roleApi
