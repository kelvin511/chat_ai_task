import { Search } from "lucide-react";

export interface User {
  id: number | string;
  name: string;
  avatar: string;
  status: string;
  lastMessage: string;
  time: string;
}

interface SidebarProps {
  users: User[];
  activeUser: User;
  setActiveUser: (user: User) => void;
}

export function Sidebar({ users, activeUser, setActiveUser }: SidebarProps) {
  return (
    <div className="w-80 border-r border-gray-800 flex flex-col bg-gray-900/50 backdrop-blur-xl">
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Messages
          </h1>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white">
            ME
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
          <input
            type="text"
            placeholder="Search chats..."
            className="w-full bg-gray-900 border border-gray-700 text-gray-200 pl-9 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all placeholder:text-gray-600"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {users.map((user) => (
          <div
            key={user.id}
            onClick={() => setActiveUser(user)}
            className={`p-4 flex items-center space-x-3 cursor-pointer hover:bg-gray-800/50 transition-colors ${
              activeUser.id === user.id ? "bg-blue-900/10 border-r-2 border-blue-500" : ""
            }`}
          >
            <div className="relative">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-10 h-10 rounded-full bg-gray-800"
              />
              {user.status === "online" && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-sm truncate text-gray-100">{user.name}</h3>
                <span className="text-xs text-gray-500">{user.time}</span>
              </div>
              <p className="text-xs text-gray-400 truncate">{user.lastMessage}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
