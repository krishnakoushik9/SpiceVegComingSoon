import { Context, Next } from 'hono';
import { getCookie } from 'hono/cookie';
import { verify } from 'hono/jwt';

export const authMiddleware = async (c: Context, next: Next) => {
  const token = getCookie(c, 'sv_session');
  
  if (!token) {
    return c.json({ error: 'Unauthorized: No session found' }, 401);
  }

  try {
    const payload = await verify(token, c.env.JWT_SECRET, 'HS256');
    c.set('jwtPayload', payload);
    await next();
  } catch (e) {
    return c.json({ error: 'Unauthorized: Invalid or expired session' }, 401);
  }
};
