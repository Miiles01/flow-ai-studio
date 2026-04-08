import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, Search } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
    const raw = input.trim();
    if (!raw || isLoading) return;
    setInput("");

    // Detect if it's a username (with or without @) or a free-text search
    const cleanUsername = raw.replace(/^@/, "").trim();
    const isUsername = /^[a-zA-Z0-9._]{1,30}$/.test(cleanUsername);

    let prefix = "";
    if (isUsername) {
      const profileUrl = `https://www.instagram.com/${cleanUsername}/`;
      prefix = `🔗 [Ver perfil en Instagram](${profileUrl})\n\n`;
    }

    const userMsg: Msg = { role: "user", content: isUsername ? `🔍 Analizando @${cleanUsername}...` : `🔍 Buscando: ${raw}` };
    setMessages((prev) => [
      ...prev,
      userMsg,
      { role: "assistant", content: prefix + "⏳ Buscando información..." },
    ]);
    setIsLoading(true);

    const ref = { current: prefix };
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
  const placeholder = tab === "chat" ? "Escribe un mensaje..." : "Usuario o búsqueda (ej: nike, moda afiliados)";

  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      {/* Tabs */}
      <div className="flex items-center gap-3 px-6 py-4">
        <Bot size={20} className="text-miiles-blue" />
        <span className="text-sm font-normal">Búsqueda IA</span>
        <div className="ml-auto flex gap-1 bg-background shadow-sm rounded-full p-1">
          <button
            onClick={() => setTab("chat")}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-light transition-all duration-200 ${
              tab === "chat" ? "bg-foreground text-background" : "text-miiles-gray-400 hover:text-foreground"
            }`}
          >
            <Bot size={14} /> Chat
          </button>
          <button
            onClick={() => setTab("instagram")}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-light transition-all duration-200 ${
              tab === "instagram" ? "bg-foreground text-background" : "text-miiles-gray-400 hover:text-foreground"
            }`}
          >
            <Search size={14} /> Búsqueda
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-miiles-gray-400 gap-3">
            {tab === "chat" ? (
              <>
                <Bot size={48} className="text-miiles-gray-200" />
                <p className="text-sm font-light">Escribe algo para comenzar a hablar con Gemini</p>
              </>
            ) : (
              <>
                <Search size={48} className="text-miiles-gray-200" />
                <p className="text-sm text-center max-w-md font-light">
                  Busca un perfil de Instagram o cualquier tema relacionado con afiliados
                </p>
                <div className="flex gap-2 mt-3 flex-wrap justify-center">
                  {["nike", "gymshark", "marcas de moda con afiliados"].map((ex) => (
                    <button
                      key={ex}
                      onClick={() => setInput(ex)}
                      className="px-4 py-1.5 rounded-full bg-background shadow-sm text-miiles-gray-400 text-xs font-light hover:-translate-y-1 hover:bg-foreground hover:text-background transition-all duration-200"
                    >
                      {ex.includes(" ") ? ex : `@${ex}`}
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
              <div className="w-7 h-7 rounded-full bg-miiles-blue-light flex items-center justify-center flex-shrink-0 mt-1">
                <Bot size={16} className="text-miiles-blue" />
              </div>
            )}
            <div
              className={`rounded-lg px-4 py-3 max-w-[80%] text-sm leading-relaxed font-light ${
                m.role === "user"
                  ? "bg-foreground text-background rounded-full"
                  : "shadow-md"
              }`}
            >
              {m.role === "assistant" ? (
                <div className="prose prose-sm max-w-none [&_a]:text-miiles-blue [&_a]:underline">
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
              <div className="w-7 h-7 rounded-full bg-miiles-gray-50 shadow-sm flex items-center justify-center flex-shrink-0 mt-1">
                <User size={16} className="text-miiles-gray-400" />
              </div>
            )}
          </div>
        ))}
        {isLoading && messages[messages.length - 1]?.role === "user" && (
          <div className="flex gap-3 max-w-3xl mx-auto">
            <div className="w-7 h-7 rounded-full bg-miiles-blue-light flex items-center justify-center flex-shrink-0 mt-1">
              <Bot size={16} className="text-miiles-blue" />
            </div>
            <div className="rounded-lg px-4 py-3 shadow-md">
              <Loader2 size={16} className="animate-spin text-miiles-gray-400" />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="px-4 pb-4 pt-2">
        <div className="max-w-3xl mx-auto flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
            placeholder={placeholder}
            className="flex-1 bg-muted/50 border-none"
            disabled={isLoading}
          />
          <Button
            onClick={send}
            disabled={isLoading || !input.trim()}
            size="icon"
          >
            {tab === "instagram" ? <Search size={18} /> : <Send size={18} />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TestAI;
