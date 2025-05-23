import { CreateLanguageReqBody, Language, LanguageList, UpdateLanguageReqBody } from 'src/types/language.type'
import http from 'src/utils/http'

const URL = 'languages'

const languageApi = {
  getList() {
    return http.get<LanguageList>(URL)
  },
  getDetail(id: string) {
    return http.get<Language>(`${URL}/${id}`)
  },
  create(body: CreateLanguageReqBody) {
    return http.post<Language>(`${URL}`, body)
  },
  update(id: string, body: UpdateLanguageReqBody) {
    return http.put<Language>(`${URL}/${id}`, body)
  },
  delete(id: string) {
    return http.delete<{ message: string }>(`${URL}/${id}`)
  }
}
export default languageApi
