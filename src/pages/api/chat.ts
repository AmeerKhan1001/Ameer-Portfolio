import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  const GEMINI_API_KEY = import.meta.env.GEMINI_API_KEY;

  try {
    const { query, prompt } = await request.json();

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        system_instruction: {
          parts: {
            text: prompt
          }
        },
        contents: {
          parts: {
            text: query
          }
        }
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
