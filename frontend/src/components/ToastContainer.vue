<template>
  <div class="fixed top-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
    <transition-group name="toast">
      <div
        v-for="t in toasts"
        :key="t.id"
        :class="[
          'pointer-events-auto px-5 py-3 rounded-xl shadow-2xl backdrop-blur-md',
          'text-white text-sm font-medium min-w-[200px] flex items-center gap-2',
          t.type === 'success' && 'bg-gradient-to-r from-emerald-500 to-teal-500',
          t.type === 'error' && 'bg-gradient-to-r from-rose-500 to-pink-500',
          t.type === 'info' && 'bg-gradient-to-r from-indigo-500 to-purple-500',
          t.type === 'warning' && 'bg-gradient-to-r from-amber-500 to-orange-500'
        ]"
      >
        <span class="text-lg font-bold">
          <template v-if="t.type === 'success'">✓</template>
          <template v-else-if="t.type === 'error'">✕</template>
          <template v-else-if="t.type === 'warning'">!</template>
          <template v-else>ℹ</template>
        </span>
        <span>{{ t.message }}</span>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { useToast } from '@/composables/useToast'
const { toasts } = useToast()
</script>

<style>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(40px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(40px);
}
</style>
