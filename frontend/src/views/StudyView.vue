<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 relative overflow-hidden">
    <!-- 装饰背景 -->
    <div class="absolute top-0 -left-20 w-96 h-96 bg-brand-200/20 rounded-full blur-3xl"></div>
    <div class="absolute bottom-0 -right-20 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl"></div>

    <NavBar
      :progress="progress"
      :learned="currentStats.correct + currentStats.wrong"
      :total="totalToday"
      :accuracy="accuracy"
      :score="totalScore"
    />

    <main class="max-w-2xl mx-auto px-4 py-6 pb-32 sm:pb-24 relative z-10" style="padding-bottom: max(8rem, calc(8rem + env(safe-area-inset-bottom)))">
      <!-- 欢迎语 -->
      <div v-if="(currentStats.correct + currentStats.wrong) === 0 && !isFinished" class="text-center mb-5 animate-fade-in">
        <h2 class="text-2xl font-bold text-gray-800 mb-1">
          嗨，{{ username }} 👋
        </h2>
        <p class="text-gray-500 text-sm">选择你的学习方式，开始记单词吧！</p>
      </div>

      <!-- 模式切换 -->
      <div v-if="!isFinished" class="mb-6 animate-fade-in">
        <ModeTabs
          :active="currentMode"
          :mode-stats="modeStats"
          @change="handleSwitchMode"
        />
      </div>

      <!-- 已完成当前模式 -->
      <div v-if="isFinished" class="animate-fade-in">
        <div class="text-center py-8">
          <div class="text-7xl mb-4 animate-bounce">🎉</div>
          <h2 class="text-3xl font-bold gradient-text mb-2">本轮完成！</h2>
          <p class="text-gray-600 mb-6">
            模式：<span class="font-semibold text-brand-600">{{ currentModeLabel }}</span>
          </p>

          <!-- 统计卡片 -->
          <div class="glass-card rounded-2xl p-6 max-w-md mx-auto mb-6">
            <div class="grid grid-cols-4 gap-3 text-center">
              <div>
                <div class="text-2xl font-bold text-emerald-600">{{ currentStats.correct }}</div>
                <div class="text-xs text-gray-500 mt-1">答对</div>
              </div>
              <div>
                <div class="text-2xl font-bold text-rose-500">{{ currentStats.wrong }}</div>
                <div class="text-xs text-gray-500 mt-1">答错</div>
              </div>
              <div>
                <div class="text-2xl font-bold text-brand-600">{{ accuracy }}%</div>
                <div class="text-xs text-gray-500 mt-1">正确率</div>
              </div>
              <div>
                <div class="text-2xl font-bold text-amber-500">
                  {{ formatTime(currentStats.time) }}
                </div>
                <div class="text-xs text-gray-500 mt-1">用时</div>
              </div>
            </div>
          </div>

          <!-- 各模式完成度 -->
          <div class="glass-card rounded-2xl p-5 max-w-md mx-auto mb-6">
            <p class="text-sm text-gray-600 mb-3 font-medium">各模式进度</p>
            <div class="space-y-2">
              <div
                v-for="m in MODES"
                :key="m.key"
                class="flex items-center gap-3"
              >
                <span class="text-lg">{{ m.icon }}</span>
                <span class="text-sm text-gray-700 flex-1 text-left">{{ m.label }}</span>
                <div class="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    class="h-full transition-all duration-500"
                    :class="modeStats[m.key].finished ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : 'bg-gray-300'"
                    :style="{ width: modeProgress(m.key) + '%' }"
                  ></div>
                </div>
                <span class="text-xs text-gray-500 w-8 text-right">
                  {{ modeStats[m.key].correct }}/{{ totalToday }}
                </span>
              </div>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row gap-3 justify-center">
            <button @click="restartCurrent" class="btn-primary px-6 py-3">
              🔄 再来一轮
            </button>
            <button
              v-if="!allFinished"
              @click="autoSwitchNext"
              class="px-6 py-3 rounded-2xl bg-white border-2 border-brand-200 text-brand-600 font-semibold hover:bg-brand-50 transition"
            >
              {{ nextModeLabel }} →
            </button>
            <button @click="resetAll" class="px-6 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold transition">
              全部重置
            </button>
          </div>
        </div>
      </div>

      <!-- 闪卡模式 -->
      <div v-else-if="currentWord && currentMode === 'flash'" class="animate-fade-in" key="flash">
        <WordCard
          v-if="currentWord"
          :word="currentWord"
          :show-answer="showAnswer"
          @toggle="showAnswer = !showAnswer"
        />

        <div class="grid grid-cols-2 gap-4 mt-8">
          <button
            @click="handleUnknown"
            :disabled="marking"
            class="group bg-white border-2 border-rose-200 text-rose-600 py-4 rounded-2xl font-semibold hover:bg-rose-50 hover:border-rose-300 hover:shadow-lg hover:shadow-rose-200/50 transition-all active:scale-95 disabled:opacity-50 min-h-[56px]"
          >
            <span class="text-xl mr-2">😵</span>
            不认识
            <span class="hidden sm:block text-xs text-rose-400 mt-0.5">快捷键 1</span>
          </button>
          <button
            @click="handleKnown"
            :disabled="marking"
            class="group bg-white border-2 border-emerald-200 text-emerald-600 py-4 rounded-2xl font-semibold hover:bg-emerald-50 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-200/50 transition-all active:scale-95 disabled:opacity-50 min-h-[56px]"
          >
            <span class="text-xl mr-2">😊</span>
            已掌握
            <span class="hidden sm:block text-xs text-emerald-400 mt-0.5">快捷键 2</span>
          </button>
        </div>
        <p class="hidden sm:block text-center text-xs text-gray-400 mt-4">
          💡 提示：按 <kbd class="px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-mono">Space</kbd> 翻转 ·
          <kbd class="px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-mono">1</kbd> 不认识 ·
          <kbd class="px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-mono">2</kbd> 已掌握 ·
          <kbd class="px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-mono">N</kbd> 下一组
        </p>

        <!-- 下一组按钮（移动端可见，桌面端浮在右上角） -->
        <div class="relative">
          <button
            @click="handleNextGroup"
            :disabled="loadingGroup"
            class="mt-4 w-full sm:w-auto sm:absolute sm:-top-2 sm:right-0 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white/80 border border-gray-200 text-gray-600 text-sm font-medium hover:bg-white hover:border-brand-300 hover:text-brand-600 active:scale-95 transition disabled:opacity-50"
          >
            <span v-if="loadingGroup" class="inline-block w-3 h-3 border-2 border-gray-300 border-t-brand-500 rounded-full animate-spin"></span>
            <span v-else>⏭</span>
            <span>{{ loadingGroup ? '加载中...' : '下一组单词' }}</span>
            <kbd class="hidden sm:inline ml-1 px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-mono text-[10px]">N</kbd>
          </button>
        </div>
      </div>

      <!-- 拼写模式 -->
      <div v-else-if="currentWord && currentMode === 'spell'" class="animate-fade-in" key="spell">
        <SpellMode
          ref="spellRef"
          :word="currentWord"
          @next="handleSpellNext"
          @skip="handleSkip"
        />
        <p class="hidden sm:block text-center text-xs text-gray-400 mt-4">
          💡 提示：按 <kbd class="px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-mono">Enter</kbd> 提交 ·
          <kbd class="px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-mono">Esc</kbd> 跳过
        </p>
      </div>

      <!-- 听写模式 -->
      <div v-else-if="currentWord && currentMode === 'translate'" class="animate-fade-in" key="translate">
        <TranslateMode
          ref="translateRef"
          :word="currentWord"
          @next="handleTranslateNext"
          @skip="handleSkip"
        />
        <p class="hidden sm:block text-center text-xs text-gray-400 mt-4">
          💡 提示：按 <kbd class="px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-mono">Enter</kbd> 提交 ·
          点击 🔊 听发音
        </p>
      </div>
    </main>

    <AIHelper :word="currentWord" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/user'
