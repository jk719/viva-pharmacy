import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      
      // Handle SSE endpoints
      if (req.url.includes('/api/user/vivabucks') && req.url.endsWith('/events')) {
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('Cache-Control', 'no-cache, no-transform');
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('X-Accel-Buffering', 'no');
        
        // Increase timeout for SSE connections
        req.setTimeout(0);
        res.setTimeout(0);
      }

      // Handle NextAuth.js session endpoint specially
      if (req.url.startsWith('/api/auth')) {
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Allow-Origin', `http://${hostname}:${port}`);
        res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
        res.setHeader(
          'Access-Control-Allow-Headers',
          'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
        );
      }

      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
