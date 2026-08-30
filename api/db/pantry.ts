import { getDbPool, initDbSchema } from '../../src/db/vpsPostgres';

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');

  const p = getDbPool();
  if (!p) {
    return res.status(200).json({ success: false, pantryItems: [], error: 'База данных не настроена' });
  }

  try {
    // Attempt to ensure schema exists, but don't crash if network fails
    try {
      await initDbSchema();
    } catch (e: any) {
      console.warn('[Vercel DB Pantry] Schema check skipped:', e.message);
    }

    // GET /api/db/pantry
    if (req.method === 'GET') {
      try {
        const result = await p.query('SELECT * FROM pantry_state;');
        return res.status(200).json({
          success: true,
          pantryItems: result.rows.map((r: any) => ({
            id: r.id,
            inPantry: r.in_pantry,
            updatedAt: r.updated_at
          }))
        });
      } catch (dbErr: any) {
        return res.status(200).json({
          success: false,
          pantryItems: [],
          error: dbErr.message || 'Ошибка чтения из базы данных'
        });
      }
    }

    // POST /api/db/pantry
    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? (req.body ? JSON.parse(req.body) : {}) : (req.body || {});
      const items = body.items || body.pantry;
      if (!Array.isArray(items)) {
        return res.status(400).json({ error: 'Ожидается массив items' });
      }

      const client = await p.connect();
      try {
        await client.query('BEGIN');
        for (const item of items) {
          if (item && item.id) {
            await client.query(`
              INSERT INTO pantry_state (id, in_pantry, updated_at)
              VALUES ($1, $2, NOW())
              ON CONFLICT (id) DO UPDATE SET
                in_pantry = EXCLUDED.in_pantry,
                updated_at = NOW();
            `, [item.id, Boolean(item.inPantry ?? item.in_pantry)]);
          }
        }
        await client.query('COMMIT');
        return res.status(200).json({ success: true, count: items.length });
      } catch (e: any) {
        await client.query('ROLLBACK');
        throw e;
      } finally {
        client.release();
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    console.error('[Vercel API DB Pantry] Error:', err.message);
    return res.status(200).json({ success: false, pantryItems: [], error: err.message });
  }
}
