import axios from 'axios'

// 创建 axios 实例
const request = axios.create({
  baseURL: '/api',
  timeout: 15000
})

// 请求拦截器：自动注入 token
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截器：统一错误处理
request.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status
    const msg = error.response?.data?.error || error.message || '网络异常'

    if (status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      if (location.pathname !== '/login') {
        location.href = '/login'
      }
    }
    // 把错误信息透传给业务代码处理
    error.message = msg
    return Promise.reject(error)
  }
)

/* ================== 认证接口 ================== */
export const authApi = {
  register: (data) => request.post('/auth/register', data),
  login: (data) => request.post('/auth/login', data),
  me: () => request.get('/auth/me'),
  logout: () => request.post('/auth/logout')
}

/* ================== 单词接口 ================== */
export const wordApi = {
  today: (limit = 20) => request.get('/words/today', { params: { limit } }),
  detail: (id) => request.get(`/words/${id}`),
  mark: (id, status) => request.post(`/words/${id}/mark`, { status }),
  search: (q) => request.get('/words/search', { params: { q } }),
  review: () => request.get('/words/review')
}

/* ================== AI 接口（暂未实现，预留） ================== */
export const aiApi = {
  explain: (word) => request.post('/ai/explain', { word }),
  examples: (word) => request.post('/ai/examples', { word }),
  chat: (messages) => request.post('/ai/chat', { messages })
}

export default request
