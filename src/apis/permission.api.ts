import { PermissionList } from 'src/types/permission.type'
import http from 'src/utils/http'

const URL = 'permissions'

export const permissionApi = {
  getList: (params: { page: number; limit: number }) => {
    return http.get<PermissionList>(URL, { params })
  }
}
