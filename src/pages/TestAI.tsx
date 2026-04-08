import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, ArrowLeft, Loader2, Search, Instagram } from "lucide-react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

type Msg = { role: "user" | "assistant"; content: string };
type Tab = "chat" | "instagram";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;
const IG_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-instagram`;

async function streamChat({
  messages,
  onDelta,
  onDone,
}: {
  messages: Msg[];
  onDelta: (t: string) => void;
  onDone: () => void;
}) {
  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages }),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: "Error desconocido" }));
    throw new Error(err.error || `Error ${resp.status}`);
  }

  if (!resp.body) throw new Error("No stream body");
  await readStream(resp.body, onDelta, onDone);
}

async function analyzeInstagram({
  username,
  onDelta,
  onDone,
}: {
  username: string;
  onDelta: (t: string) => void;
  onDone: () => void;
}) {
  const resp = await fetch(IG_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ username }),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: "Error desconocido" }));
    throw new Error(err.error || `Error ${resp.status}`);
  }

  if (!resp.body) throw new Error("No stream body");
  await readStream(resp.body, onDelta, onDone);
}

async function readStream(
  body: ReadableStream<Uint8Array>,
  onDelta: (t: string) => void,
  onDone: () => void
) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buf = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });

    let idx: number;
    while ((idx = buf.indexOf("\n")) !== -1) {
      let line = buf.slice(0, idx);
      buf = buf.slice(idx + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (!line.startsWith("data: ")) continue;
      const json = line.slice(6).trim();
      if (json === "[DONE]") { onDone(); return; }
      try {
        const parsed = JSON.parse(json);
        const c = parsed.choices?.[0]?.delta?.content;
        if (c) onDelta(c);
      } catch {
        buf = line + "\n" + buf;
        break;
      }
    }
  }
  onDone();
}

const TestAI = () => {
  const [tab, setTab] = useState<Tab>("instagram");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const upsertAssistant = (assistantSoFar: { current: string }) => (chunk: string) => {
    assistantSoFar.current += chunk;
    const content = assistantSoFar.current;
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (last?.role === "assistant") {
        return prev.map((m, i) =>
          i === prev.length - 1 ? { ...m, content } : m
        );
      }
      return [...prev, { role: "assistant", content }];
    });
  };

  const sendChat = async () => {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");

    const userMsg: Msg = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    const ref = { current: "" };
    try {
      await streamChat({
        messages: [...messages, userMsg],
        onDelta: upsertAssistant(ref),
        onDone: () => setIsLoading(false),
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
      setIsLoading(false);
    }
  };

  const sendInstagram = async () => {
    const raw = input.trim().replace(/^@/, "").trim();
    if (!raw || isLoading) return;

    // Validate: only allow valid Instagram usernames (letters, numbers, dots, underscores)
    if (!/^[a-zA-Z0-9._]{1,30}$/.test(raw)) {
      toast.error("Escribe solo el nombre de usuario de Instagram (ej: nike, gymshark)");
      return;
    }

    setInput("");

    const profileUrl = `https://www.instagram.com/${raw}/`;
    const embedHtml = `[![@${raw}](https://www.instagram.com/${raw}/)](${profileUrl})\n\n🔗 [Ver perfil en Instagram](${profileUrl})`;
    const userMsg: Msg = { role: "user", content: `🔍 Analizando @${raw}...` };
    setMessages((prev) => [
      ...prev,
      userMsg,
      { role: "assistant", content: embedHtml + "\n\n⏳ Analizando..." },
    ]);
    setIsLoading(true);

    const ref = { current: embedHtml + "\n\n" };
    try {
      await analyzeInstagram({
        username: raw,
        onDelta: upsertAssistant(ref),
        onDone: () => setIsLoading(false),
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
      setIsLoading(false);
    }
  };

  const send = tab === "chat" ? sendChat : sendInstagram;
  const placeholder = tab === "chat" ? "Escribe un mensaje..." : "Solo el usuario (ej: nike, gymshark)";

  return (
    <div className="flex flex-col h-screen bg-[#0A0A0F] text-white">
      {/* Header */}
      <header className="flex items-center gap-3 px-6 py-4 border-b border-white/10">
        <Link to="/" className="text-white/50 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <Bot size={22} className="text-primary" />
        <h1 className="text-lg font-semibold tracking-tight">Miiles AI — Test</h1>

        {/* Tabs */}
        <div className="ml-auto flex gap-1 bg-white/5 rounded-lg p-1">
          <button
            onClick={() => setTab("chat")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              tab === "chat" ? "bg-primary text-white" : "text-white/50 hover:text-white"
            }`}
          >
            <Bot size={14} /> Chat
          </button>
          <button
            onClick={() => setTab("instagram")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              tab === "instagram" ? "bg-primary text-white" : "text-white/50 hover:text-white"
            }`}
          >
            <Search size={14} /> Instagram
          </button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-white/30 gap-3">
            {tab === "chat" ? (
              <>
                <Bot size={48} />
                <p className="text-sm">Escribe algo para comenzar a hablar con Gemini</p>
              </>
            ) : (
              <>
                <Search size={48} />
                <p className="text-sm text-center max-w-md">
                  Escribe un nombre de usuario de Instagram para analizar si busca afiliados
                </p>
                <div className="flex gap-2 mt-2">
                  {["nike", "gymshark", "fashionnova"].map((ex) => (
                    <button
                      key={ex}
                      onClick={() => setInput(ex)}
                      className="px-3 py-1 rounded-full bg-white/5 text-white/40 text-xs hover:bg-white/10 hover:text-white/60 transition-colors"
                    >
                      @{ex}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex gap-3 max-w-3xl mx-auto ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {m.role === "assistant" && (
              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                <Bot size={16} className="text-primary" />
              </div>
            )}
            <div
              className={`rounded-2xl px-4 py-3 max-w-[80%] text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-primary text-white"
                  : "bg-white/5 text-white/90"
              }`}
            >
              {m.role === "assistant" ? (
                <div className="prose prose-sm prose-invert max-w-none [&_a]:text-primary [&_a]:underline">
                  <ReactMarkdown
                    components={{
                      a: ({ href, children }) => (
                        <a href={href} target="_blank" rel="noopener noreferrer">
                          {children}
                        </a>
                      ),
                    }}
                  >
                    {m.content}
                  </ReactMarkdown>
                </div>
              ) : (
                m.content
              )}
            </div>
            {m.role === "user" && (
              <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-1">
                <User size={16} className="text-white/60" />
              </div>
            )}
          </div>
        ))}
        {isLoading && messages[messages.length - 1]?.role === "user" && (
          <div className="flex gap-3 max-w-3xl mx-auto">
            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
              <Bot size={16} className="text-primary" />
            </div>
            <div className="rounded-2xl px-4 py-3 bg-white/5">
              <Loader2 size={16} className="animate-spin text-white/40" />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="px-4 pb-6 pt-2">
        <div className="max-w-3xl mx-auto flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
            placeholder={placeholder}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-primary/50 transition-colors"
            disabled={isLoading}
          />
          <button
            onClick={send}
            disabled={isLoading || !input.trim()}
            className="bg-primary hover:bg-primary/90 disabled:opacity-30 rounded-xl px-4 py-3 transition-colors"
          >
            {tab === "instagram" ? <Search size={18} /> : <Send size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestAI;
