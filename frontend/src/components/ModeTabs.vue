<template>
  <div class="flex items-center justify-center gap-2 p-1.5 bg-white/60 backdrop-blur rounded-2xl shadow-sm border border-white/80">
    <button
      v-for="m in MODES"
      :key="m.key"
      @click="$emit('change', m.key)"
      :class="[
        'flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-medium text-sm transition-all duration-300 relative',
        active === m.key
          ? 'bg-gradient-to-r from-brand-500 to-purple-500 text-white shadow-md shadow-brand-500/40 scale-[1.02]'
          : 'text-gray-500 hover:text-gray-700 hover:bg-white/60'
      ]"
    >
      <span class="text-lg">{{ m.icon }}</span>
      <span class="hidden sm:inline">{{ m.label }}</span>
      <!-- 进度小点 -->
      <span
        v-if="getProgress(m.key) > 0"
        :class="[
          'absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center',
          active === m.key
            ? 'bg-white text-brand-600'
            : 'bg-emerald-500 text-white'
        ]"
      >
        {{ getProgress(m.key) }}
      </span>
    </button>
  </div>
</template>

<script setup>
import { MODES } from '@/stores/word'

const props = defineProps({
  active: { type: String, required: true },
  modeStats: { type: Object, default: () => ({}) }
})

defineEmits(['change'])

function getProgress(modeKey) {
  const s = props.modeStats[modeKey]
  if (!s) return 0
  const total = s.correct + s.wrong
  if (total === 0) return 0
  return s.correct
}
</script>
