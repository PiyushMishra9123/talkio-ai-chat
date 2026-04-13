import { useEffect, useRef, useState } from "react";
import Message from "./Message";
import InputBox from "./InputBox";
import jsPDF from "jspdf";
import { FaVolumeUp, FaTrash } from "react-icons/fa";

/**
 * Props:
 * - chat: the active chat object {id, title, messages}
 * - onUpdateMessages(messages): callback to save messages for this chat
 * - onUpdateTitle(title): callback to update chat title
 */
export default function ChatWindow({ chat, onUpdateMessages, onUpdateTitle }) {
  const [messages, setMessages] = useState(chat?.messages || []);
  const [input, setInput] = useState("");
  const [typingText, setTypingText] = useState("");
  const [loading, setLoading] = useState(false);

  // Voice and UI flags (local to window)
  const [voiceMode, setVoiceMode] = useState(true);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [voicePitch, setVoicePitch] = useState(1);
  const [voiceRate, setVoiceRate] = useState(1);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("theme") === "dark");

  const bottomRef = useRef(null);

  // when active chat changes, load its messages to local state
  useEffect(() => {
    setMessages(chat?.messages || []);
  }, [chat?.id]);

  // persist UI theme
  useEffect(() => {
    document.body.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  // persist voices
  useEffect(() => {
    const load = () => {
      const v = window.speechSynthesis.getVoices();
      setVoices(v);
      if (!selectedVoice && v.length > 0) setSelectedVoice(v[0].voiceURI);
    };
    load();
    window.speechSynthesis.onvoiceschanged = load;
  }, []);

  // keep parent storage in sync whenever messages change
  useEffect(() => {
    onUpdateMessages(messages);
    if (
      chat.title === "New Chat" &&
      messages.some((m) => m.role === "assistant") &&
      messages.findIndex((m) => m.role === "assistant") !== -1
    ) {
      const firstAssistant = messages.find((m) => m.role === "assistant");
      if (firstAssistant && firstAssistant.content) {
        const snippet = firstAssistant.content.replace(/\s+/g, " ").trim().slice(0, 30);
        const newTitle = snippet + (firstAssistant.content.length > 30 ? "..." : "");
        onUpdateTitle(newTitle);
      }
    }
  }, [messages]);

  // auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingText]);

  // TTS
  const speak = (text) => {
    if (!voiceMode || !window.speechSynthesis) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.pitch = voicePitch;
    utter.rate = voiceRate;
    const sel = voices.find((v) => v.voiceURI === selectedVoice);
    if (sel) utter.voice = sel;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  };

  // typewriter streaming effect
  const typeWriter = (text, cb) => {
    let i = 0;
    setTypingText("");
    const interval = setInterval(() => {
      setTypingText((prev) => prev + (text[i] ?? ""));
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        cb && cb();
      }
    }, 18);
  };

  // send message (sends full messages history to backend)
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { role: "user", content: input };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setLoading(true);
    setTypingText("");

    try {
      const res = await fetch("https://talkio-backend-pva5.onrender.com/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updated }),
      });
      const data = await res.json();
      const reply = data.reply || "⚠️ No response.";

      typeWriter(reply, () => {
        setMessages((prev) => {
          const out = [...prev, { role: "assistant", content: reply }];
          return out;
        });
        setTypingText("");
        speak(reply);
      });
    } catch (err) {
      setMessages((prev) => [...prev, { role: "assistant", content: "⚠️ Server error." }]);
    } finally {
      setLoading(false);
    }
  };

  const replayMessage = (text) => speak(text);

  const clearThisChat = () => {
    if (!confirm("Clear messages for this chat?")) return;
    const cleared = [{ role: "assistant", content: "Chat cleared. Say hi!" }];
    setMessages(cleared);
  };

  const exportPDF = () => {
    const pdf = new jsPDF();
    let y = 10;
    messages.forEach((m) => {
      pdf.text(`${m.role === "assistant" ? "🤖 AI" : "👤 You"}: ${m.content}`, 10, y);
      y += 8;
      if (y > 280) {
        pdf.addPage();
        y = 10;
      }
    });
    pdf.save(`${chat.title || "chat"}.pdf`);
  };

  return (
    <div className={`flex flex-col h-screen ${darkMode ? "bg-gray-900 text-white" : "bg-white text-black"}`}>
      {/* top controls */}
      <div className={`flex items-center justify-between p-3 border-b ${darkMode ? "bg-gray-800" : "bg-gray-100"}`}>
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold">{chat.title}</h3>
          <button onClick={clearThisChat} className="p-2 rounded-md hover:bg-gray-200/20">
            <FaTrash />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={voiceMode} onChange={() => setVoiceMode(!voiceMode)} />
            Voice
          </label>

          <select
            value={selectedVoice || ""}
            onChange={(e) => setSelectedVoice(e.target.value)}
            className="p-2 border rounded-lg bg-white text-black dark:bg-gray-800 dark:text-white dark:border-gray-600 outline-none"
          >
            {voices.map((v, i) => (
              <option key={i} value={v.voiceURI} className="bg-white text-black dark:bg-gray-700 dark:text-white">
                {v.name} ({v.lang})
              </option>
            ))}
          </select>

          <button onClick={() => setDarkMode(!darkMode)} className="px-3 py-1 rounded-md bg-orange-500 text-white">
            {darkMode ? "Light" : "Dark"}
          </button>

          <button onClick={exportPDF} className="px-3 py-1 rounded-md bg-blue-500 text-white">
            📄 PDF
          </button>
        </div>
      </div>

      {/* messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {messages.map((m, i) => (
          <div key={i} className="flex items-start gap-3">
            <Message role={m.role} content={m.content} onReplay={() => replayMessage(m.content)} />
          </div>
        ))}

        {typingText && <p className="italic font-semibold text-black">{typingText}▌</p>}

        <div ref={bottomRef}></div>
      </div>

      {/* input */}
      <InputBox input={input} setInput={setInput} onSend={sendMessage} />
    </div>
  );
}
