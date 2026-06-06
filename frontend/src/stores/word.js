import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { wordApi } from '@/api'

/**
 * 学习模式
 *  - flash     闪卡（看英文，记中文）
 *  - spell     拼写（看中文+音标，拼英文）
 *  - translate 听写（看英文，写中文）
 */
export const MODES = [
  { key: 'flash',      label: '闪卡',     icon: '🃏', desc: '看词认义' },
  { key: 'spell',      label: '拼写',     icon: '✍️', desc: '看义拼词' },
  { key: 'translate',  label: '听写',     icon: '📝', desc: '看词写义' }
]

export const useWordStore = defineStore('word', () => {
  // === 基础状态 ===
  const todayWords = ref([])
  const currentIndex = ref(0)
  const todayLearned = ref(0)
  const todayMastered = ref(0)
  const loading = ref(false)

  // === 多模式状态 ===
  const currentMode = ref('flash')   // 当前模式
  const modeStats = ref({            // 各模式独立统计
    flash:      { correct: 0, wrong: 0, finished: false, time: 0 },
    spell:      { correct: 0, wrong: 0, finished: false, time: 0 },
    translate:  { correct: 0, wrong: 0, finished: false, time: 0 }
  })
  const startedAt = ref(Date.now())  // 当前模式开始时间

  // === getters ===
  const currentWord = computed(() => todayWords.value[currentIndex.value] || null)
  const totalToday = computed(() => todayWords.value.length)
  const progress = computed(() => {
    if (totalToday.value === 0) return 0
    return Math.round((todayLearned.value / totalToday.value) * 100)
  })
  const isFinished = computed(
    () => totalToday.value > 0 && currentIndex.value >= totalToday.value
  )
  const currentStats = computed(() => modeStats.value[currentMode.value])
  const accuracy = computed(() => {
    const s = currentStats.value
    const t = s.correct + s.wrong
    if (t === 0) return 0
    return Math.round((s.correct / t) * 100)
  })
  const totalScore = computed(() => {
    return Object.values(modeStats.value).reduce(
      (acc, s) => acc + s.correct * 10 - s.wrong * 2, 0
    )
  })

  // === actions ===
  async function loadTodayWords(limit = 20) {
    loading.value = true
    try {
      const res = await wordApi.today(limit)
      todayWords.value = res.words || []
    } catch (e) {
      // 接口失败时使用本地词库兜底
      todayWords.value = getLocalWords()
    } finally {
      resetProgress()
      loading.value = false
    }
  }

  // 加载下一组单词（重新拉一批新随机单词）
  async function loadNextGroup(limit = 20) {
    loading.value = true
    try {
      const res = await wordApi.today(limit)
      const newWords = (res.words || []).filter(w => !todayWords.value.some(x => x.id === w.id))
      todayWords.value = newWords.length >= 5 ? newWords : (res.words || [])
    } catch (e) {
      // 离线时把本地词库重排作为下一组
      todayWords.value = getLocalWords().slice().sort(() => Math.random() - 0.5)
    } finally {
      resetProgress()
      loading.value = false
    }
  }

  async function markWord(status) {
    const word = currentWord.value
    if (!word) return
    try {
      await wordApi.mark(word.id, status)
    } catch (e) {
      // 离线模式下静默失败
    }
    todayLearned.value += 1
    if (status === 'mastered') {
      todayMastered.value += 1
    }
  }

  function nextWord() {
    if (currentIndex.value < totalToday.value) {
      currentIndex.value += 1
    }
  }

  function resetProgress() {
    currentIndex.value = 0
    todayLearned.value = 0
    todayMastered.value = 0
  }

  // === 模式相关 ===
  function switchMode(mode) {
    if (!MODES.find(m => m.key === mode)) return
    currentMode.value = mode
    // 切换模式时重置当前单词位置，但保留统计
    currentIndex.value = 0
    startedAt.value = Date.now()
  }

  function recordResult(isCorrect) {
    const s = modeStats.value[currentMode.value]
    if (isCorrect) s.correct += 1
    else s.wrong += 1
  }

  function finishMode() {
    const s = modeStats.value[currentMode.value]
    s.finished = true
    s.time = Math.round((Date.now() - startedAt.value) / 1000)
  }

  function resetModeStats() {
    Object.keys(modeStats.value).forEach(k => {
      modeStats.value[k] = { correct: 0, wrong: 0, finished: false, time: 0 }
    })
  }

  return {
    // state
    todayWords,
    currentIndex,
    currentWord,
    totalToday,
    todayLearned,
    todayMastered,
    progress,
    isFinished,
    loading,
    // 多模式
    currentMode,
    modeStats,
    currentStats,
    accuracy,
    totalScore,
    // actions
    loadTodayWords,
    loadNextGroup,
    markWord,
    nextWord,
    resetProgress,
    switchMode,
    recordResult,
    finishMode,
    resetModeStats
  }
})

