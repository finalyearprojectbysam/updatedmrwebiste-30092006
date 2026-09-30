import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Send, ShieldCheck, User, Crown } from "lucide-react";
import { API } from "@/lib/mjApi";
import { mascotFor } from "@/lib/mascots";
import { CertificateVerificationCard } from "./CertificateVerificationCard";

type Msg = {
  id: string;
  role: "user" | "assistant";
  text: string;
  mascot?: string;
  certificate?: Record<string, string> | null;
  certStatus?: "verified" | "revoked" | "not_found";
};

const SUGGESTIONS = [
  "Verify your certificate here",
  "Want to know more about Marca Rise?",
  "Do you know who the CEO of Marca Rise is?",
  "Talk with MJ",
  "Have a certificate? I can verify it.",
];

const QUICK_ACTIONS = [
  { icon: ShieldCheck, label: "Verify Certificate", prompt: "I want to verify a certificate" },
  { icon: Sparkles, label: "About Marca Rise", prompt: "Tell me about Marca Rise" },
  { icon: Crown, label: "Meet the CEO", prompt: "Who is the CEO of Marca Rise?" },
  { icon: User, label: "Talk with MJ", prompt: "Hi MJ! What can you help me with?" },
];

const uid = () => Math.random().toString(36).slice(2);

