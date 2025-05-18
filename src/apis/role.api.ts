import { RoleList } from 'src/types/role.type'
import http from 'src/utils/http'

const URL = 'roles'
const roleApi = {
  getList: (params: { page: number; limit: number }) => {
    return http.get<RoleList>(URL, { params })
  }
}
export default roleApi
