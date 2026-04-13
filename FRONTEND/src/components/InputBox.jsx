import { useState, useRef } from "react";
import { FaMicrophone, FaMicrophoneSlash, FaPaperPlane } from "react-icons/fa";

export default function InputBox({ input, setInput, onSend }) {
  const [recording, setRecording] = useState(false);
  const recognitionRef = useRef(null);

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("⚠️ Speech Recognition is not supported in your browser.");
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = "en-US";

    recognitionRef.current.onstart = () => setRecording(true);

    recognitionRef.current.onresult = (event) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setInput(transcript);
    };

    recognitionRef.current.onend = () => {
      if (recording) recognitionRef.current.start();
    };

    recognitionRef.current.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setRecording(false);
  };

  return (
    <div className="flex items-center gap-3 p-4 border-t bg-gray-100">

      {/* 🎤 Mic Button */}
      <button
        className={`p-3 rounded-full transition ${
          recording 
            ? "bg-red-500 shadow-lg animate-pulse text-white" 
            : "bg-gray-200"
        }`}
        onClick={() => {
          if (!recording) startListening();
          else stopListening();
        }}
      >
        {recording ? <FaMicrophoneSlash size={18} /> : <FaMicrophone size={18} />}
      </button>
<input
  type="text"
  value={input}
  onChange={(e) => setInput(e.target.value)}
  placeholder="Speak or type your message..."
  className="
    flex-1 p-3 border rounded-lg outline-none 
    text-black placeholder-gray-500
    dark:bg-gray-800 dark:text-white dark:placeholder-gray-400
    transition
  "
/>

      {/* Send Button */}
      <button
        className="p-3 bg-green-600 text-white rounded-lg flex items-center gap-1"
        onClick={onSend}
      >
        <FaPaperPlane size={18} /> Send
      </button>

    </div>
  );
}
