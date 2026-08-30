import { getDbPool, initDbSchema } from '../_lib/db';

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');

  const p = getDbPool();
  if (!p) {
    return res.status(200).json({ success: false, sauces: [], error: 'База данных не настроена' });
  }

  try {
    try {
      await initDbSchema();
    } catch (e: any) {
      console.warn('[Vercel DB Sauces] Schema check skipped:', e.message);
    }

    // GET /api/db/sauces
    if (req.method === 'GET') {
      try {
        const result = await p.query('SELECT * FROM custom_sauces ORDER BY created_at DESC;');
        return res.status(200).json({
          success: true,
          sauces: result.rows.map((r: any) => ({
            id: r.id,
            title: r.title,
            chineseTitle: r.chinese_title,
            pinyin: r.pinyin,
            category: r.category,
            summary: r.summary,
            scientificBreakdown: r.scientific_breakdown,
            ingredients: r.ingredients,
            steps: r.steps,
            targetProteins: r.target_proteins,
            tasteProfile: r.taste_profile,
            createdAt: r.created_at,
            updatedAt: r.updated_at
          }))
        });
      } catch (dbErr: any) {
        return res.status(200).json({
          success: false,
          sauces: [],
          error: dbErr.message || 'Ошибка чтения соусов'
        });
      }
    }

    // POST /api/db/sauces
    if (req.method === 'POST') {
      const sauce = typeof req.body === 'string' ? (req.body ? JSON.parse(req.body) : {}) : (req.body || {});
      if (!sauce || !sauce.id || !sauce.title) {
        return res.status(400).json({ error: 'ID и название соуса обязательны' });
      }

      await p.query(`
        INSERT INTO custom_sauces (
          id, title, chinese_title, pinyin, category, summary, 
          scientific_breakdown, ingredients, steps, target_proteins, taste_profile, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          chinese_title = EXCLUDED.chinese_title,
          pinyin = EXCLUDED.pinyin,
          category = EXCLUDED.category,
          summary = EXCLUDED.summary,
          scientific_breakdown = EXCLUDED.scientific_breakdown,
          ingredients = EXCLUDED.ingredients,
          steps = EXCLUDED.steps,
          target_proteins = EXCLUDED.target_proteins,
          taste_profile = EXCLUDED.taste_profile,
          updated_at = NOW();
      `, [
        sauce.id,
        sauce.title,
        sauce.chineseTitle || null,
        sauce.pinyin || null,
        sauce.category || 'custom',
        sauce.summary || null,
        sauce.scientificBreakdown || null,
        JSON.stringify(sauce.ingredients || []),
        JSON.stringify(sauce.steps || []),
        JSON.stringify(sauce.targetProteins || []),
        sauce.tasteProfile ? JSON.stringify(sauce.tasteProfile) : null
      ]);

      return res.status(200).json({ success: true, message: 'Соус сохранен в PostgreSQL на VPS' });
    }

    // DELETE /api/db/sauces?id=xxx
    if (req.method === 'DELETE') {
      const id = req.query?.id || req.body?.id;
      if (!id) {
        return res.status(400).json({ error: 'ID соуса обязателен' });
      }
      await p.query('DELETE FROM custom_sauces WHERE id = $1;', [id]);
      return res.status(200).json({ success: true, message: 'Соус удален' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    console.error('[Vercel API DB Sauces] Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
