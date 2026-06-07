<template>
  <div class="min-h-screen flex items-center justify-center bg-mesh relative overflow-hidden">
    <!-- 装饰 -->
    <div class="absolute top-0 right-0 w-48 h-48 sm:w-96 sm:h-96 bg-pink-300/30 rounded-full blur-3xl animate-float"></div>
    <div class="absolute bottom-0 left-0 w-48 h-48 sm:w-96 sm:h-96 bg-indigo-300/30 rounded-full blur-3xl animate-float" style="animation-delay: 3s"></div>

    <div class="relative z-10 w-full max-w-md mx-4 animate-fade-in">
      <div class="glass-card rounded-3xl p-6 sm:p-10">
        <!-- Logo -->
        <div class="text-center mb-6">
          <div class="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 shadow-lg shadow-pink-500/40 mb-3 sm:mb-4 text-3xl sm:text-4xl">
            ✨
          </div>
          <h1 class="text-2xl sm:text-3xl font-bold gradient-text mb-2">加入我们</h1>
          <p class="text-gray-500 text-sm">创建账号，开启英语学习之旅</p>
        </div>

        <form @submit.prevent="handleRegister" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">用户名</label>
            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">👤</span>
              <input
                v-model="form.username"
                type="text"
                placeholder="3-20个字符"
                class="input-field pl-11"
                required
                minlength="3"
                maxlength="20"
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
                placeholder="至少 6 位"
                class="input-field pl-11 pr-11"
                required
                minlength="6"
                @input="checkStrength"
              />
              <button
                type="button"
                @click="showPwd = !showPwd"
                class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {{ showPwd ? '🙈' : '👁' }}
              </button>
            </div>
            <!-- 密码强度 -->
            <div class="mt-2 flex items-center gap-2">
              <div class="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  class="h-full transition-all duration-300"
                  :class="strengthBar.class"
                  :style="{ width: strengthBar.width }"
                ></div>
              </div>
              <span class="text-xs" :class="strengthBar.textClass">
                {{ strengthBar.label }}
              </span>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">确认密码</label>
            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔐</span>
              <input
                v-model="form.confirm"
                type="password"
                placeholder="再次输入密码"
                class="input-field pl-11"
                :class="{ 'border-rose-400': form.confirm && form.confirm !== form.password }"
                required
              />
            </div>
            <p v-if="form.confirm && form.confirm !== form.password" class="text-xs text-rose-500 mt-1">
              两次密码不一致
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">邀请码</label>
            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🎫</span>
              <input
                v-model="form.inviteCode"
                type="text"
                placeholder="请输入邀请码"
                class="input-field pl-11 uppercase tracking-widest"
                required
                autocomplete="off"
              />
            </div>
          </div>

          <label class="flex items-start text-sm text-gray-600 cursor-pointer pt-2">
            <input type="checkbox" v-model="form.agree" class="mt-0.5 mr-2 rounded" />
            <span>
              我已阅读并同意
              <a href="#" class="text-brand-600 hover:underline">《用户协议》</a>
              和
              <a href="#" class="text-brand-600 hover:underline">《隐私政策》</a>
            </span>
          </label>

          <button
            type="submit"
            :disabled="loading || !canSubmit"
            class="btn-primary w-full py-3.5 text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="!loading">注 册</span>
            <span v-else class="inline-flex items-center gap-2">
              <span class="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
              注册中...
            </span>
          </button>
        </form>

        <p class="text-center mt-6 text-sm text-gray-600">
          已有账号？
          <router-link to="/login" class="text-brand-600 hover:text-brand-700 font-semibold ml-1">
            返回登录 →
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const userStore = useUserStore()
const toast = useToast()

const form = reactive({
  username: '',
  password: '',
  confirm: '',
  inviteCode: '',
  agree: false
})
const loading = ref(false)
const showPwd = ref(false)
const strength = ref(0)

const canSubmit = computed(() =>
  form.username.length >= 3 &&
  form.password.length >= 6 &&
  form.password === form.confirm &&
  form.inviteCode.trim().length > 0 &&
  form.agree
)

const strengthBar = computed(() => {
  const s = strength.value
  if (s <= 1) return { width: '33%', class: 'bg-rose-400', label: '弱', textClass: 'text-rose-500' }
  if (s <= 2) return { width: '66%', class: 'bg-amber-400', label: '中', textClass: 'text-amber-500' }
  return { width: '100%', class: 'bg-emerald-400', label: '强', textClass: 'text-emerald-500' }
})

function checkStrength() {
  const p = form.password
  let s = 0
  if (p.length >= 6) s++
  if (p.length >= 10) s++
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++
  if (/\d/.test(p)) s++
  if (/[^A-Za-z0-9]/.test(p)) s++
  strength.value = Math.min(s, 3)
}

const handleRegister = async () => {
  if (!canSubmit.value) {
    toast.warning('请完整填写注册信息')
    return
  }
  loading.value = true
  try {
    await userStore.register({
      username: form.username,
      password: form.password,
      inviteCode: form.inviteCode.trim().toUpperCase()
    })
    toast.success('注册成功！正在登录...')
    // 自动登录
    await userStore.login({ username: form.username, password: form.password })
    setTimeout(() => router.replace('/study'), 600)
  } catch (e) {
    toast.error(e.message || '注册失败，请重试')
  } finally {
    loading.value = false
  }
}
</script>
