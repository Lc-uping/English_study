import { Router } from 'express'
import db from '../db/index.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

router.get('/today', authMiddleware, async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 20, 100)
  const words = await db.prepare(
    'SELECT id, word, phonetic, translation, example, difficulty FROM words ORDER BY RANDOM() LIMIT ?'
  ).all(limit)
  res.json({ words })
})

router.get('/search', authMiddleware, async (req, res) => {
  const q = (req.query.q || '').toString().trim()
  if (!q) return res.json({ words: [] })
  const words = await db.prepare(
    'SELECT id, word, phonetic, translation, example FROM words WHERE word LIKE ? OR translation LIKE ? LIMIT 30'
  ).all(`%${q}%`, `%${q}%`)
  res.json({ words })
})

router.post('/:id/mark', authMiddleware, async (req, res) => {
  const wordId = parseInt(req.params.id)
  const { status } = req.body || {}
  if (!['new', 'learning', 'mastered'].includes(status)) {
    return res.status(400).json({ error: '状态不合法' })
  }
  const existing = await db.prepare(
    'SELECT id FROM study_records WHERE user_id = ? AND word_id = ?'
  ).get(req.user.id, wordId)

  if (existing) {
    await db.prepare(
      'UPDATE study_records SET status = ?, created_at = datetime("now") WHERE id = ?'
    ).run(status, existing.id)
  } else {
    await db.prepare(
      'INSERT INTO study_records (user_id, word_id, status) VALUES (?, ?, ?)'
    ).run(req.user.id, wordId, status)
  }
  res.json({ success: true })
})

export default router
