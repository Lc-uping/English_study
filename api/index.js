import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import authRoutes from './src/routes/auth.js'
import wordRoutes from './src/routes/words.js'
import aiRoutes from './src/routes/ai.js'
import db from './src/db/index.js'

const app = express()

// CORS：放行所有（Vercel 前后端同源）
app.use(cors({
  origin: true,
  credentials: true
}))

app.use(express.json())

// 根路径
app.get('/', (req, res) => {
  res.json({ name: '单词之旅 API', version: '1.0.0', status: 'running' })
})

// 健康检查
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

// 导出为 Vercel Serverless 函数
export default async function handler(req, res) {
  // 等待数据库初始化
  await db.ready

  // Express 处理请求
  app(req, res)
}
