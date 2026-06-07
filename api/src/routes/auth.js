import { Router } from 'express'
import bcrypt from 'bcryptjs'
import db from '../db/index.js'
import { signToken, authMiddleware } from '../middleware/auth.js'

const router = Router()

router.post('/register', async (req, res) => {
  const { username, password } = req.body || {}
  if (!username || !password) {
    return res.status(400).json({ error: '请填写用户名和密码' })
  }
  if (username.length < 3 || username.length > 20) {
    return res.status(400).json({ error: '用户名需 3-20 个字符' })
  }
  if (password.length < 6) {
    return res.status(400).json({ error: '密码至少 6 位' })
  }
  const exists = await db.prepare('SELECT id FROM users WHERE username = ?').get(username)
  if (exists) {
    return res.status(400).json({ error: '该用户名已被使用' })
  }
  const hash = await bcrypt.hash(password, 10)
  const result = await db.prepare(
    'INSERT INTO users (username, password) VALUES (?, ?)'
  ).run(username, hash)
  const user = { id: result.lastInsertRowid, username, avatar: '🧑‍🎓' }
  const token = signToken({ id: user.id, username })
  res.json({ success: true, token, user })
})

router.post('/login', async (req, res) => {
  const { username, password } = req.body || {}
  if (!username || !password) {
    return res.status(400).json({ error: '请输入用户名和密码' })
  }
  const row = await db.prepare('SELECT * FROM users WHERE username = ?').get(username)
  if (!row) return res.status(401).json({ error: '用户名或密码错误' })
  const ok = await bcrypt.compare(password, row.password)
  if (!ok) return res.status(401).json({ error: '用户名或密码错误' })
  const user = { id: row.id, username: row.username, avatar: row.avatar, level: row.level }
  const token = signToken({ id: user.id, username: user.username })
  res.json({ token, user })
})

router.get('/me', authMiddleware, async (req, res) => {
  const row = await db.prepare('SELECT id, username, email, avatar, level FROM users WHERE id = ?').get(req.user.id)
  if (!row) return res.status(404).json({ error: '用户不存在' })
  res.json({ user: row })
})

router.post('/logout', (req, res) => {
  res.json({ success: true })
})

export default router
