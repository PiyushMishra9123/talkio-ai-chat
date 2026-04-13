import { FaPlus, FaTrash, FaComments } from "react-icons/fa";

export default function Sidebar({ chats, activeChatId, onCreate, onSelect, onDelete }) {
  return (
    <div className="w-[300px] backdrop-blur-lg bg-white/10 border border-white/20 rounded-r-2xl shadow-lg text-white flex flex-col p-4 gap-4">

      {/* New Chat Button */}
      <button
        onClick={onCreate}
        className="flex items-center gap-2 py-3 px-4 bg-green-500 rounded-lg hover:bg-green-600 transition text-white"
      >
        <FaPlus /> New Chat
      </button>

      {/* Chats List */}
      <div className="flex-1 overflow-y-auto">
        {chats.length === 0 && (
          <p className="text-black font-bold text-center">No chats yet</p>
        )}

        <div className="flex flex-col gap-2 mt-2">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={`flex items-center justify-between gap-2 p-3 rounded-lg cursor-pointer transition 
                ${chat.id === activeChatId ? "bg-white/40" : "hover:bg-white/20"}`}
            >
              {/* Chat Select */}
              <div className="flex items-center gap-3 w-full" onClick={() => onSelect(chat.id)}>
                <FaComments className="text-black" />

                <div className="text-left overflow-hidden">
                  
                  {/* 🔥 Chat Title - Black + Bold */}
                  <div className="text-black font-bold truncate">
                    {chat.title}
                  </div>

                  {/* 🔥 Last message preview - Dark Gray */}
                  <div className="text-gray-700 text-xs truncate">
                    {chat.messages?.[chat.messages.length - 1]?.content?.slice(0, 40)}
                    {chat.messages?.[chat.messages.length - 1]?.content?.length > 40 ? "..." : ""}
                  </div>
                </div>
              </div>

              {/* Delete Button */}
              <button
                onClick={() => onDelete(chat.id)}
                className="p-2 rounded-md hover:bg-white/30"
                title="Delete chat"
              >
                <FaTrash className="text-black" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="text-black font-bold">Chats are saved locally (no cloud).</div>
    </div>
  );
}