export default function MarcaAIChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mascot, setMascot] = useState("hello");
  const [bubbleIdx, setBubbleIdx] = useState(0);
  const [showBubble, setShowBubble] = useState(false);
  const [lastCert, setLastCert] = useState<Record<string, string> | null>(null);

  const sessionId = useRef(uid());
  const scrollRef = useRef<HTMLDivElement>(null);

  // rotating suggestion bubbles (paused while chat open)
  useEffect(() => {
    if (open) {
      setShowBubble(false);
      return;
    }
    let mounted = true;
    const cycle = () => {
      if (!mounted) return;
      setShowBubble(true);
      setTimeout(() => mounted && setShowBubble(false), 4200);
    };
    const first = setTimeout(cycle, 2500);
    const interval = setInterval(() => {
      setBubbleIdx((i) => (i + 1) % SUGGESTIONS.length);
      cycle();
    }, 7000);
    return () => {
      mounted = false;
      clearTimeout(first);
      clearInterval(interval);
    };
  }, [open]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const send = useCallback(
    async (raw: string) => {
      const text = raw.trim();
      if (!text || loading) return;
      const userMsg: Msg = { id: uid(), role: "user", text };
      setMessages((m) => [...m, userMsg]);
      setInput("");
      setLoading(true);
      setMascot("working");

      const history = messages.slice(-6).map((m) => ({ role: m.role, content: m.text }));

      try {
        const res = await fetch(`${API}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text,
            session_id: sessionId.current,
            context_certificate: lastCert,
            history,
          }),
        });
        if (!res.ok) throw new Error("bad");
        const data = await res.json();
        const asst: Msg = {
          id: uid(),
          role: "assistant",
          text: data.reply || "",
          mascot: data.mascot,
          certificate: data.certificate,
          certStatus: data.status,
        };
        setMessages((m) => [...m, asst]);
        setMascot(data.mascot || "explaining");
        if (data.type === "certificate" && data.status === "verified" && data.certificate) {
          setLastCert(data.certificate);
        }
      } catch {
        setMessages((m) => [
          ...m,
          {
            id: uid(),
            role: "assistant",
            text: "Sorry, I couldn't reach the Marca Rise assistant just now. Please try again in a moment.",
            mascot: "error",
          },
        ]);
        setMascot("error");
      } finally {
        setLoading(false);
      }
    },
    [loading, messages, lastCert]
  );

  const openChat = () => {
    setOpen(true);
    if (messages.length === 0) {
      setMessages([
        {
          id: uid(),
          role: "assistant",
          mascot: "hello",
          text:
            "Hi, I'm MJ — the Marca Rise AI Assistant. ✦ Ask me about Marca Rise, or send a Certificate ID (like MR26-FS-00128) and I'll verify it for you.",
        },
      ]);
      setMascot("hello");
    }
  };

  return (
    <>
      {/* ================= FLOATING ICON ================= */}
      <div
        className="fixed z-[99998] bottom-4 left-4 sm:bottom-6 sm:left-6 flex flex-col items-start gap-3"
        style={{ pointerEvents: open ? "none" : "auto" }}
      >
        {/* suggestion bubble */}
        <AnimatePresence>
          {showBubble && !open && (
            <motion.button
              key={bubbleIdx}
              initial={{ opacity: 0, y: 10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.35 }}
              onClick={openChat}
              data-testid="mj-suggestion-bubble"
              className="relative ml-1 max-w-[240px] text-left rounded-2xl bg-white border border-purple-200 px-4 py-2.5 text-[13px] font-semibold text-slate-700 shadow-[0_10px_30px_rgba(124,12,231,0.18)]"
              style={{ boxShadow: "0 0 0 1px rgba(168,85,247,0.15),0 10px 30px rgba(124,12,231,0.18)" }}
            >
              {SUGGESTIONS[bubbleIdx]}
              <span className="absolute -bottom-1.5 left-6 w-3 h-3 rotate-45 bg-white border-b border-r border-purple-200" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* orb */}
        <AnimatePresence>
          {!open && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={openChat}
              aria-label="Open MJ, the Marca Rise AI assistant"
              data-testid="mj-launcher"
              className="relative w-16 h-16 rounded-full flex items-center justify-center"
              style={{ pointerEvents: "auto" }}
            >
              {/* pulsing glow */}
              <motion.span
                className="absolute inset-0 rounded-full"
                style={{ background: "radial-gradient(circle,#A855F7,transparent 70%)" }}
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              />
              {/* rotating ring */}
              <motion.span
                className="absolute inset-[-3px] rounded-full"
                style={{
                  background: "conic-gradient(from 0deg,#A855F7,#6D28D9,#4C1D95,#A855F7)",
                  padding: 2,
                  WebkitMask: "radial-gradient(farthest-side,transparent calc(100% - 3px),#000 0)",
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              />
              {/* core */}
              <motion.span
                className="relative w-16 h-16 rounded-full flex items-center justify-center text-white shadow-[0_10px_30px_rgba(76,29,149,0.5)]"
                style={{ background: "linear-gradient(135deg,#6D28D9,#4C1D95)" }}
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <Sparkles size={26} className="drop-shadow" />
                <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-green-400 border-2 border-white" />
              </motion.span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* ================= PANEL ================= */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            data-testid="mj-panel"
            className="fixed z-[99999] bottom-4 left-4 sm:bottom-6 sm:left-6 flex flex-col overflow-hidden rounded-[24px] border border-purple-200/60 bg-white/80 backdrop-blur-2xl shadow-[0_30px_80px_rgba(76,29,149,0.35)]"
            style={{
              width: "min(calc(100vw - 32px), 410px)",
              height: "min(80vh, 660px)",
            }}
          >
            {/* header */}
            <div
              className="relative flex items-center gap-3 px-4 py-3 text-white"
              style={{ background: "linear-gradient(135deg,#4C1D95,#6D28D9)" }}
            >
              <div className="relative">
                <img
                  src={mascotFor(mascot)}
                  alt="MJ"
                  className="w-11 h-11 rounded-full object-cover bg-white/10 border border-white/20"
                />
                <motion.span
                  className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-green-400 border-2 border-[#4C1D95]"
                  animate={{ scale: [1, 1.25, 1] }}
                  transition={{ duration: 1.8, repeat: Infinity }}
                />
              </div>
              <div className="flex-1 leading-tight">
                <div className="flex items-center gap-1.5 font-black tracking-wide">
                  <Sparkles size={14} className="text-purple-200" /> MJ
                </div>
                <div className="text-[11px] text-purple-100/80">
                  Marca Rise AI Assistant
                </div>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-purple-100/90 mr-1">
                <span className="w-2 h-2 rounded-full bg-green-400" /> Online
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                data-testid="mj-close"
                className="w-8 h-8 rounded-full hover:bg-white/15 flex items-center justify-center transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* messages */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-3 py-4 space-y-3"
              style={{
                background:
                  "linear-gradient(180deg,#faf8ff 0%,#f3eeff 100%)",
              }}
            >
              {messages.map((m) => (
                <MessageRow key={m.id} m={m} />
              ))}

              {/* quick actions on first open */}
              {messages.length <= 1 && !loading && (
                <div className="grid grid-cols-2 gap-2 pt-1" data-testid="mj-quick-actions">
                  {QUICK_ACTIONS.map((qa) => (
                    <button
                      key={qa.label}
                      onClick={() => send(qa.prompt)}
                      className="flex items-center gap-2 rounded-xl border border-purple-200 bg-white/80 px-3 py-2.5 text-[12px] font-semibold text-purple-800 hover:bg-purple-600 hover:text-white hover:border-purple-600 transition-all"
                    >
                      <qa.icon size={15} />
                      {qa.label}
                    </button>
                  ))}
                </div>
              )}

              {loading && (
                <div className="flex items-end gap-2">
                  <img
                    src={mascotFor("working")}
                    alt=""
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="rounded-2xl rounded-bl-sm bg-white border border-purple-100 px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-1.5">
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-purple-500"
                          animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
                          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex items-center gap-2 border-t border-purple-100 bg-white/90 px-3 py-3"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask MJ or paste a Certificate ID…"
                data-testid="mj-input"
                aria-label="Message MJ"
                className="flex-1 rounded-full border border-purple-200 bg-purple-50/40 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-purple-500 focus:bg-white transition"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                data-testid="mj-send"
                aria-label="Send message"
                className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-white disabled:opacity-40 transition-all hover:scale-105"
                style={{ background: "linear-gradient(135deg,#6D28D9,#4C1D95)" }}
              >
                <Send size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function MessageRow({ m }: { m: Msg }) {
  const isUser = m.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex items-end gap-2 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && (
        <img
          src={mascotFor(m.mascot)}
          alt="MJ"
          className="w-8 h-8 rounded-full object-cover shrink-0 bg-white border border-purple-100"
        />
      )}
      <div className={`max-w-[80%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-2`}>
        {m.text && (
          <div
            className={
              isUser
                ? "rounded-2xl rounded-br-sm px-4 py-2.5 text-sm text-white shadow-sm"
                : "rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm text-slate-800 bg-white border border-purple-100 shadow-sm"
            }
            style={
              isUser
                ? { background: "linear-gradient(135deg,#6D28D9,#4C1D95)" }
                : undefined
            }
          >
            {m.text}
          </div>
        )}
        {m.certificate !== undefined && m.certStatus && (
          <CertificateVerificationCard
            status={m.certStatus}
            certificate={m.certificate ?? null}
          />
        )}
      </div>
    </motion.div>
  );
}
