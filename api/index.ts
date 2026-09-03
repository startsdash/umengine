let appPromise: Promise<any> | null = null;

async function init(): Promise<any> {
  const mod: any = await import('../dist/server.cjs');
  const getApp = mod.getApp || mod.default?.getApp;
  if (!getApp) throw new Error('getApp not found in server bundle. keys: ' + Object.keys(mod).slice(0, 10).join(','));
  return await getApp();
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
