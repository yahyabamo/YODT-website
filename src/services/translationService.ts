/**
 * translationService.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Modular translation service supporting multiple providers:
 *   • Google Translate API  (VITE_GOOGLE_TRANSLATE_KEY)
 *   • OpenAI GPT API        (VITE_OPENAI_API_KEY)
 *   • none                  (falls back silently → manual input)
 *
 * To switch providers later, only change this file. UI is untouched.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type TranslationProvider = 'google' | 'openai' | 'none';

export const SUPPORTED_LANGS = ['ar', 'en', 'tr'] as const;
export type SupportedLang = typeof SUPPORTED_LANGS[number];

// ── Provider detection ────────────────────────────────────────────────────────

function getProvider(): TranslationProvider {
  const googleKey = import.meta.env.VITE_GOOGLE_TRANSLATE_KEY;
  const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (googleKey && googleKey.trim().length > 0) return 'google';
  if (openaiKey && openaiKey.trim().length > 0) return 'openai';
  return 'none';
}

export function isTranslationAvailable(): boolean {
  return getProvider() !== 'none';
}

// ── Google Translate ──────────────────────────────────────────────────────────

async function translateWithGoogle(
  text: string,
  from: SupportedLang,
  to: SupportedLang
): Promise<string> {
  const key = import.meta.env.VITE_GOOGLE_TRANSLATE_KEY;
  const url = `https://translation.googleapis.com/language/translate/v2?key=${key}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ q: text, source: from, target: to, format: 'text' }),
  });
  if (!res.ok) throw new Error(`Google Translate error: ${res.status}`);
  const json = await res.json();
  return json?.data?.translations?.[0]?.translatedText ?? '';
}

// ── OpenAI Translation ────────────────────────────────────────────────────────

const LANG_NAMES: Record<SupportedLang, string> = {
  ar: 'Arabic',
  en: 'English',
  tr: 'Turkish',
};

async function translateWithOpenAI(
  text: string,
  from: SupportedLang,
  to: SupportedLang
): Promise<string> {
  const key = import.meta.env.VITE_OPENAI_API_KEY;
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a professional translator. Translate the following text from ${LANG_NAMES[from]} to ${LANG_NAMES[to]}. Return ONLY the translated text with no explanations, no quotes, and no extra formatting.`,
        },
        { role: 'user', content: text },
      ],
      temperature: 0.2,
    }),
  });
  if (!res.ok) throw new Error(`OpenAI error: ${res.status}`);
  const json = await res.json();
  return json?.choices?.[0]?.message?.content?.trim() ?? '';
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Translate a single piece of text from one language to another.
 * Returns empty string if provider is unavailable or text is empty.
 */
export async function translateText(
  text: string,
  from: SupportedLang,
  to: SupportedLang
): Promise<string> {
  if (!text.trim() || from === to) return text;
  const provider = getProvider();
  if (provider === 'none') return '';
  if (provider === 'google') return translateWithGoogle(text, from, to);
  if (provider === 'openai') return translateWithOpenAI(text, from, to);
  return '';
}

/**
 * Translate multiple fields at once (more efficient for OpenAI).
 * Returns a partial record of translated values keyed by field name.
 */
export async function translateFields(
  fields: Record<string, string>,
  from: SupportedLang,
  to: SupportedLang
): Promise<Record<string, string>> {
  const provider = getProvider();
  if (provider === 'none') return {};

  // For OpenAI: batch into a single call to save tokens
  if (provider === 'openai') {
    return translateFieldsBatchOpenAI(fields, from, to);
  }

  // For Google: parallel requests
  const entries = Object.entries(fields).filter(([, v]) => v.trim().length > 0);
  const results = await Promise.allSettled(
    entries.map(([key, val]) =>
      translateText(val, from, to).then(t => ({ key, value: t }))
    )
  );

  const out: Record<string, string> = {};
  results.forEach(r => {
    if (r.status === 'fulfilled' && r.value.value) {
      out[r.value.key] = r.value.value;
    }
  });
  return out;
}

async function translateFieldsBatchOpenAI(
  fields: Record<string, string>,
  from: SupportedLang,
  to: SupportedLang
): Promise<Record<string, string>> {
  const key = import.meta.env.VITE_OPENAI_API_KEY;
  const entries = Object.entries(fields).filter(([, v]) => v.trim().length > 0);
  if (entries.length === 0) return {};

  const fieldList = entries
    .map(([k, v]) => `[${k}]: ${v}`)
    .join('\n\n');

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a professional translator. Translate the following labeled fields from ${LANG_NAMES[from]} to ${LANG_NAMES[to]}. Return ONLY a valid JSON object mapping each field key to its translated value. No markdown, no extra text.`,
        },
        { role: 'user', content: fieldList },
      ],
      temperature: 0.2,
      response_format: { type: 'json_object' },
    }),
  });
  if (!res.ok) throw new Error(`OpenAI batch error: ${res.status}`);
  const json = await res.json();
  const raw = json?.choices?.[0]?.message?.content ?? '{}';
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}
