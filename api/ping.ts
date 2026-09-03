export default function handler(req: any, res: any) {
  res.status(200).json({ pong: true, time: new Date().toISOString(), path: req.url });
}
