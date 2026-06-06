import { createClient } from '@libsql/client'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { mkdirSync } from 'node:fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dataDir = join(__dirname, '..', '..', 'data')

// 优先使用 Turso 云数据库，否则使用本地 SQLite 文件
const url = process.env.TURSO_URL || `file:${join(dataDir, 'app.db')}`
const authToken = process.env.TURSO_TOKEN

// 本地文件时确保目录存在
if (!process.env.TURSO_URL) {
  mkdirSync(dataDir, { recursive: true })
}

const client = createClient({ url, authToken })

/**
 * 初始化表结构与种子数据
 */
async function init() {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT,
      password TEXT NOT NULL,
      avatar TEXT DEFAULT '🧑‍🎓',
      level TEXT DEFAULT 'CET-4',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS words (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      word TEXT UNIQUE NOT NULL,
      phonetic TEXT,
      translation TEXT NOT NULL,
      example TEXT,
      difficulty INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS study_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      word_id INTEGER NOT NULL,
      status TEXT DEFAULT 'new',
      created_at TEXT DEFAULT (datetime('now'))
    );
  `)

  // 检查并注入种子单词
  const countRes = await client.execute('SELECT COUNT(*) as cnt FROM words')
  const wordCount = Number(countRes.rows[0]?.cnt || 0)

  if (wordCount === 0) {
    const seed = [
      ['vocabulary', '/voʊˈkæbjʊleri/', 'n. 词汇；词汇量', 'Reading extensively can greatly expand your vocabulary.', 2],
      ['diligent', '/ˈdɪlɪdʒənt/', 'adj. 勤奋的；用功的', 'She is a diligent student who always finishes her homework on time.', 2],
      ['magnificent', '/mæɡˈnɪfɪsnt/', 'adj. 壮丽的；宏伟的', 'The magnificent view from the mountaintop took our breath away.', 3],
      ['perseverance', '/ˌpɜːrsɪˈvɪərəns/', 'n. 坚持不懈；不屈不挠', 'Success requires perseverance and hard work.', 3],
      ['enthusiasm', '/ɪnˈθuːziæzəm/', 'n. 热情；激情', 'Her enthusiasm for learning new languages is truly inspiring.', 2],
      ['comprehensive', '/ˌkɒmprɪˈhensɪv/', 'adj. 综合的；全面的', 'The book provides a comprehensive overview of world history.', 3],
      ['remarkable', '/rɪˈmɑːrkəbl/', 'adj. 卓越的；非凡的', 'She has made remarkable progress in her English studies.', 2],
      ['extraordinary', '/ɪkˈstrɔːrdɪneri/', 'adj. 非凡的；特别的', 'It was an extraordinary experience that I will never forget.', 2],
      ['opportunity', '/ˌɒpərˈtuːnəti/', 'n. 机会；时机', 'This job offers a great opportunity for career growth.', 1],
      ['consequence', '/ˈkɒnsɪkwens/', 'n. 结果；后果', 'Every choice we make has consequences.', 2],
      ['fundamental', '/ˌfʌndəˈmentl/', 'adj. 基本的；根本的', 'Reading is a fundamental skill for learning.', 2],
      ['contemplate', '/ˈkɒntəmpleɪt/', 'v. 沉思；考虑', 'She sat by the window to contemplate the meaning of life.', 3],
      ['sophisticated', '/səˈfɪstɪkeɪtɪd/', 'adj. 复杂的；老练的', 'He gave a sophisticated analysis of the situation.', 3],
      ['meticulous', '/məˈtɪkjələs/', 'adj. 一丝不苟的；细致的', 'She is meticulous in her research and never overlooks details.', 3],
      ['articulate', '/ɑːrˈtɪkjələt/', 'adj. 表达清晰的；v. 明确表达', 'He is an articulate speaker who can explain complex ideas simply.', 3],
      ['ambitious', '/æmˈbɪʃəs/', 'adj. 有抱负的；有野心的', 'She has ambitious plans to start her own business.', 2],
      ['collaborate', '/kəˈlæbəreɪt/', 'v. 合作；协作', 'We need to collaborate to finish this project on time.', 2],
      ['demonstrate', '/ˈdemənstreɪt/', 'v. 证明；演示', 'The experiment demonstrates the theory perfectly.', 2],
      ['elaborate', '/ɪˈlæbərət/', 'adj. 精心制作的；详尽的', 'She gave an elaborate explanation of the process.', 3],
      ['fluent', '/ˈfluːənt/', 'adj. 流利的；流畅的', 'He speaks fluent French after years of practice.', 2]
    ]

    for (const row of seed) {
      await client.execute({
        sql: 'INSERT INTO words (word, phonetic, translation, example, difficulty) VALUES (?, ?, ?, ?, ?)',
        args: row
      })
    }
    console.log(`🌱 已注入 ${seed.length} 个种子单词`)
  }
}

// 启动初始化（不阻塞 export，但调用方应在 listen 前 await）
const ready = init().catch((err) => {
  console.error('❌ 数据库初始化失败:', err)
  process.exit(1)
})

/**
 * 兼容 better-sqlite3 风格的 API
 *   db.prepare(sql).get(...args) / .all(...args) / .run(...args)
 *   db.exec(sql)
 */
const db = {
  prepare(sql) {
    return {
      get: async (...args) => {
        const r = await client.execute({ sql, args })
        return r.rows[0] || null
      },
      all: async (...args) => {
        const r = await client.execute({ sql, args })
        return r.rows
      },
      run: async (...args) => {
        const r = await client.execute({ sql, args })
        return {
          lastInsertRowid: Number(r.lastInsertRowid || 0),
          changes: r.rowsAffected || 0
        }
      }
    }
  },
  exec: async (sql) => {
    await client.execute(sql)
  },
  ready
}

export default db
