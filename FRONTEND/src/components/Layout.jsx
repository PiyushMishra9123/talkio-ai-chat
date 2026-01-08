import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import ChatWindow from "./ChatWindow";

export default function Layout() {
  // load chats from localStorage or create a default chat
  const [chats, setChats] = useState(() => {
    const saved = localStorage.getItem("chats_v1");
    if (saved) return JSON.parse(saved);
    // initial default chat
    return [
      {
        id: Date.now(),
        title: "New Chat",
        messages: [{ role: "assistant", content: "Hello! I'm your AI assistant 😊" }],
      },
    ];
  });

  const [activeChatId, setActiveChatId] = useState(() => {
    return JSON.parse(localStorage.getItem("activeChatId_v1")) || chats[0].id;
  });

  // persist chats and active chat id
  useEffect(() => {
    localStorage.setItem("chats_v1", JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    localStorage.setItem("activeChatId_v1", JSON.stringify(activeChatId));
  }, [activeChatId]);

  // Create new chat
  const createNewChat = () => {
    const newChat = {
      id: Date.now(),
      title: "New Chat",
      messages: [{ role: "assistant", content: "New chat started. Say hi!" }],
    };
    setChats((prev) => [newChat, ...prev]);
    setActiveChatId(newChat.id);
  };

  // Select chat
  const selectChat = (id) => {
    setActiveChatId(id);
  };

  // Delete chat
  const deleteChat = (id) => {
    if (!confirm("Delete this chat?")) return;
    const filtered = chats.filter((c) => c.id !== id);
    setChats(filtered);
    if (filtered.length > 0) setActiveChatId(filtered[0].id);
    else {
      // create a fresh one if no chats left
      const fresh = {
        id: Date.now(),
        title: "New Chat",
        messages: [{ role: "assistant", content: "Hello! I'm your AI assistant 😊" }],
      };
      setChats([fresh]);
      setActiveChatId(fresh.id);
    }
  };

  // Update messages of active chat
  const updateChatMessages = (chatId, messages) => {
    setChats((prev) =>
      prev.map((c) => (c.id === chatId ? { ...c, messages } : c))
    );
  };

  // Update chat title
  const updateChatTitle = (chatId, title) => {
    setChats((prev) =>
      prev.map((c) => (c.id === chatId ? { ...c, title } : c))
    );
  };

  const activeChat = chats.find((c) => c.id === activeChatId) || chats[0];

  return (
    <div className="flex h-screen w-screen">
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        onCreate={createNewChat}
        onSelect={selectChat}
        onDelete={deleteChat}
      />

      <div className="flex-1">
        <ChatWindow
          chat={activeChat}
          onUpdateMessages={(messages) => updateChatMessages(activeChat.id, messages)}
          onUpdateTitle={(title) => updateChatTitle(activeChat.id, title)}
        />
      </div>
    </div>
  );
}
