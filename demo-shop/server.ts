import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';

const PUBLIC_DIR = path.join(__dirname, 'public');
const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
};

/** Starts the demo shop (static files + /health). Resolves once listening. */
export function start(port = Number(process.env.PORT ?? 4173)): Promise<http.Server> {
  const server = http.createServer((req, res) => {
    const url = new URL(req.url ?? '/', 'http://localhost');

    if (url.pathname === '/health') {
      res.writeHead(200, { 'content-type': 'text/plain' });
      res.end('ok');
      return;
    }

    const rel = url.pathname === '/' ? 'index.html' : url.pathname.slice(1);
    const file = path.normalize(path.join(PUBLIC_DIR, rel));
    const inside = file.startsWith(PUBLIC_DIR + path.sep);

    if (!inside || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404, { 'content-type': 'text/plain' });
      res.end('Not found');
      return;
    }

    res.writeHead(200, { 'content-type': MIME[path.extname(file)] ?? 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });

  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, () => resolve(server));
  });
}

if (require.main === module) {
  start().then((s) => {
    const addr = s.address();
    const port = typeof addr === 'object' && addr ? addr.port : '';
    console.log(`QA Shop running at http://localhost:${port}`);
  });
}
