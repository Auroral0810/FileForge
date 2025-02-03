import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'

const app = express()
const port = 3001

// 中间件配置
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 基础路由
app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

// 启动服务器
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`)
})

export default app