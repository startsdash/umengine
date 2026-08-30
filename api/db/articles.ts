import { getDbPool, initDbSchema } from '../../src/db/vpsPostgres';

export default async function handler(req: any, res: any) {
  const p = getDbPool();
  if (!p) {
    return res.status(503).json({ error: 'База данных не настроена' });
  }

  try {
    await initDbSchema();

    // GET /api/db/articles
    if (req.method === 'GET') {
      const result = await p.query('SELECT * FROM saved_articles ORDER BY created_at DESC LIMIT 50;');
      return res.status(200).json({
        success: true,
        articles: result.rows.map(r => ({
          id: r.id,
          title: r.title,
          subtitle: r.subtitle,
          author: r.author,
          readTimeMinutes: r.read_time_minutes,
          tags: r.tags,
          summary: r.summary,
          markdownContent: r.markdown_content,
          keyBiochemicalTakeaways: r.key_biochemical_takeaways,
          sourceUrl: r.source_url,
          createdAt: r.created_at,
          updatedAt: r.updated_at
        }))
      });
    }

    // POST /api/db/articles
    if (req.method === 'POST') {
      const article = req.body;
      if (!article || !article.id || !article.title) {
        return res.status(400).json({ error: 'ID и заголовок статьи обязательны' });
      }

      await p.query(`
        INSERT INTO saved_articles (
          id, title, subtitle, author, read_time_minutes, tags, 
          summary, markdown_content, key_biochemical_takeaways, source_url, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          subtitle = EXCLUDED.subtitle,
          author = EXCLUDED.author,
          read_time_minutes = EXCLUDED.read_time_minutes,
          tags = EXCLUDED.tags,
          summary = EXCLUDED.summary,
          markdown_content = EXCLUDED.markdown_content,
          key_biochemical_takeaways = EXCLUDED.key_biochemical_takeaways,
          source_url = EXCLUDED.source_url,
          updated_at = NOW();
      `, [
        article.id,
        article.title,
        article.subtitle || null,
        article.author || null,
        article.readTimeMinutes || 5,
        JSON.stringify(article.tags || []),
        article.summary || null,
        article.markdownContent || '',
        JSON.stringify(article.keyBiochemicalTakeaways || []),
        article.sourceUrl || null
      ]);

      return res.status(200).json({ success: true, message: 'Статья сохранена в PostgreSQL' });
    }

    // DELETE /api/db/articles?id=xxx
    if (req.method === 'DELETE') {
      const id = req.query?.id || req.body?.id;
      if (!id) {
        return res.status(400).json({ error: 'ID статьи обязателен' });
      }
      await p.query('DELETE FROM saved_articles WHERE id = $1;', [id]);
      return res.status(200).json({ success: true, message: 'Статья удалена' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    console.error('[Vercel API DB Articles] Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
