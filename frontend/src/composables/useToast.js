import { reactive } from 'vue'

const toasts = reactive([])
let id = 0

function show(message, type = 'info', duration = 2500) {
  const tid = ++id
  toasts.push({ id: tid, message, type })
  setTimeout(() => {
    const idx = toasts.findIndex((t) => t.id === tid)
    if (idx > -1) toasts.splice(idx, 1)
  }, duration)
}

export function useToast() {
  return {
    toasts,
    success: (msg) => show(msg, 'success'),
    error: (msg) => show(msg, 'error'),
    info: (msg) => show(msg, 'info'),
    warning: (msg) => show(msg, 'warning')
  }
}
