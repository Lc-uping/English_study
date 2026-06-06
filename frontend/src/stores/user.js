import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/api'

export const useUserStore = defineStore('user', () => {
  // state
  const token = ref(localStorage.getItem('token') || '')
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))

  // getters
  const isLoggedIn = computed(() => !!token.value)
  const username = computed(() => user.value?.username || '游客')
  const avatar = computed(() => user.value?.avatar || '🧑‍🎓')

  // actions
  async function register(payload) {
    const res = await authApi.register(payload)
    return res
  }

  async function login(payload) {
    const res = await authApi.login(payload)
    token.value = res.token
    user.value = res.user
    localStorage.setItem('token', res.token)
    localStorage.setItem('user', JSON.stringify(res.user))
    return res
  }

  function logout() {
    token.value = ''
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  function autoLogin() {
    // 如果有 token 但没有 user 信息，尝试获取
    if (token.value && !user.value) {
      authApi.me()
        .then((res) => {
          user.value = res.user
          localStorage.setItem('user', JSON.stringify(res.user))
        })
        .catch(() => logout())
    }
  }

  return {
    token,
    user,
    isLoggedIn,
    username,
    avatar,
    register,
    login,
    logout,
    autoLogin
  }
})
