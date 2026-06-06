import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.js'
import wordRoutes from './routes/words.js'
import aiRoutes from './routes/ai.js'

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}))
app.use(express.json())

app.get('/', (req, res) => {
  res.json({ name: '单词之旅 API', version: '1.0.0', status: 'running' })
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

app.listen(PORT, () => {
  console.log(`🚀 后端启动成功: http://localhost:${PORT}`)
})
