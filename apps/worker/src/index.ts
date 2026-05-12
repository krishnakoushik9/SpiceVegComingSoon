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

// --- MULTI-DOMAIN ASSET ROUTING ---
app.use('*', async (c, next) => {
  const url = new URL(c.req.url)
  const hostname = url.hostname

  // If it's an API call or short link slug (except the root), continue to routes
  if (url.pathname.startsWith('/api/') || (url.pathname.length > 1 && hostname === 's.spiceveg.in')) {
    return next()
  }

  // Handle root and static files based on hostname
  if (hostname === 'admin.spiceveg.in') {
    // Serve admin frontend
    if (url.pathname === '/' || url.pathname === '/index.html') {
      return fetch(new Request(new URL('/admin/index.html', url.origin)))
    }
    return fetch(new Request(new URL(`/admin${url.pathname}`, url.origin)))
  } else if (hostname === 'spiceveg.in' || hostname === 'www.spiceveg.in' || hostname === 'verify.spiceveg.in') {
    // Serve web frontend
    if (url.pathname === '/' || url.pathname === '/index.html') {
      return fetch(new Request(new URL('/web/index.html', url.origin)))
    }
    return fetch(new Request(new URL(`/web${url.pathname}`, url.origin)))
  }

  return next()
})

// --- URL SHORTENER REDIRECT ENGINE ---
app.get('/:slug', async (c) => {
  const slug = c.req.param('slug')
  if (slug === 'api' || slug.startsWith('api/')) return c.notFound()

  const data = await c.env.SHORT_LINKS.get<ShortLinkMetadata>(slug, 'json')
  if (data) return c.redirect(data.url, 302)

  return c.html(`
    <div style="font-family: sans-serif; text-align: center; padding: 50px;">
      <h1>Link Not Found</h1>
      <p>The short link you followed is invalid or has expired.</p>
      <a href="https://spiceveg.in" style="color: #3B6D11;">Go to SpiceVeg.in</a>
    </div>
  `, 404)
})

// --- API SUB-APP ---
app.route('/api/v1/lots', lots)
app.route('/api/v1/auth', auth)

app.get('/api/v1/health', (c) => {
  return c.json({ status: 'ok', service: 'SpiceVeg API' })
})

export default app
