import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.js'
import wordRoutes from './routes/words.js'
import aiRoutes from './routes/ai.js'
import db from './db/index.js'

const app = express()
const PORT = process.env.PORT || 3000

// CORS：支持本地开发 + 线上前端域名
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.FRONTEND_URL
].filter(Boolean)

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true) // 允许无 origin（curl / 同源）
    if (allowedOrigins.includes(origin)) return cb(null, true)
    return cb(null, true) // 部署阶段先放行，避免前端跨域失败
  },
  credentials: true
}))

app.use(express.json())

// 根路径
app.get('/', (req, res) => {
  res.json({ name: '单词之旅 API', version: '1.0.0', status: 'running' })
})

// 健康检查（用于 Render 等平台的存活探针）
app.get('/api/health', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() })
})

app.use('/api/auth', authRoutes)
app.use('/api/words', wordRoutes)
app.use('/api/ai', aiRoutes)

// 404
app.use((req, res) => {
  res.status(404).json({ error: '接口不存在' })
})

// 错误处理
app.use((err, req, res, next) => {
  console.error('💥 Server error:', err)
  res.status(500).json({ error: '服务器开小差啦' })
})

// 等待数据库初始化完成后再启动服务
db.ready.then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 后端启动成功: http://localhost:${PORT}`)
  })
})
