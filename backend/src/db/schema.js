// 数据库 Schema 说明
// 实际表结构在 ./index.js 中创建（启动时自动初始化）
// 这里保留为 schema 参考文档

/*
  users 表
  - id: 主键自增
  - username: 用户名 (unique)
  - email: 邮箱 (unique)
  - password: bcrypt 加密密码
  - avatar: 头像 emoji
  - level: 等级 (CET-4 / CET-6 / IELTS / GRE)
  - created_at: 创建时间

  words 表
  - id: 主键自增
  - word: 单词 (unique)
  - phonetic: 音标
  - translation: 中文释义
  - example: 英文例句
  - difficulty: 难度 1-5

  study_records 表
  - id: 主键自增
  - user_id: 用户 ID
  - word_id: 单词 ID
  - status: new / learning / mastered
  - created_at: 记录时间
*/
export const SCHEMA_DOC = 'schema defined in index.js'
