import NextCors from 'nextjs-cors';

export async function corsMiddleware(req, res) {
  await NextCors(req, res, {
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    origin: '*',
    optionsSuccessStatus: 200,
    credentials: true,
  });
} 