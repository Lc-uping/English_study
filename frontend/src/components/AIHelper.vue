<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="visible"
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        @click.self="$emit('update:visible', false)"
      >
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden animate-fade-in">
          <!-- 头部 -->
          <div class="bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 p-5 text-white">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-xl">
                  🤖
                </div>
                <div>
                  <h3 class="font-bold">AI 单词助手</h3>
                  <p class="text-xs text-white/80">{{ word?.word || '单词学习' }}</p>
                </div>
              </div>
              <button
                @click="$emit('update:visible', false)"
                class="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 transition flex items-center justify-center"
              >
                ✕
              </button>
            </div>
          </div>

          <!-- 内容 -->
          <div class="flex-1 overflow-y-auto p-6">
            <div class="text-center py-8">
              <div class="text-6xl mb-4">🚧</div>
              <h4 class="text-lg font-semibold text-gray-800 mb-2">功能开发中</h4>
              <p class="text-sm text-gray-500 leading-relaxed">
                AI 辅助学习功能正在开发中，<br />
                敬请期待！届时将为你提供：
              </p>
              <div class="mt-6 space-y-2 text-left max-w-xs mx-auto">
                <div class="flex items-center gap-2 text-sm text-gray-600">
                  <span class="text-purple-500">✦</span>
                  AI 详细单词解释
                </div>
                <div class="flex items-center gap-2 text-sm text-gray-600">
                  <span class="text-purple-500">✦</span>
                  个性化例句生成
                </div>
                <div class="flex items-center gap-2 text-sm text-gray-600">
                  <span class="text-purple-500">✦</span>
                  词根词缀记忆法
                </div>
                <div class="flex items-center gap-2 text-sm text-gray-600">
                  <span class="text-purple-500">✦</span>
                  智能对话练习
                </div>
              </div>
            </div>
          </div>

          <!-- 底部 -->
          <div class="border-t border-gray-100 p-4 bg-gray-50">
            <button
              @click="$emit('update:visible', false)"
              class="w-full py-3 rounded-xl bg-gradient-to-r from-violet-500 to-pink-500 text-white font-semibold hover:shadow-lg transition"
            >
              我知道了
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
defineProps({
  visible: { type: Boolean, default: false },
  word: { type: Object, default: null }
})
defineEmits(['update:visible'])
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