import { useWordStore, MODES } from '@/stores/word'
import { useToast } from '@/composables/useToast'
import NavBar from '@/components/NavBar.vue'
import WordCard from '@/components/WordCard.vue'
import ModeTabs from '@/components/ModeTabs.vue'
import SpellMode from '@/components/SpellMode.vue'
import TranslateMode from '@/components/TranslateMode.vue'
import AIHelper from '@/components/AIHelper.vue'

const userStore = useUserStore()
const wordStore = useWordStore()
const toast = useToast()

const {
  todayWords,
  currentIndex,
  currentWord,
  totalToday,
  progress,
  isFinished,
  currentMode,
  currentStats,
  modeStats,
  accuracy,
  totalScore
} = storeToRefs(wordStore)

const { username } = storeToRefs(userStore)

const showAnswer = ref(false)
const marking = ref(false)
const loadingGroup = ref(false)
const spellRef = ref(null)
const translateRef = ref(null)

const currentModeLabel = computed(
  () => MODES.find(m => m.key === currentMode.value)?.label || ''
)
const allFinished = computed(() =>
  Object.values(modeStats.value).every(s => s.finished)
)
const nextModeLabel = computed(() => {
  const idx = MODES.findIndex(m => m.key === currentMode.value)
  const next = MODES[(idx + 1) % MODES.length]
  return next.label
})

function modeProgress(key) {
  const s = modeStats.value[key]
  return Math.min(100, Math.round((s.correct / Math.max(totalToday.value, 1)) * 100))
}

function formatTime(sec) {
  if (!sec) return '0s'
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return m > 0 ? `${m}m${s}s` : `${s}s`
}

