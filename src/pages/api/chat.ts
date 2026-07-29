import type { APIRoute } from 'astro';

const promptFiles = import.meta.glob('../../data/*.md', { as: 'raw' });
const aiPrompt = await promptFiles['../../data/ai-prompt.md']();

export const POST: APIRoute = async ({ request }) => {
  const GEMINI_API_KEY = import.meta.env.GEMINI_API_KEY;

  try {
    const { query } = await request.json();

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent`, {
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
