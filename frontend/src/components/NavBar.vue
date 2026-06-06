<template>
  <header class="sticky top-0 z-30 glass-card border-b border-white/40 backdrop-blur-md">
    <div class="max-w-2xl mx-auto px-4 py-3">
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center gap-2">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center text-lg shadow-md shadow-brand-500/30">
            📚
          </div>
          <div>
            <div class="text-sm font-bold text-gray-800">单词之旅</div>
            <div class="text-[10px] text-gray-500">English Study</div>
          </div>
        </div>

        <div class="flex items-center gap-2 sm:gap-3">
          <!-- 准确率 -->
          <div v-if="accuracy !== undefined" class="hidden sm:flex flex-col items-end">
            <div class="text-[10px] text-gray-500">正确率</div>
            <div
              class="text-sm font-bold"
              :class="accuracy >= 80 ? 'text-emerald-600' : accuracy >= 60 ? 'text-amber-500' : 'text-rose-500'"
            >{{ accuracy }}%</div>
          </div>
          <!-- 得分 -->
          <div v-if="score !== undefined" class="hidden sm:flex flex-col items-end">
            <div class="text-[10px] text-gray-500">得分</div>
            <div class="text-sm font-bold text-amber-500">⭐ {{ score }}</div>
          </div>
          <!-- 进度 -->
          <div class="flex items-center gap-2">
            <span class="text-xs text-gray-500">进度</span>
            <span class="text-sm font-bold text-brand-600">{{ learned }}/{{ total }}</span>
            <div class="w-9 h-9 rounded-full bg-gradient-to-br from-brand-100 to-purple-100 flex items-center justify-center text-xs font-bold text-brand-700">
              {{ progress }}%
            </div>
          </div>
        </div>
      </div>

      <!-- 进度条 -->
      <div class="w-full h-1.5 bg-gray-200/60 rounded-full overflow-hidden">
        <div
          class="h-full bg-gradient-to-r from-brand-500 via-purple-500 to-pink-500 rounded-full transition-all duration-700 ease-out relative"
          :style="{ width: progress + '%' }"
        >
          <div class="absolute inset-0 bg-white/30 animate-pulse-soft"></div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
defineProps({
  progress: { type: Number, default: 0 },
  learned: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  accuracy: { type: Number, default: undefined },
  score: { type: Number, default: undefined }
})
</script>