/* ================== 模式切换 ================== */
function handleSwitchMode(mode) {
  if (mode === currentMode.value) return
  wordStore.switchMode(mode)
  showAnswer.value = false
  // 提示
  const m = MODES.find(x => x.key === mode)
  toast.info(`已切换到「${m.label}」模式`)
}

/* ================== 闪卡模式 ================== */
async function handleKnown() {
  if (!currentWord.value || marking.value) return
  marking.value = true
  await wordStore.markWord('mastered')
  wordStore.recordResult(true)
  await next()
  marking.value = false
}
async function handleUnknown() {
  if (!currentWord.value || marking.value) return
  marking.value = true
  await wordStore.markWord('unfamiliar')
  wordStore.recordResult(false)
  await next()
  marking.value = false
}

// 加载下一组单词（闪卡专属快捷交互）
async function handleNextGroup() {
  if (loadingGroup.value) return
  loadingGroup.value = true
  toast.info('正在加载下一组...')
  await wordStore.loadNextGroup(15)
  showAnswer.value = false
  loadingGroup.value = false
  toast.success(`已加载 ${wordStore.totalToday} 个新单词 ✨`)
}

/* ================== 拼写/听写模式 ================== */
function handleSpellNext(isCorrect) {
  wordStore.recordResult(isCorrect)
  if (isCorrect) wordStore.markWord('mastered')
  else wordStore.markWord('unfamiliar')
  next()
}
function handleTranslateNext(isCorrect) {
  wordStore.recordResult(isCorrect)
  if (isCorrect) wordStore.markWord('mastered')
  else wordStore.markWord('unfamiliar')
  next()
}
function handleSkip() {
  wordStore.recordResult(false)
  wordStore.markWord('unfamiliar')
  next()
}

async function next() {
  showAnswer.value = false
  wordStore.nextWord()
  // 检查是否完成
  if (currentIndex.value >= totalToday.value) {
    wordStore.finishMode()
    // 庆祝
    if (currentStats.value.correct > 0) {
      celebrate()
    }
  }
}

/* ================== 完成页操作 ================== */
function restartCurrent() {
  wordStore.resetProgress()
  wordStore.switchMode(currentMode.value) // 重置模式统计
  showAnswer.value = false
}
function autoSwitchNext() {
  const idx = MODES.findIndex(m => m.key === currentMode.value)
  const nextMode = MODES[(idx + 1) % MODES.length]
  wordStore.switchMode(nextMode.key)
  showAnswer.value = false
}
function resetAll() {
  wordStore.resetProgress()
  wordStore.resetModeStats()
  wordStore.switchMode('flash')
  showAnswer.value = false
  toast.info('已重置所有进度')
}

/* ================== 庆祝效果 ================== */
function celebrate() {
  // 简单撒花：用 emoji 漂浮
  const emojis = ['🎉', '✨', '🌟', '💫', '🎊']
  const container = document.createElement('div')
  container.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9999;overflow:hidden'
  document.body.appendChild(container)
  for (let i = 0; i < 24; i++) {
    const el = document.createElement('div')
    el.textContent = emojis[Math.floor(Math.random() * emojis.length)]
    const size = 24 + Math.random() * 24
    el.style.cssText = `
      position:absolute;
      left:${Math.random() * 100}%;
      top:-50px;
      font-size:${size}px;
      animation:confetti-fall ${2 + Math.random() * 2}s ease-in ${Math.random() * 0.5}s forwards;
    `
    container.appendChild(el)
  }
  setTimeout(() => container.remove(), 4500)
}

/* ================== 键盘快捷键 ================== */
function onKeydown(e) {
  // 输入框中不响应（除非是 Esc）
  const tag = e.target.tagName
  const isInput = tag === 'INPUT' || tag === 'TEXTAREA'
  if (isFinished.value) return

  if (currentMode.value === 'flash') {
    if (!isInput) {
      if (e.code === 'Space') { e.preventDefault(); showAnswer.value = !showAnswer.value }
      else if (e.key === '1') { e.preventDefault(); handleUnknown() }
      else if (e.key === '2') { e.preventDefault(); handleKnown() }
      else if (e.key === 'n' || e.key === 'N' || e.key === '→') {
        e.preventDefault()
        handleNextGroup()
      }
    }
  } else if (currentMode.value === 'spell' || currentMode.value === 'translate') {
    if (e.key === 'Escape') {
      e.preventDefault()
      handleSkip()
    }
  }
}

/* ================== 生命周期 ================== */
onMounted(async () => {
  await wordStore.loadTodayWords(15)
  window.addEventListener('keydown', onKeydown)
})
onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>

<style>
@keyframes confetti-fall {
  to {
    transform: translateY(110vh) rotate(720deg);
    opacity: 0;
  }
}
</style>
