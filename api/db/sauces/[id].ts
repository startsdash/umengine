import { getDbPool } from '../../../src/db/vpsPostgres';

export default async function handler(req: any, res: any) {
  const p = getDbPool();
  if (!p) {
    return res.status(503).json({ error: 'База данных не настроена' });
  }

  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: 'ID соуса обязателен' });
  }

  try {
    if (req.method === 'DELETE') {
      await p.query('DELETE FROM custom_sauces WHERE id = $1;', [id]);
      return res.status(200).json({ success: true, message: 'Соус удален' });
    }

    if (req.method === 'GET') {
      const result = await p.query('SELECT * FROM custom_sauces WHERE id = $1;', [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Соус не найден' });
      }
      return res.status(200).json({ success: true, sauce: result.rows[0] });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    console.error('[Vercel API DB Sauce [id]] Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
