import { Router } from 'express'
const router = Router()

// AI 接口占位（暂未实现）
router.post('/explain', (req, res) => {
  res.status(501).json({ error: 'AI 功能开发中，敬请期待' })
})

router.post('/examples', (req, res) => {
  res.status(501).json({ error: 'AI 功能开发中，敬请期待' })
})

router.post('/chat', (req, res) => {
  res.status(501).json({ error: 'AI 功能开发中，敬请期待' })
})

export default router
