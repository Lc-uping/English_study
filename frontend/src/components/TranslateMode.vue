<template>
  <div
    class="glass-card rounded-3xl p-5 sm:p-8 min-h-[380px] sm:min-h-[440px] flex flex-col"
    :class="shake ? 'animate-shake' : ''"
  >
    <!-- 顶部标签 -->
    <div class="flex items-center justify-between mb-4 sm:mb-6">
      <span class="text-xs font-semibold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
        📝 看词写义
      </span>
      <button
        @click="playAudio"
        class="w-10 h-10 sm:w-9 sm:h-9 rounded-full bg-purple-100 hover:bg-purple-200 active:bg-purple-200 flex items-center justify-center transition"
        title="朗读"
      >🔊</button>
    </div>

    <!-- 英文单词 -->
    <div class="flex-1 flex flex-col items-center justify-center text-center">
      <p class="text-xs text-gray-400 mb-2 sm:mb-3 uppercase tracking-wider">英文单词</p>
      <h2 class="text-4xl sm:text-6xl font-bold gradient-text mb-3 tracking-tight break-all px-2">
        {{ word.word }}
      </h2>
      <p class="text-sm text-gray-500 font-mono">{{ word.phonetic }}</p>
    </div>

    <!-- 输入区 -->
    <div class="mt-5 sm:mt-6 space-y-4">
      <div class="relative">
        <input
          ref="inputEl"
          v-model="userInput"
          @keydown.enter="submit"
          :disabled="submitted"
          placeholder="请输入中文释义..."
          autocomplete="off"
          class="w-full px-4 py-3 text-base bg-white/80 border-2 rounded-2xl outline-none transition-all"
          :class="[
            submitted && isCorrect ? 'border-emerald-400 bg-emerald-50/50 text-emerald-700' : '',
            submitted && !isCorrect ? 'border-rose-400 bg-rose-50/50 text-rose-700' : '',
            !submitted ? 'border-gray-200 focus:border-purple-400 focus:bg-white' : ''
          ]"
        />
      </div>

      <!-- 反馈信息 -->
      <transition name="fade">
        <div v-if="submitted" class="text-center space-y-1">
          <p
            class="text-sm font-semibold"
            :class="isCorrect ? 'text-emerald-600' : 'text-rose-600'"
          >
            {{ isCorrect ? '🎉 答对了！' : '✗ 差一点点~' }}
          </p>
          <p v-if="!isCorrect" class="text-sm text-gray-600">
            正确答案：<span class="font-semibold text-gray-800">{{ word.translation }}</span>
          </p>
          <p class="text-xs text-gray-400 italic mt-2">"{{ word.example }}"</p>
        </div>
      </transition>

      <!-- 操作按钮 -->
      <div class="flex gap-3">
        <button
          v-if="!submitted"
          @click="submit"
          :disabled="!userInput.trim()"
          class="flex-1 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold shadow-md shadow-purple-500/30 hover:shadow-lg hover:scale-[1.02] active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          提交 (Enter)
        </button>
        <button
          v-else
          @click="$emit('next', isCorrect)"
          class="flex-1 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold shadow-md shadow-purple-500/30 hover:shadow-lg hover:scale-[1.02] active:scale-95 transition"
        >
          下一题 →
        </button>
        <button
          v-if="!submitted"
          @click="$emit('skip')"
          class="px-5 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-medium transition"
        >
          跳过
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted } from 'vue'

const props = defineProps({
  word: { type: Object, required: true }
})
defineEmits(['next', 'skip'])

const inputEl = ref(null)
const userInput = ref('')
const submitted = ref(false)
const isCorrect = ref(false)
const shake = ref(false)

// 简单匹配：忽略标点/空格，包含关键词即可
function submit() {
  if (submitted.value || !userInput.value.trim()) return
  const userAns = userInput.value.trim().toLowerCase().replace(/[，。；、！？,.!?;]/g, '')
  const correctAns = props.word.translation.toLowerCase().replace(/[，。；、！？,.!?;]/g, '').replace(/^(n|adj|v|adv|prep|conj|pron|num|int|art|aux)\.\s*/i, '')
  // 双向包含判断
  const ok = userAns.length > 0 && (
    userAns.includes(correctAns.slice(0, Math.max(2, correctAns.length / 2))) ||
    correctAns.includes(userAns)
  )
  isCorrect.value = ok
  submitted.value = true
  if (!ok) {
    shake.value = true
    setTimeout(() => (shake.value = false), 500)
  }
}

function playAudio() {
  if (!('speechSynthesis' in window)) return
  const u = new SpeechSynthesisUtterance(props.word.word)
  u.lang = 'en-US'
  u.rate = 0.9
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(u)
}

function reset() {
  userInput.value = ''
  submitted.value = false
  isCorrect.value = false
  shake.value = false
  nextTick(() => inputEl.value?.focus())
}

watch(() => props.word, reset, { immediate: false })
onMounted(() => nextTick(() => inputEl.value?.focus()))

defineExpose({ reset, playAudio })
</script>
