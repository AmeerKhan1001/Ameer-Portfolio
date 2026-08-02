import type { APIRoute } from 'astro';

const promptFiles = import.meta.glob('../../data/*.md', { as: 'raw' });
const aiPrompt = await promptFiles['../../data/ai-prompt.md']();

// Best-effort per-IP rate limit. Resets on cold start — paired with
// Cloudflare Turnstile below and Vercel Firewall Bot Protection (dashboard)
// as the real defenses; this just caps abuse from a single warm instance.
const RATE_LIMIT = 8; // requests
const RATE_WINDOW_MS = 60_000; // per minute
const hits = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now > entry.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT;
}

async function verifyTurnstile(token: string | undefined, secret: string, ip: string): Promise<boolean> {
  if (!token) return false;
  const body = new URLSearchParams({ secret, response: token, remoteip: ip });
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const data = await res.json();
  return data.success === true;
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const GEMINI_API_KEY = import.meta.env.GEMINI_API_KEY;
  const TURNSTILE_SECRET_KEY = import.meta.env.TURNSTILE_SECRET_KEY;
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || clientAddress || 'unknown';

  if (isRateLimited(ip)) {
    return new Response(JSON.stringify({ error: 'Too many requests, slow down.' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { query, turnstileToken } = await request.json();

    if (!query || typeof query !== 'string' || query.length > 2000) {
      return new Response(JSON.stringify({ error: 'Invalid query.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Only enforced once TURNSTILE_SECRET_KEY is set in the environment —
    // keeps the endpoint working before the Cloudflare widget is configured.
    if (TURNSTILE_SECRET_KEY) {
      const human = await verifyTurnstile(turnstileToken, TURNSTILE_SECRET_KEY, ip);
      if (!human) {
        return new Response(JSON.stringify({ error: 'Bot verification failed.' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': GEMINI_API_KEY,
      },
      body: JSON.stringify({
        system_instruction: {
          parts: {
            text: aiPrompt
          }
        },
        contents: {
          parts: {
            text: query
          }
        },
      })
    });

    const data = await response.json();

    return new Response(JSON.stringify({
      result: data.candidates[0].content.parts[0].text
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Failed to process request'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}
