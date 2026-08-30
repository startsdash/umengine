import { checkDbConnection } from '../../src/db/vpsPostgres';

export default async function handler(req: any, res: any) {
  try {
    const status = await checkDbConnection();
    return res.status(200).json({
      success: true,
      ...status
    });
  } catch (err: any) {
    return res.status(200).json({
      success: false,
      connected: false,
      error: err.message || 'Ошибка подключения к PostgreSQL',
      host: '2.26.86.122',
      database: 'umami_db'
    });
  }
}
