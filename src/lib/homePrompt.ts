// Idea escrita en el input del home, pendiente de convertirse en tablero.
// Sobrevive al registro y onboarding; caduca para no crear tableros días después.

const KEY = "miiles:home-prompt";
const TTL_MS = 60 * 60 * 1000;

export function savePendingHomePrompt(prompt: string) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ prompt, ts: Date.now() }));
  } catch {
    /* sin storage disponible */
  }
}

function read(): string | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const { prompt, ts } = JSON.parse(raw) as { prompt?: string; ts?: number };
    if (!prompt || !ts || Date.now() - ts > TTL_MS) {
      localStorage.removeItem(KEY);
      return null;
    }
    return prompt;
  } catch {
    return null;
  }
}

export function hasPendingHomePrompt() {
  return read() !== null;
}

export function takePendingHomePrompt() {
  const prompt = read();
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* noop */
  }
  return prompt;
}
