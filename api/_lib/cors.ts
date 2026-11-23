interface HeaderReadableRequest {
  headers: Record<string, string | string[] | undefined>;
}

interface HeaderWritableResponse {
  setHeader(name: string, value: string): unknown;
}

function getAllowedOrigins(): string[] {
  const configured = [
    process.env.ALLOWED_ORIGIN,
    process.env.APP_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
    process.env.VERCEL_BRANCH_URL ? `https://${process.env.VERCEL_BRANCH_URL}` : undefined,
  ]
    .filter((value): value is string => Boolean(value && value.trim()))
    .flatMap((value) => value.split(',').map((item) => item.trim().replace(/\/$/, '')));

  return Array.from(new Set(configured));
}

export function applyCorsHeaders(
  req: HeaderReadableRequest,
  res: HeaderWritableResponse,
  methods: string,
): void {
  const originHeader = req.headers.origin;
  const requestOrigin = Array.isArray(originHeader) ? originHeader[0] : originHeader;
  const allowedOrigins = getAllowedOrigins();

  if (allowedOrigins.includes('*')) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  } else if (requestOrigin) {
    const normalizedOrigin = requestOrigin.replace(/\/$/, '');
    const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(normalizedOrigin);
    const isVercelPreview = /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(normalizedOrigin);

    if (allowedOrigins.includes(normalizedOrigin) || isLocalhost || isVercelPreview) {
      res.setHeader('Access-Control-Allow-Origin', normalizedOrigin);
      res.setHeader('Vary', 'Origin');
    }
  }

  res.setHeader('Access-Control-Allow-Methods', methods);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('X-Content-Type-Options', 'nosniff');
}
