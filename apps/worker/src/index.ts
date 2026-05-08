import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

app.use('*', cors())

app.get('/', (c) => {
  return c.json({
    message: 'SpiceVeg Agri API',
    version: '1.0.0',
    status: 'healthy'
  })
})

app.get('/api/v1/health', (c) => {
  return c.json({ status: 'ok' })
})

export default app
