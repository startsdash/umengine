import { getApp } from '../server';

export default async function handler(req: any, res: any) {
  try {
    const app = await getApp();
    return app(req, res);
  } catch (err: any) {
    return res.status(500).json({
      fatal: err?.message || String(err),
      stack: (err?.stack || '').slice(0, 2000)
    });
  }
}
