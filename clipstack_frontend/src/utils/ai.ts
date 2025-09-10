const OPENAI_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

/**
 * Generate a short summary of text or URL. For MVP, this runs client-side if OPENAI key is provided.
 * In production move to a secure backend function.
 */
// PUBLIC_INTERFACE
export async function generateSummary(input: { url?: string; text?: string }): Promise<string> {
  const base = (input.text ?? input.url ?? '').slice(0, 400);
  if (!OPENAI_KEY) {
    // Fallback: naive "summary"
    return base ? `Summary: ${base.substring(0, 160)}...` : 'No content to summarize.';
  }

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Summarize concisely (2-3 sentences). Include key insights and source context if a URL is present.' },
          { role: 'user', content: base ? `Summarize: ${base}` : 'Summarize this content.' },
        ],
        temperature: 0.3,
        max_tokens: 120,
      }),
    });
    const json = await res.json();
    const content = json?.choices?.[0]?.message?.content ?? '';
    return content.trim();
  } catch {
    return base ? `Summary: ${base.substring(0, 160)}...` : 'Summary unavailable.';
  }
}
