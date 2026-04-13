export default function Message({ role, content, onReplay }) {
  const isUser = role === "user";

  return (
    <div
      className={`w-full flex my-3 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      <div className="flex items-start gap-3 max-w-[75%]">

        {/* AI Avatar (Left) */}
        {!isUser && (
          <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white text-xl shadow">
            🤖
          </div>
        )}

        {/* Message Bubble */}
        <div
          className={`p-4 rounded-2xl shadow ${
            isUser
              ? "bg-blue-600 text-white"
              : "bg-white text-black dark:text-white dark:bg-gray-800"
          }`}
        >
          <p className="whitespace-pre-wrap">{content}</p>

          {/* Replay Button for AI only */}
          {!isUser && (
            <button
              onClick={onReplay}
              className="flex items-center gap-1 text-sm text-blue-600 mt-2 hover:underline dark:text-blue-300"
            >
              🔊 Play again
            </button>
          )}
        </div>

        {/* User Avatar (Right) */}
        {isUser && (
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl shadow">
            👤
          </div>
        )}
      </div>
    </div>
  );
}
