import { Hono } from 'hono';
import { SeedLabelSchema } from '@spiceveg/types';
import { FirebaseClient } from '../lib/firebase';
import { authMiddleware } from '../middleware';

type Bindings = {
  SHORT_LINKS: KVNamespace;
  FIREBASE_PROJECT_ID: string;
  FIREBASE_API_KEY: string;
  FIREBASE_COLLECTION: string;
  SHORT_DOMAIN: string;
  VERIFY_BASE_URL: string;
};

const lots = new Hono<{ Bindings: Bindings }>();

const ALPHABET = '23456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';
const generateSlug = (len = 6) => Array.from({length:len}, () => ALPHABET[Math.floor(Math.random()*ALPHABET.length)]).join('');

// --- PUBLIC READ (for customer verification) ---
lots.get('/:id', async (c) => {
  const lotId = c.req.param('id');
  const fb = new FirebaseClient(c.env.FIREBASE_PROJECT_ID, c.env.FIREBASE_API_KEY);
  const data = await fb.getDocument(c.env.FIREBASE_COLLECTION, `lot_${lotId}`);
  
  if (!data) return c.json({ error: 'Lot not found' }, 404);
  return c.json(data);
});

// --- PROTECTED ADMIN ROUTES ---
lots.use('/*', authMiddleware);

lots.get('/', async (c) => {
  const fb = new FirebaseClient(c.env.FIREBASE_PROJECT_ID, c.env.FIREBASE_API_KEY);
  // Strictly use the seed_labels collection
  const data = await fb.listDocuments(c.env.FIREBASE_COLLECTION);
  return c.json(data);
});

lots.post('/create', async (c) => {
  const body = await c.req.json();
  const result = SeedLabelSchema.safeParse(body);
  
  if (!result.success) {
    return c.json({ error: result.error.format() }, 400);
  }

  const lotData = {
    ...result.data,
    createdAt: result.data.createdAt || new Date().toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric', 
      hour: 'numeric', 
      minute: 'numeric', 
      hour12: true 
    }) // Match legacy 'Apr 24, 2026 12:10 PM' format
  };

  const fb = new FirebaseClient(c.env.FIREBASE_PROJECT_ID, c.env.FIREBASE_API_KEY);
  const docId = `lot_${lotData.lotNo}`;
  
  // 1. Save to Firestore
  const saved = await fb.setDocument(c.env.FIREBASE_COLLECTION, docId, lotData);
  if (!saved) return c.json({ error: 'Failed to save to Firestore' }, 500);

  // 2. Generate and Save Short Link
  const slug = generateSlug();
  const shortLinkData = {
    url: `${c.env.VERIFY_BASE_URL}/?id=${lotData.lotNo}`,
    lotId: lotData.lotNo,
    createdAt: new Date().toISOString()
  };
  await c.env.SHORT_LINKS.put(slug, JSON.stringify(shortLinkData));

  return c.json({
    success: true,
    lotNo: lotData.lotNo,
    shortUrl: `${c.env.SHORT_DOMAIN}/${slug}`,
    qrUrl: `${c.env.SHORT_DOMAIN}/qr/${slug}`
  });
});

export default lots;
