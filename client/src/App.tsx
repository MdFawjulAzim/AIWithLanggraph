import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import "./App.css";

const API_URL =
  (import.meta.env.VITE_API_URL as string) || "http://localhost:3001";
const THREAD_ID = Math.floor(Math.random() * 1_000_000);

type Role = "user" | "assistant";

interface Message {
  id: number;
  role: Role;
  content: string;
}

function SendIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="18"
      height="18"
    >
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function BotIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="16"
      height="16"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      <line x1="12" y1="3" x2="12" y2="7" />
      <circle cx="9" cy="16" r="1" fill="currentColor" />
      <circle cx="15" cy="16" r="1" fill="currentColor" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="16"
      height="16"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function TypingIndicator() {
  return (
    <div className="typing-indicator">
      <span />
      <span />
      <span />
    </div>
  );
}

let msgCounter = 0;

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const autoResize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  };

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMsg: Message = {
      id: ++msgCounter,
      role: "user",
      content: trimmed,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: trimmed, thread_id: THREAD_ID }),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const content = await res.text();
      const assistantMsg: Message = {
        id: ++msgCounter,
        role: "assistant",
        content,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const errorMsg: Message = {
        id: ++msgCounter,
        role: "assistant",
        content:
          err instanceof Error
            ? `Error: ${err.message}`
            : "Something went wrong.",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="header-title">
            <BotIcon />
            <span>AI Chat</span>
          </div>
        </div>
      </header>

      <main className="chat-container">
        <div className="messages">
          {messages.length === 0 && (
            <div className="empty-state">
              <BotIcon />
              <p>How can I help you today?</p>
            </div>
          )}
          {messages.map((msg) => (
            <div key={msg.id} className={`message message--${msg.role}`}>
              <div className="avatar">
                {msg.role === "user" ? <UserIcon /> : <BotIcon />}
              </div>
              <div className="bubble">{msg.content}</div>
            </div>
          ))}
          {loading && (
            <div className="message message--assistant">
              <div className="avatar">
                <BotIcon />
              </div>
              <div className="bubble bubble--loading">
                <TypingIndicator />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </main>

      <footer className="input-bar">
        <div className="input-bar-inner">
          <textarea
            ref={textareaRef}
            className="input-textarea"
            placeholder="Message..."
            rows={1}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              autoResize();
            }}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
          <button
            className="send-btn"
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            aria-label="Send"
          >
            <SendIcon />
          </button>
        </div>
      </footer>
    </div>
  );
}

export default App;
