import { UploadImageResponse } from 'src/types/media.type'
import { ChangePasswordReqBody, UpdateProfileReqBody, User } from 'src/types/user.type'
import http from 'src/utils/http'

const URL = 'profile'
const profileApi = {
  getProfile() {
    return http.get<User>(`${URL}`)
  },
  updateProfile(body: UpdateProfileReqBody) {
    return http.put<User>(`${URL}`, body)
  },
  changePassword(body: ChangePasswordReqBody) {
    return http.put<User>(`${URL}/change-password`, body)
  },
  uploadAvatar(files: File[]) {
    const formData = new FormData()
    files.forEach((file) => {
      formData.append('files', file) // key 'files' khớp với backend yêu cầu
    })
    return http.post<UploadImageResponse>(`/media/images/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },
  setup2fa() {
    return http.post('/auth/2fa/setup')
  },
  disable2fa(code: string) {
    return http.post('/auth/2fa/disable', {
      code: code
    })
  }
}

export default profileApi
