import { getDbPool, initDbSchema } from '../../src/db/vpsPostgres';

export default async function handler(req: any, res: any) {
  const p = getDbPool();
  if (!p) {
    return res.status(503).json({ error: 'База данных не настроена' });
  }

  try {
    await initDbSchema();

    // GET /api/db/recipes
    if (req.method === 'GET') {
      const result = await p.query('SELECT * FROM saved_recipes ORDER BY created_at DESC LIMIT 50;');
      return res.status(200).json({
        success: true,
        recipes: result.rows.map(r => ({
          id: r.id,
          title: r.title,
          chineseTitle: r.chinese_title,
          pinyin: r.pinyin,
          category: r.category,
          summary: r.summary,
          ingredientsText: r.ingredients_text,
          parsedIngredients: r.parsed_ingredients,
          steps: r.steps,
          notes: r.notes,
          synergyEstimate: r.synergy_estimate,
          sourceUrl: r.source_url,
          createdAt: r.created_at,
          updatedAt: r.updated_at
        }))
      });
    }

    // POST /api/db/recipes
    if (req.method === 'POST') {
      const recipe = req.body;
      if (!recipe || !recipe.id || !recipe.title) {
        return res.status(400).json({ error: 'ID и заголовок рецепта обязательны' });
      }

      await p.query(`
        INSERT INTO saved_recipes (
          id, title, chinese_title, pinyin, category, summary, 
          ingredients_text, parsed_ingredients, steps, notes, synergy_estimate, source_url, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          chinese_title = EXCLUDED.chinese_title,
          pinyin = EXCLUDED.pinyin,
          category = EXCLUDED.category,
          summary = EXCLUDED.summary,
          ingredients_text = EXCLUDED.ingredients_text,
          parsed_ingredients = EXCLUDED.parsed_ingredients,
          steps = EXCLUDED.steps,
          notes = EXCLUDED.notes,
          synergy_estimate = EXCLUDED.synergy_estimate,
          source_url = EXCLUDED.source_url,
          updated_at = NOW();
      `, [
        recipe.id,
        recipe.title,
        recipe.chineseTitle || null,
        recipe.pinyin || null,
        recipe.category || 'wanzhi_brown',
        recipe.summary || null,
        JSON.stringify(recipe.ingredientsText || []),
        JSON.stringify(recipe.parsedIngredients || []),
        JSON.stringify(recipe.steps || []),
        recipe.notes || null,
        recipe.synergyEstimate || null,
        recipe.sourceUrl || null
      ]);

      return res.status(200).json({ success: true, message: 'Рецепт сохранен в PostgreSQL' });
    }

    // DELETE /api/db/recipes?id=xxx
    if (req.method === 'DELETE') {
      const id = req.query?.id || req.body?.id;
      if (!id) {
        return res.status(400).json({ error: 'ID рецепта обязателен' });
      }
      await p.query('DELETE FROM saved_recipes WHERE id = $1;', [id]);
      return res.status(200).json({ success: true, message: 'Рецепт удален' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    console.error('[Vercel API DB Recipes] Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
