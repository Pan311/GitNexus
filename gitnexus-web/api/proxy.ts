import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * CORS Proxy for isomorphic-git
 * 
 * isomorphic-git calls: /api/proxy?url=https://github.com/...
 */
const ALLOWED_TARGET_HOSTS = [
  'github.com',
  'api.github.com',
  'raw.githubusercontent.com',
  'codeload.github.com',
];

const isLocalOnlyMode = process.env.GITNEXUS_LOCAL_ONLY === undefined
  || process.env.GITNEXUS_LOCAL_ONLY === ''
  || (process.env.GITNEXUS_LOCAL_ONLY !== '0' && process.env.GITNEXUS_LOCAL_ONLY !== 'false');

const ALLOWED_CORS_ORIGINS = new Set(
  isLocalOnlyMode
    ? [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:4173',
      'http://127.0.0.1:4173',
    ]
    : [
      'https://gitnexus.vercel.app',
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:4173',
      'http://127.0.0.1:4173',
    ]
);

const isAllowedTargetHost = (hostname: string): boolean => (
  ALLOWED_TARGET_HOSTS.some((host) => hostname === host || hostname.endsWith(`.${host}`))
);

const isAllowedCorsOrigin = (origin: string | undefined): boolean => (
  !!origin && ALLOWED_CORS_ORIGINS.has(origin)
);

const setCorsHeaders = (req: VercelRequest, res: VercelResponse): boolean => {
  const origin = typeof req.headers.origin === 'string' ? req.headers.origin : undefined;
  if (!isAllowedCorsOrigin(origin)) return false;
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Git-Protocol, Accept');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Type, Content-Length, ETag, Last-Modified');
  return true;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    if (!setCorsHeaders(req, res)) {
      res.status(403).json({ error: 'Origin not allowed' });
      return;
    }
    res.status(200).end();
    return;
  }

  if (!setCorsHeaders(req, res)) {
    res.status(403).json({ error: 'Origin not allowed' });
    return;
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Get URL from query parameter
  const { url } = req.query;
  
  if (!url || typeof url !== 'string') {
    res.status(400).json({ error: 'Missing url query parameter' });
    return;
  }

  // Only allow trusted GitHub hosts for security
  let parsedUrl: URL;
  
  try {
    parsedUrl = new URL(url);
  } catch {
    res.status(400).json({ error: 'Invalid URL' });
    return;
  }
  
  if (parsedUrl.protocol !== 'https:') {
    res.status(403).json({ error: 'Only HTTPS URLs are allowed' });
    return;
  }

  if (!isAllowedTargetHost(parsedUrl.hostname)) {
    res.status(403).json({ error: 'Only GitHub URLs are allowed' });
    return;
  }

  try {
    const headers: Record<string, string> = {
      'User-Agent': 'git/isomorphic-git',
    };
    
    // Forward relevant headers
    // Never forward browser auth headers to non-core GitHub hosts.
    if (
      req.headers.authorization
      && (parsedUrl.hostname === 'github.com' || parsedUrl.hostname === 'api.github.com' || parsedUrl.hostname === 'codeload.github.com')
    ) {
      headers['Authorization'] = req.headers.authorization as string;
    }
    if (req.headers['content-type']) {
      headers['Content-Type'] = req.headers['content-type'] as string;
    }
    if (req.headers['git-protocol']) {
      headers['Git-Protocol'] = req.headers['git-protocol'] as string;
    }
    if (req.headers.accept) {
      headers['Accept'] = req.headers.accept as string;
    }

    // Get request body for POST requests
    let body: Buffer | undefined;
    if (req.method === 'POST') {
      const chunks: Buffer[] = [];
      for await (const chunk of req) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
      }
      body = Buffer.concat(chunks);
    }

    const response = await fetch(url, {
      method: req.method || 'GET',
      headers,
      body: body ? new Uint8Array(body) : undefined,
    });

    // Forward response headers (except ones that cause issues)
    const skipHeaders = [
      'content-encoding', 
      'transfer-encoding', 
      'connection',
      'www-authenticate', // IMPORTANT: Strip this to prevent browser's native auth popup!
    ];
    
    response.headers.forEach((value, key) => {
      if (!skipHeaders.includes(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    });

    res.status(response.status);
    const buffer = await response.arrayBuffer();
    res.send(Buffer.from(buffer));
    
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Proxy request failed' });
  }
}

