<template>
  <div class="min-h-screen flex items-center justify-center bg-mesh relative overflow-hidden">
    <!-- 装饰元素 -->
    <div class="absolute top-10 left-10 w-40 h-40 sm:w-72 sm:h-72 bg-white/10 rounded-full blur-3xl animate-float"></div>
    <div class="absolute bottom-10 right-10 w-48 h-48 sm:w-96 sm:h-96 bg-pink-300/20 rounded-full blur-3xl animate-float" style="animation-delay: 2s"></div>
    <div class="absolute top-1/2 left-1/3 w-32 h-32 sm:w-64 sm:h-64 bg-purple-300/20 rounded-full blur-3xl animate-float hidden sm:block" style="animation-delay: 4s"></div>

    <!-- 浮动字母装饰 -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none hidden sm:block">
      <span
        v-for="(ch, i) in floatingLetters"
        :key="i"
        class="absolute text-white/20 font-bold select-none animate-float"
        :style="{
          left: ch.x + '%',
          top: ch.y + '%',
          fontSize: ch.size + 'px',
          animationDelay: ch.delay + 's',
          animationDuration: ch.duration + 's'
        }"
      >{{ ch.text }}</span>
    </div>

    <!-- 登录卡片 -->
    <div class="relative z-10 w-full max-w-md mx-4 animate-fade-in">
      <div class="glass-card rounded-3xl p-6 sm:p-10">
        <!-- Logo -->
        <div class="text-center mb-6 sm:mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 shadow-lg shadow-brand-500/40 mb-3 sm:mb-4 text-3xl sm:text-4xl">
            📚
          </div>
          <h1 class="text-2xl sm:text-3xl font-bold gradient-text mb-2">单词之旅</h1>
          <p class="text-gray-500 text-sm">开启你的英语学习之旅</p>
        </div>

        <!-- 表单 -->
        <form @submit.prevent="handleLogin" class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">用户名</label>
            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">👤</span>
              <input
                v-model="form.username"
                type="text"
                placeholder="请输入用户名"
                class="input-field pl-11"
                required
                autocomplete="username"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">密码</label>
            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔒</span>
              <input
                v-model="form.password"
                :type="showPwd ? 'text' : 'password'"
                placeholder="请输入密码"
                class="input-field pl-11 pr-11"
                required
                autocomplete="current-password"
              />
              <button
                type="button"
                @click="showPwd = !showPwd"
                class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {{ showPwd ? '🙈' : '👁' }}
              </button>
            </div>
          </div>

          <div class="flex items-center justify-between text-sm">
            <label class="flex items-center text-gray-600 cursor-pointer">
              <input type="checkbox" v-model="form.remember" class="mr-2 rounded" />
              记住我
            </label>
            <a href="#" class="text-brand-600 hover:text-brand-700 font-medium">忘记密码？</a>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="btn-primary w-full py-3.5 text-base disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <span v-if="!loading">登 录</span>
            <span v-else class="inline-flex items-center gap-2">
              <span class="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
              登录中...
            </span>
          </button>
        </form>

        <!-- 分割线 -->
        <div class="flex items-center my-6 text-xs text-gray-400">
          <div class="flex-1 h-px bg-gray-200"></div>
          <span class="px-3">第三方登录</span>
          <div class="flex-1 h-px bg-gray-200"></div>
        </div>

        <!-- 第三方 -->
        <div class="flex justify-center gap-4">
          <button class="w-12 h-12 rounded-xl border border-gray-200 hover:border-brand-400 hover:bg-brand-50 transition flex items-center justify-center text-xl">
            <span style="color:#1677ff">微</span>
          </button>
          <button class="w-12 h-12 rounded-xl border border-gray-200 hover:border-green-400 hover:bg-green-50 transition flex items-center justify-center text-xl">
            <span style="color:#07c160">信</span>
          </button>
          <button class="w-12 h-12 rounded-xl border border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition flex items-center justify-center text-xl">
            <span>𝕏</span>
          </button>
        </div>

        <!-- 注册入口 -->
        <p class="text-center mt-8 text-sm text-gray-600">
          还没有账号？
          <router-link to="/register" class="text-brand-600 hover:text-brand-700 font-semibold ml-1">
            立即注册 →
          </router-link>
        </p>
      </div>

      <p class="text-center text-white/70 text-xs mt-6">
        © 2026 单词之旅 · 用 AI 助力英语学习
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const toast = useToast()

const form = reactive({
  username: '',
  password: '',
  remember: true
})
const loading = ref(false)
const showPwd = ref(false)

// 浮动字母
const floatingLetters = Array.from({ length: 12 }, () => ({
  text: String.fromCharCode(65 + Math.floor(Math.random() * 26)),
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: 24 + Math.floor(Math.random() * 40),
  delay: Math.random() * 6,
  duration: 6 + Math.random() * 4
}))

onMounted(() => {
  if (userStore.isLoggedIn) {
    router.replace('/study')
  }
})

const handleLogin = async () => {
  if (!form.username || !form.password) {
    toast.warning('请输入用户名和密码')
    return
  }
  loading.value = true
  try {
    await userStore.login({ username: form.username, password: form.password })
    toast.success(`欢迎回来，${userStore.username}！`)
    const redirect = route.query.redirect || '/study'
    router.replace(redirect)
  } catch (e) {
    toast.error(e.message || '登录失败，请重试')
  } finally {
    loading.value = false
  }
}
</script>
