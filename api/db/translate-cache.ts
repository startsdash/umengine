import { getDbPool, initDbSchema } from '../_lib/db';

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');

  const p = getDbPool();
  if (!p) {
    return res.status(200).json({ success: false, error: 'База данных не настроена' });
  }

  try {
    try {
      await initDbSchema();
    } catch (e: any) {
      console.warn('[Vercel DB Translate Cache] Schema check skipped:', e.message);
    }

    // GET /api/db/translate-cache?key=xxx
    if (req.method === 'GET') {
      const key = req.query?.key as string;
      if (!key) {
        return res.status(400).json({ error: 'Параметр key обязателен' });
      }

      try {
        const result = await p.query('SELECT * FROM translations_cache WHERE cache_key = $1;', [key]);
        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Кэш не найден' });
        }

        return res.status(200).json({
          success: true,
          cacheKey: result.rows[0].cache_key,
          itemType: result.rows[0].item_type,
          translatedPayload: result.rows[0].translated_payload
        });
      } catch (dbErr: any) {
        return res.status(200).json({ success: false, error: dbErr.message });
      }
    }

    // POST /api/db/translate-cache
    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? (req.body ? JSON.parse(req.body) : {}) : (req.body || {});
      const { cacheKey, itemType, translatedPayload } = body;
      if (!cacheKey || !itemType || !translatedPayload) {
        return res.status(400).json({ error: 'cacheKey, itemType и translatedPayload обязательны' });
      }

      await p.query(`
        INSERT INTO translations_cache (cache_key, item_type, translated_payload, created_at)
        VALUES ($1, $2, $3, NOW())
        ON CONFLICT (cache_key) DO UPDATE SET
          translated_payload = EXCLUDED.translated_payload;
      `, [cacheKey, itemType, JSON.stringify(translatedPayload)]);

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    console.error('[Vercel API DB Translate Cache] Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
