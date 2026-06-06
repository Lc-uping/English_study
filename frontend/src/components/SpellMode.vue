<template>
  <div
    class="glass-card rounded-3xl p-5 sm:p-8 min-h-[380px] sm:min-h-[440px] flex flex-col"
    :class="shake ? 'animate-shake' : ''"
  >
    <!-- 顶部标签 -->
    <div class="flex items-center justify-between mb-4 sm:mb-6">
      <span class="text-xs font-semibold text-brand-600 bg-brand-50 px-3 py-1 rounded-full">
        ✍️ 看义拼词
      </span>
      <span class="text-xs text-gray-400 font-mono">
        {{ word.phonetic }}
      </span>
    </div>

    <!-- 中文释义 -->
    <div class="flex-1 flex flex-col items-center justify-center text-center">
      <p class="text-xs text-gray-400 mb-2 uppercase tracking-wider">中文释义</p>
      <h3 class="text-2xl sm:text-3xl font-bold text-gray-800 leading-snug mb-3 px-2">
        {{ word.translation }}
      </h3>
      <p class="text-sm text-gray-500 italic">"{{ word.example }}"</p>
    </div>

    <!-- 拼写输入区 -->
    <div class="mt-5 sm:mt-6 space-y-4">
      <!-- 字母提示（首字母+下划线，连字符 / 空格渲染为分隔符） -->
      <div class="flex items-center justify-center flex-wrap px-2">
        <template v-for="(cell, i) in hintLetters" :key="i">
          <!-- 分隔符（连字符 / 空格） -->
          <span
            v-if="cell.isSeparator"
            class="w-3 sm:w-4 flex items-center justify-center text-gray-400 text-base sm:text-lg font-bold select-none"
          >{{ cell.display }}</span>
          <!-- 字母格子 -->
          <span
            v-else
            class="w-7 h-9 sm:w-8 sm:h-10 border-b-2 mx-0.5 flex items-center justify-center text-base sm:text-lg font-bold transition-colors"
            :class="cellClass(i)"
          >{{ submitted ? (userInput[cell.letterIndex] || '') : '' }}</span>
        </template>
      </div>

      <!-- 输入框 -->
      <div class="relative">
        <input
          ref="inputEl"
          v-model="userInput"
          @keydown.enter="submit"
          :disabled="submitted"
          :placeholder="placeholder"
          autocomplete="off"
          autocapitalize="off"
          spellcheck="false"
          class="w-full text-center text-xl sm:text-2xl font-mono tracking-widest py-3 px-4 bg-white/80 border-2 rounded-2xl outline-none transition-all"
          :class="[
            submitted && isCorrect ? 'border-emerald-400 bg-emerald-50/50 text-emerald-700' : '',
            submitted && !isCorrect ? 'border-rose-400 bg-rose-50/50 text-rose-700' : '',
            !submitted ? 'border-gray-200 focus:border-brand-400 focus:bg-white' : ''
          ]"
        />
      </div>

      <!-- 反馈信息 -->
      <transition name="fade">
        <div v-if="submitted" class="text-center">
          <p
            class="text-sm font-semibold"
            :class="isCorrect ? 'text-emerald-600' : 'text-rose-600'"
          >
            {{ isCorrect ? '🎉 拼写正确！' : `✗ 正确答案：${word.word}` }}
          </p>
        </div>
      </transition>

      <!-- 操作按钮 -->
      <div class="flex gap-3">
        <button
          v-if="!submitted"
          @click="submit"
          :disabled="!userInput.trim()"
          class="btn-primary flex-1 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          提交 (Enter)
        </button>
        <button
          v-else
          @click="$emit('next', isCorrect)"
          class="btn-primary flex-1 py-3"
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
import { ref, computed, watch, nextTick, onMounted } from 'vue'

const props = defineProps({
  word: { type: Object, required: true }
})
defineEmits(['next', 'skip'])

const inputEl = ref(null)
const userInput = ref('')
const submitted = ref(false)
const isCorrect = ref(false)
const shake = ref(false)

const placeholder = computed(() => `请拼写（共 ${typeableCount.value} 个字母）`)

// 可输入的字母数（不含连字符、空格等分隔符）
const typeableCount = computed(() => {
  return hintLetters.value.filter(c => !c.isSeparator).length
})

// 字母格 / 分隔符：每个可输入字符对应一格，分隔符只占位置不参与比较
const hintLetters = computed(() => {
  const w = props.word.word
  const cells = []
  let letterIndex = 0   // 累计可输入字符数
  for (let i = 0; i < w.length; i++) {
    const ch = w[i]
    if (ch === ' ') {
      cells.push({ isSeparator: true, display: '·', char: ' ', wordIndex: i, letterIndex: -1 })
    } else if (ch === '-') {
      cells.push({ isSeparator: true, display: '-', char: '-', wordIndex: i, letterIndex: -1 })
    } else {
      cells.push({
        isSeparator: false,
        display: '',
        char: ch,
        wordIndex: i,
        letterIndex
      })
      letterIndex += 1
    }
  }
  return cells
})

function cellClass(i) {
  const cell = hintLetters.value[i]
  if (!cell || cell.isSeparator) return 'border-transparent text-gray-400'
  if (!submitted.value) return 'border-gray-300 text-gray-700'
  // 答完后显示用户输入的对应字符
  const typed = userInput.value[cell.letterIndex] || ''
  const correct = typed.toLowerCase() === cell.char.toLowerCase()
  return correct
    ? 'border-emerald-400 text-emerald-600 bg-emerald-50'
    : 'border-rose-400 text-rose-600 bg-rose-50'
}

function submit() {
  if (submitted.value || !userInput.value.trim()) return
  // 校验时也只比对可输入字符
  const target = props.word.word.replace(/[\s\-]/g, '').toLowerCase()
  const typed = userInput.value.trim().toLowerCase()
  const ok = typed === target
  isCorrect.value = ok
  submitted.value = true
  if (!ok) {
    shake.value = true
    setTimeout(() => (shake.value = false), 500)
  }
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

defineExpose({ reset })
</script>
