<template>
  <div
    class="relative cursor-pointer select-none"
    style="perspective: 1000px"
    @click="$emit('toggle')"
  >
    <div
      class="relative w-full transition-transform duration-500"
      :style="{
        transformStyle: 'preserve-3d',
        transform: showAnswer ? 'rotateY(180deg)' : 'rotateY(0deg)'
      }"
    >
      <!-- 正面 -->
      <div
        class="glass-card rounded-3xl p-5 sm:p-8 min-h-[340px] sm:min-h-[400px] flex flex-col items-center justify-center backface-hidden relative"
        style="backface-visibility: hidden"
      >
        <div class="absolute top-4 right-4 flex gap-1">
          <span
            v-for="i in word.difficulty || 1"
            :key="i"
            class="w-1.5 h-1.5 rounded-full bg-brand-400"
          ></span>
        </div>

        <div class="text-center">
          <div class="text-xs text-gray-400 mb-2 sm:mb-3 uppercase tracking-widest">Word</div>
          <h2 class="text-4xl sm:text-5xl font-bold text-gray-800 mb-3 sm:mb-4 tracking-tight break-all px-2">
            {{ word.word }}
          </h2>
          <div class="flex items-center justify-center gap-3 text-gray-500">
            <span class="font-mono text-sm sm:text-base">{{ word.phonetic }}</span>
            <button
              @click.stop="playAudio"
              class="w-10 h-10 sm:w-9 sm:h-9 rounded-full bg-brand-100 hover:bg-brand-200 active:bg-brand-200 flex items-center justify-center transition"
              title="朗读"
            >🔊</button>
          </div>
        </div>

        <p class="absolute bottom-3 sm:bottom-4 text-xs text-gray-400">
          点击卡片查看释义
        </p>
      </div>

      <!-- 背面 -->
      <div
        class="absolute inset-0 glass-card rounded-3xl p-5 sm:p-8 min-h-[340px] sm:min-h-[400px] flex flex-col backface-hidden bg-gradient-to-br from-white/95 to-brand-50/80"
        style="backface-visibility: hidden; transform: rotateY(180deg)"
      >
        <div class="text-center mb-3 sm:mb-4">
          <div class="text-xs text-gray-400 mb-2 uppercase tracking-widest">Translation</div>
          <h3 class="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4 leading-relaxed">
            {{ word.translation }}
          </h3>
        </div>
        <div class="border-t border-gray-200/60 pt-4 sm:pt-5 flex-1">
          <div class="text-xs text-gray-400 mb-2 uppercase tracking-widest">Example</div>
          <p class="text-gray-700 italic leading-relaxed text-sm sm:text-base">
            "{{ word.example }}"
          </p>
        </div>
        <p class="text-center text-xs text-gray-400 mt-2">
          点击卡片翻回
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useToast } from '@/composables/useToast'

const props = defineProps({
  word: { type: Object, required: true },
  showAnswer: { type: Boolean, default: false }
})
defineEmits(['toggle'])

const playing = ref(false)
const toast = useToast()

function playAudio() {
  if (!('speechSynthesis' in window)) {
    toast.warning('当前浏览器不支持语音合成')
    return
  }
  speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(props.word.word)
  u.lang = 'en-US'
  u.rate = 0.85
  u.onstart = () => (playing.value = true)
  u.onend = () => (playing.value = false)
  u.onerror = () => {
    playing.value = false
    toast.error('语音播放失败')
  }
  speechSynthesis.speak(u)
}
</script>

<style scoped>
.backface-hidden {
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
}
</style>
