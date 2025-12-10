import { Phone, Video, MoreVertical } from "lucide-react";

interface User {
  id: number;
  name: string;
  avatar: string;
  status: string;
  lastMessage: string;
  time: string;
}

interface ChatHeaderProps {
  activeUser: User;
}

export function ChatHeader({ activeUser }: ChatHeaderProps) {
  return (
    <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-gray-900/50 backdrop-blur-md z-10">
      <div className="flex items-center space-x-3">
        <div className="relative">
          <img
            src={activeUser.avatar}
            alt={activeUser.name}
            className="w-10 h-10 rounded-full bg-gray-800"
          />
          {activeUser.status === "online" && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
          )}
        </div>
        <div>
          <h2 className="font-semibold text-gray-100">{activeUser.name}</h2>
          <p className="text-xs text-green-400 flex items-center">
            {activeUser.status === "online" ? "Online" : "Offline"}
          </p>
        </div>
      </div>
    </div>
  );
}