/* ============== 本地兜底词库 ============== */
function getLocalWords() {
  return [
    { id: 1, word: 'vocabulary', phonetic: '/voʊˈkæbjʊleri/', translation: 'n. 词汇；词汇量', example: 'Reading extensively can greatly expand your vocabulary.', difficulty: 2 },
    { id: 2, word: 'diligent', phonetic: '/ˈdɪlɪdʒənt/', translation: 'adj. 勤奋的；用功的', example: 'She is a diligent student who always finishes her homework on time.', difficulty: 2 },
    { id: 3, word: 'magnificent', phonetic: '/mæɡˈnɪfɪsnt/', translation: 'adj. 壮丽的；宏伟的', example: 'The magnificent view from the mountaintop took our breath away.', difficulty: 3 },
    { id: 4, word: 'perseverance', phonetic: '/ˌpɜːrsɪˈvɪərəns/', translation: 'n. 坚持不懈；不屈不挠', example: 'Success requires perseverance and hard work.', difficulty: 3 },
    { id: 5, word: 'enthusiasm', phonetic: '/ɪnˈθuːziæzəm/', translation: 'n. 热情；激情', example: 'Her enthusiasm for learning new languages is truly inspiring.', difficulty: 2 },
    { id: 6, word: 'comprehensive', phonetic: '/ˌkɒmprɪˈhensɪv/', translation: 'adj. 综合的；全面的', example: 'The book provides a comprehensive overview of world history.', difficulty: 3 },
    { id: 7, word: 'remarkable', phonetic: '/rɪˈmɑːrkəbl/', translation: 'adj. 卓越的；非凡的', example: 'She has made remarkable progress in her English studies.', difficulty: 2 },
    { id: 8, word: 'extraordinary', phonetic: '/ɪkˈstrɔːrdɪneri/', translation: 'adj. 非凡的；特别的', example: 'It was an extraordinary experience that I will never forget.', difficulty: 2 },
    { id: 9, word: 'opportunity', phonetic: '/ˌɒpərˈtuːnəti/', translation: 'n. 机会；时机', example: 'This job offers a great opportunity for career growth.', difficulty: 1 },
    { id: 10, word: 'consequence', phonetic: '/ˈkɒnsɪkwens/', translation: 'n. 结果；后果', example: 'Every choice we make has consequences.', difficulty: 2 },
    { id: 11, word: 'fundamental', phonetic: '/ˌfʌndəˈmentl/', translation: 'adj. 基本的；根本的', example: 'Reading is a fundamental skill for learning.', difficulty: 2 },
    { id: 12, word: 'contemplate', phonetic: '/ˈkɒntəmpleɪt/', translation: 'v. 沉思；考虑', example: 'She sat by the window to contemplate the meaning of life.', difficulty: 3 },
    { id: 13, word: 'sophisticated', phonetic: '/səˈfɪstɪkeɪtɪd/', translation: 'adj. 复杂的；老练的', example: 'He gave a sophisticated analysis of the situation.', difficulty: 3 },
    { id: 14, word: 'meticulous', phonetic: '/məˈtɪkjələs/', translation: 'adj. 一丝不苟的；细致的', example: 'She is meticulous in her research and never overlooks details.', difficulty: 3 },
    { id: 15, word: 'articulate', phonetic: '/ɑːrˈtɪkjələt/', translation: 'adj. 表达清晰的；v. 明确表达', example: 'He is an articulate speaker who can explain complex ideas simply.', difficulty: 3 }
  ]
}
