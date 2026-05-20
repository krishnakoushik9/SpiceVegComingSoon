import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { ShortLinkMetadata } from '@spiceveg/types'
import lots from './routes/lots'
import auth from './routes/auth'

type Bindings = {
  SHORT_LINKS: KVNamespace
  SHORT_DOMAIN: string
  VERIFY_BASE_URL: string
  JWT_SECRET: string
  ADMIN_USERNAME: string
  ADMIN_HASH: string
  FIREBASE_PROJECT_ID: string
  FIREBASE_API_KEY: string
  FIREBASE_COLLECTION: string
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('*', cors({
  origin: '*', // Adjust for production
  credentials: true,
}))

// --- URL SHORTENER REDIRECT ENGINE ---
app.post('/shorten', async (c) => {
  const { url } = await c.req.json();
  const slug = Math.random().toString(36).substring(2, 8);
  await c.env.SHORT_LINKS.put(slug, JSON.stringify({ url, createdAt: new Date().toISOString() }));
  return c.json({ short: `${c.env.SHORT_DOMAIN}/${slug}` });
});

app.get('/:slug', async (c) => {
  const slug = c.req.param('slug')
  if (slug === 'api' || slug.startsWith('api/')) return c.notFound()

  const data = await c.env.SHORT_LINKS.get<ShortLinkMetadata>(slug, 'json')
  if (data) return c.redirect(data.url, 302)

  return c.notFound()
})

app.get('/qr/:slug', async (c) => {
  const slug = c.req.param('slug')
  const data = await c.env.SHORT_LINKS.get<ShortLinkMetadata>(slug, 'json')
  if (data) return c.redirect(data.url, 302)
  return c.notFound()
})

// --- API SUB-APP ---
app.route('/api/v1/lots', lots)
app.route('/api/v1/auth', auth)

app.get('/api/v1/health', (c) => {
  return c.json({ status: 'ok', service: 'SpiceVeg API' })
})

export default app
