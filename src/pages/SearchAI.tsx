import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Send, Bot, User, Loader2, Search } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type Msg = { role: "user" | "assistant"; content: string };
type Tab = "chat" | "instagram";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;
const IG_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-instagram`;

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

export default function SearchAI() {
  const { conversationId: urlConvId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [tab, setTab] = useState<Tab>("chat");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(urlConvId ?? null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load conversation when URL param changes
  useEffect(() => {
    setConversationId(urlConvId ?? null);
    if (!urlConvId) {
      setMessages([]);
      return;
    }
    (async () => {
      const { data, error } = await supabase
        .from("ai_messages")
        .select("role, content")
        .eq("conversation_id", urlConvId)
        .order("created_at", { ascending: true });
      if (error) {
        toast.error("No se pudo cargar la conversación");
        return;
      }
      setMessages((data ?? []).map((m) => ({ role: m.role as Msg["role"], content: m.content })));
    })();
  }, [urlConvId]);

  const ensureConversation = useCallback(
    async (firstUserText: string): Promise<string | null> => {
      if (conversationId) return conversationId;
      if (!user) return null;
      const title = firstUserText.slice(0, 60);
      const { data, error } = await supabase
        .from("ai_conversations")
        .insert({ user_id: user.id, title })
        .select("id")
        .single();
      if (error || !data) {
        toast.error("No se pudo crear la conversación");
        return null;
      }
      setConversationId(data.id);
      navigate(`/search/${data.id}`, { replace: true });
      window.dispatchEvent(new CustomEvent("ai-conversations-changed"));
      return data.id;
    },
    [conversationId, user, navigate]
  );

  const persistMessage = async (convId: string, role: Msg["role"], content: string) => {
    if (!user) return;
    await supabase.from("ai_messages").insert({
      conversation_id: convId,
      user_id: user.id,
      role,
      content,
    });
    await supabase
      .from("ai_conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", convId);
    window.dispatchEvent(new CustomEvent("ai-conversations-changed"));
  };

  const upsertAssistant = (assistantSoFar: { current: string }) => (chunk: string) => {
    assistantSoFar.current += chunk;
    const content = assistantSoFar.current;
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (last?.role === "assistant") {
        return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content } : m));
      }
      return [...prev, { role: "assistant", content }];
    });
  };

  const sendChat = async () => {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");

    const convId = await ensureConversation(text);
    const userMsg: Msg = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    if (convId) await persistMessage(convId, "user", text);

    const ref = { current: "" };
    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      });
      if (!resp.ok || !resp.body) {
        const err = await resp.json().catch(() => ({ error: "Error desconocido" }));
        throw new Error(err.error || `Error ${resp.status}`);
      }
      await readStream(resp.body, upsertAssistant(ref), () => setIsLoading(false));
      if (convId && ref.current) await persistMessage(convId, "assistant", ref.current);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
      setIsLoading(false);
    }
  };

  const sendInstagram = async () => {
    const raw = input.trim();
    if (!raw || isLoading) return;
    setInput("");

    const cleanUsername = raw.replace(/^@/, "").trim();
    const isUsername = /^[a-zA-Z0-9._]{1,30}$/.test(cleanUsername);
    let prefix = "";
    if (isUsername) {
      const profileUrl = `https://www.instagram.com/${cleanUsername}/`;
      prefix = `🔗 [Ver perfil en Instagram](${profileUrl})\n\n`;
    }

    const userText = isUsername ? `🔍 Analizando @${cleanUsername}...` : `🔍 Buscando: ${raw}`;
    const convId = await ensureConversation(userText);
    const userMsg: Msg = { role: "user", content: userText };
    setMessages((prev) => [...prev, userMsg, { role: "assistant", content: prefix + "⏳ Buscando información..." }]);
    setIsLoading(true);
    if (convId) await persistMessage(convId, "user", userText);

    const ref = { current: prefix };
    try {
      const resp = await fetch(IG_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ username: raw }),
      });
      if (!resp.ok || !resp.body) {
        const err = await resp.json().catch(() => ({ error: "Error desconocido" }));
        throw new Error(err.error || `Error ${resp.status}`);
      }
      await readStream(resp.body, upsertAssistant(ref), () => setIsLoading(false));
      if (convId && ref.current) await persistMessage(convId, "assistant", ref.current);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
      setIsLoading(false);
    }
  };

  const send = tab === "chat" ? sendChat : sendInstagram;
  const placeholder = tab === "chat" ? "Escribe un mensaje..." : "Usuario o búsqueda (ej: nike, moda afiliados)";

  return (
    <div className="flex flex-col h-[calc(100vh-3rem)] bg-background text-foreground">
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

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-miiles-gray-400 gap-3">
            {tab === "chat" ? (
              <>
                <Bot size={48} className="text-miiles-gray-200" />
                <p className="text-sm font-light">Escribe algo para comenzar a hablar con la IA</p>
              </>
            ) : (
              <>
                <Search size={48} className="text-miiles-gray-200" />
                <p className="text-sm text-center max-w-md font-light">
                  Busca un perfil de Instagram o cualquier tema relacionado con afiliados
                </p>
              </>
            )}
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 max-w-3xl mx-auto ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            {m.role === "assistant" && (
              <div className="w-7 h-7 rounded-full bg-miiles-blue-light flex items-center justify-center flex-shrink-0 mt-1">
                <Bot size={16} className="text-miiles-blue" />
              </div>
            )}
            <div
              className={`rounded-lg px-4 py-3 max-w-[80%] text-sm leading-relaxed font-light ${
                m.role === "user" ? "bg-foreground text-background rounded-full" : "shadow-md"
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

      <div className="px-4 pb-6 pt-2">
        <div className="max-w-3xl mx-auto flex items-center gap-2 bg-foreground rounded-xl px-4 py-3 shadow-sm">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
            placeholder={placeholder}
            className="flex-1 bg-transparent text-background text-sm font-light placeholder:text-miiles-gray-600 outline-none"
            disabled={isLoading}
          />
          <button
            onClick={send}
            disabled={isLoading || !input.trim()}
            className="w-8 h-8 rounded-full bg-background text-foreground flex items-center justify-center disabled:opacity-30 hover:bg-miiles-pink-light hover:text-miiles-pink transition-all duration-200"
          >
            {tab === "instagram" ? <Search size={16} /> : <Send size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}
