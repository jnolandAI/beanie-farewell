import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';

// Rate limiting: simple in-memory tracker (resets on function cold start)
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 30; // requests per hour per device
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour in ms

function isRateLimited(deviceId: string): boolean {
  const now = Date.now();
  const record = requestCounts.get(deviceId);

  if (!record || now > record.resetTime) {
    requestCounts.set(deviceId, { count: 1, resetTime: now + RATE_WINDOW });
    return false;
  }

  if (record.count >= RATE_LIMIT) {
    return true;
  }

  record.count++;
  return false;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Device-ID',
      },
    });
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Get API key from Supabase secrets
    const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!apiKey) {
      console.error('ANTHROPIC_API_KEY not configured');
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get device ID for rate limiting
    const deviceId = req.headers.get('X-Device-ID') || 'anonymous';
    
    if (isRateLimited(deviceId)) {
      return new Response(JSON.stringify({ 
        error: 'Rate limit exceeded. Please try again later.',
        retryAfter: 3600
      }), {
        status: 429,
        headers: { 
          'Content-Type': 'application/json',
          'Retry-After': '3600',
        },
      });
    }

    // Parse request body
    const body = await req.json();

    // Validate required fields
    if (!body.messages || !Array.isArray(body.messages)) {
      return new Response(JSON.stringify({ error: 'Invalid request: messages required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Forward to Anthropic API
    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': ANTHROPIC_VERSION,
      },
      body: JSON.stringify({
        model: body.model || 'claude-sonnet-4-20250514',
        max_tokens: body.max_tokens || 2048,
        temperature: body.temperature ?? 0,
        messages: body.messages,
      }),
    });

    // Return Anthropic response
    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
