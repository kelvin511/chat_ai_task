import { Send, Mic, Sparkles, Smile } from "lucide-react";

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSendMessage: () => void;
  onAiAssist: () => void;
  isAiLoading?: boolean;
}

export function MessageInput({ value, onChange, onSendMessage, onAiAssist, isAiLoading }: MessageInputProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    onSendMessage();
  };

  return (
    <div className="p-4 border-t border-gray-800 bg-gray-900/50 backdrop-blur-md z-10">
      <form
        onSubmit={handleSubmit}
        className="flex items-center space-x-2 bg-gray-900 border border-gray-700 rounded-full px-2 py-2 shadow-inner focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/20 transition-all"
      >
        <button
          type="button"
          onClick={onAiAssist}
          disabled={isAiLoading}
          className={`p-2 transition-colors rounded-full hover:bg-gray-800 ${isAiLoading ? 'text-blue-400 animate-pulse' : 'text-gray-400 hover:text-purple-400'}`}
          title="AI Assist"
        >
          <Sparkles className="w-5 h-5" />
        </button>
        
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={isAiLoading ? "AI is typing..." : "Type a message..."}
          className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder:text-gray-500 px-2 py-1"
        />

        {value.trim() ? (
          <button
            type="submit"
            className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/20"
          >
            <Send className="w-5 h-5 ml-0.5" />
          </button>
        ) : (
          <button
            type="button"
            className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-gray-800"
          >
            <Mic className="w-5 h-5" />
          </button>
        )}
      </form>
    </div>
  );
}
