export interface AiRewriteResult {
  text: string;
  provider: 'openai' | 'local-fallback';
}

export interface AiVoiceoverResult {
  script: string;
  audioUrl: string;
  provider: 'elevenlabs' | 'web-speech-fallback';
}

export function getAIProviderCapabilities() {
  return {
    llmProvider: process.env.OPENAI_API_KEY ? 'openai' : 'local-fallback',
    ttsProvider: process.env.ELEVENLABS_API_KEY
      ? 'elevenlabs'
      : 'web-speech-fallback',
  };
}

export async function enhanceHotspotTextWithAI(input: {
  text: string;
  tone: string;
  stepTitle: string;
}): Promise<AiRewriteResult> {
  return generateAiText(
    `Rewrite interactive product demo callouts in a ${input.tone} tone (< 20 words).`,
    `Step "${input.stepTitle}": ${input.text}`,
    `[${input.tone}] ${input.text}`
  );
}

export async function translateTextWithAI(input: {
  text: string;
  targetLanguage: string;
}): Promise<AiRewriteResult> {
  const prefixMap: Record<string, string> = {
    'Spanish (es-ES)': 'Paso interactivo:',
    Spanish: 'Paso interactivo:',
    'French (fr-FR)': 'Étape interactive :',
    French: 'Étape interactive :',
    'German (de-DE)': 'Interaktiver Schritt:',
    German: 'Interaktiver Schritt:',
    'Japanese (ja-JP)': 'インタラクティブステップ：',
    Japanese: 'インタラクティブステップ：',
  };
  const prefix = prefixMap[input.targetLanguage] || `[${input.targetLanguage}]`;
  return generateAiText(
    `Translate the interactive demo callout into ${input.targetLanguage}. Preserve {{tokens}}.`,
    input.text,
    `${prefix} ${input.text}`
  );
}

export async function generateAiText(
  systemPrompt: string,
  userPrompt: string,
  fallbackText: string
): Promise<AiRewriteResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return { text: fallbackText, provider: 'local-fallback' };
  }

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.4,
      }),
    });
    if (!res.ok) {
      return { text: fallbackText, provider: 'local-fallback' };
    }
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content?.trim();
    return {
      text: content || fallbackText,
      provider: content ? 'openai' : 'local-fallback',
    };
  } catch {
    return { text: fallbackText, provider: 'local-fallback' };
  }
}

export async function synthesizeVoiceover(
  script: string,
  voiceName: string,
  stepId: string
): Promise<AiVoiceoverResult> {
  const elevenKey = process.env.ELEVENLABS_API_KEY;
  if (!elevenKey) {
    return {
      script,
      audioUrl: `speech://web-speech-api/${stepId}?voice=${encodeURIComponent(voiceName)}`,
      provider: 'web-speech-fallback',
    };
  }

  try {
    const voiceId = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM';
    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': elevenKey,
        },
        body: JSON.stringify({
          text: script,
          model_id: 'eleven_multilingual_v2',
        }),
      }
    );
    if (!res.ok) {
      return {
        script,
        audioUrl: `speech://web-speech-api/${stepId}?voice=${encodeURIComponent(voiceName)}`,
        provider: 'web-speech-fallback',
      };
    }
    const buf = Buffer.from(await res.arrayBuffer());
    const base64Audio = `data:audio/mpeg;base64,${buf.toString('base64')}`;
    return {
      script,
      audioUrl: base64Audio,
      provider: 'elevenlabs',
    };
  } catch {
    return {
      script,
      audioUrl: `speech://web-speech-api/${stepId}?voice=${encodeURIComponent(voiceName)}`,
      provider: 'web-speech-fallback',
    };
  }
}
