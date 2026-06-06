# 📚 单词之旅 · English Study

一个轻量化的英语单词学习平台，基于 **Vue 3 + Vite + Express + SQLite**。

## ✨ 特性

- 🎨 **现代化 UI**：玻璃拟态 + 渐变 + 流畅动画
- 🔐 **完整登录注册**：JWT 鉴权 + 密码加密
- 🃏 **单词卡片学习**：3D 翻转 + 语音朗读
- 📊 **学习进度追踪**：实时统计已学/已掌握
- 🤖 **AI 辅助**：接口已预留，待接入（DeepSeek/OpenAI）
- 💾 **轻量存储**：单文件 SQLite，零配置
- ⚡ **极速启动**：前端 < 200KB，后端 < 50ms 启动

## 🛠 技术栈

**前端**: Vue 3 + Vite + Pinia + Vue Router + Tailwind CSS + Axios
**后端**: Node.js + Express + better-sqlite3 + JWT + bcryptjs

## 📁 目录结构

```
English_study/
├── frontend/          # Vue3 前端
│   ├── src/
│   │   ├── api/       # 接口封装
│   │   ├── components/
│   │   ├── composables/
│   │   ├── router/
│   │   ├── stores/
│   │   ├── styles/
│   │   ├── views/
│   │   ├── App.vue
│   │   └── main.js
│   └── package.json
│
├── backend/           # Express 后端
│   ├── src/
│   │   ├── db/        # SQLite & Schema
│   │   ├── middleware/
│   │   ├── routes/    # auth / words / ai
│   │   └── index.js
│   ├── data/app.db    # SQLite 数据库（自动生成）
│   ├── .env
│   └── package.json
│
└── README.md
```

## 🚀 快速开始

### 1. 启动后端

```bash
cd backend
npm install
npm run dev
```

后端运行在 `http://localhost:3000`，首次启动会自动创建数据库并注入 20 个种子单词。

### 2. 启动前端

新开一个终端：

```bash
cd frontend
npm install
npm run dev
```

前端运行在 `http://localhost:5173`，访问即可看到登录页。

### 3. 体验流程

1. 打开 `http://localhost:5173`
2. 点击「立即注册」创建账号
3. 自动登录后进入单词学习界面
4. 卡片点击翻转查看释义，点击 🔊 播放发音
5. 选择「已掌握 / 不认识」进入下一个单词

## 🔌 API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/register` | 注册 |
| POST | `/api/auth/login` | 登录 |
| GET  | `/api/auth/me` | 当前用户信息 |
| GET  | `/api/words/today?limit=20` | 今日学习单词 |
| GET  | `/api/words/search?q=xxx` | 搜索单词 |
| POST | `/api/words/:id/mark` | 标记学习状态 |
| POST | `/api/ai/explain` | AI 解释（占位） |

## 🤖 AI 接入指引

修改 `backend/src/routes/ai.js`，使用 DeepSeek/OpenAI 即可：

```js
// 1. 在 .env 添加 DEEPSEEK_KEY=sk-xxxx
// 2. 修改 ai.js 的 explain 路由
const res = await fetch('https://api.deepseek.com/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.DEEPSEEK_KEY}`
  },
  body: JSON.stringify({
    model: 'deepseek-chat',
    messages: [{ role: 'user', content: `解释单词 ${word}...` }]
  })
})
```

## 📦 打包部署

```bash
# 前端打包
cd frontend && npm run build
# 生成 dist/ 目录，可部署到 Vercel/Netlify/Nginx
```

## 📝 License

MIT
