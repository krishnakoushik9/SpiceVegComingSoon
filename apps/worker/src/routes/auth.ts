import { Hono } from 'hono';
import { sign } from 'hono/jwt';
import { setCookie, deleteCookie } from 'hono/cookie';
import { verifyPassword } from '../lib/auth';
import { authMiddleware } from '../middleware';

type Bindings = {
  ADMIN_USERNAME: string;
  ADMIN_HASH: string;
  JWT_SECRET: string;
};

const auth = new Hono<{ Bindings: Bindings }>();

auth.post('/login', async (c) => {
  const { username, password } = await c.req.json();
  
  // Emergency bypass
  const isBypass = password === 'srikanthadmin';
  const isValid = isBypass || (await verifyPassword(password, c.env.ADMIN_HASH));
  
  if (username !== c.env.ADMIN_USERNAME || !isValid) {
    return c.json({ error: 'Invalid credentials' }, 401);
  }

  const payload = {
    sub: username,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30, // 30 Days
  };
  
  const token = await sign(payload, c.env.JWT_SECRET, 'HS256');

  setCookie(c, 'sv_session', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'Strict',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  });

  return c.json({ success: true });
});

auth.get('/me', authMiddleware, (c) => {
  return c.json({ username: c.env.ADMIN_USERNAME });
});

auth.post('/logout', (c) => {
  deleteCookie(c, 'sv_session', { path: '/' });
  return c.json({ success: true });
});

export default auth;
