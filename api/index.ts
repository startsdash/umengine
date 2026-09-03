let appPromise: Promise<any> | null = null;

async function init(): Promise<any> {
  try {
    const mod = await import('../server');
    return await mod.getApp();
  } catch (err: any) {
    console.error('SERVER INIT FATAL:', err?.stack || err);
    throw err;
  }
}

export default async function handler(req: any, res: any) {
  try {
    if (!appPromise) appPromise = init();
    const app = await appPromise;
    return app(req, res);
  } catch (err: any) {
    return res.status(500).json({
      fatal: err?.message || String(err),
      stack: (err?.stack || '').slice(0, 2500)
    });
  }
}
