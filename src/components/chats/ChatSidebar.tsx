import React, { useEffect, useMemo, useState } from 'react';
import { type Chat, useChat } from '../../contexts/ChatContext';
import { useUser } from '../../contexts/UserContext';
import { Search, Plus, MessageCircle, Users as UsersIcon } from 'lucide-react';
import axios from 'axios';

interface ChatSidebarProps {
  chats: Chat[];
  activeChatId: string | null;
  onSelectChat: (chat: Chat) => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ chats, activeChatId, onSelectChat }) => {
  const { user } = useUser();
  const { initiateChat } = useChat();
  const [allUsers, setAllUsers] = useState<Array<{ _id: string; username: string; fullName?: string; role?: string }>>([]);
  const [tab, setTab] = useState<'chats' | 'users'>(() => (user?.userType === 'admin' ? 'users' : 'chats'));
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      if (user?.userType !== 'admin') return;
      try {
        // Try common admin endpoints
        const tryEndpoints = [
          `${import.meta.env.VITE_SERVER}/users/all`,
          `${import.meta.env.VITE_SERVER}/users`,
        ];
        let payload: any = null;
        for (const ep of tryEndpoints) {
          try {
            const res = await axios.get(ep, { withCredentials: true });
            payload = res.data;
            if (payload) break;
          } catch (e) {
            // try next
          }
        }
        if (!payload) return;
        const raw = payload.data || payload.users || payload || [];
        const normalized = (Array.isArray(raw) ? raw : []).map((u: any) => ({
          _id: u._id || u.id || u.userId || '',
          username: u.username || u.userName || u.email || 'user',
          fullName: u.fullName || u.name || undefined,
          role: u.role || u.userType || undefined,
        })).filter((u: any) => u._id);
        setAllUsers(normalized);
        if ((Array.isArray(raw) && raw.length === 0) || normalized.length === 0) {
          // surface what we received for debugging
          // eslint-disable-next-line no-console
          console.debug('Users fetch returned empty. Payload:', payload);
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Failed to fetch users list for admin:', e);
      }
    };
    fetchUsers();
  }, [user?.userType]);

  const orderedChats = useMemo(() => {
    const visible = user?.userType === 'admin'
      ? chats.filter(c => c.participants.some(p => p._id === (user?.id || '')) && c.messages.length > 0) // only active chats
      : chats;
    return [...visible].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [chats, user?.id, user?.userType]);

  const filteredChats = useMemo(() => {
    if (!searchQuery) return orderedChats;
    return orderedChats.filter(chat => {
      const otherParticipants = chat.participants.filter(p => p._id !== (user?.id || ''));
      const titleRaw = chat.type === 'project' && chat.project ? chat.project.title : (otherParticipants[0]?.username || 'Chat');
      return titleRaw.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [orderedChats, searchQuery, user?.id]);

  const filteredUsers = useMemo(() => {
    if (!searchQuery) return allUsers.filter(u => u.username?.toLowerCase() !== 'admin');
    return allUsers
      .filter(u => u.username?.toLowerCase() !== 'admin')
      .filter(u => 
        (u.username || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
        (u.fullName || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
  }, [allUsers, searchQuery]);

  return (
    <aside className="w-80 border-r border-gray-200 h-[70vh] sm:h-[80vh] overflow-hidden bg-white flex flex-col">
      {/* Header */}
      <div className="px-4 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
          <button className="w-8 h-8 bg-black rounded-full flex items-center justify-center hover:bg-gray-800 transition-all duration-300">
            <Plus className="w-4 h-4 text-white" />
          </button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-black focus:bg-white transition-all duration-300 text-sm"
          />
        </div>
      </div>

      {/* Tabs */}
      {user?.userType === 'admin' && (
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex bg-gray-100 rounded-2xl p-1">
            <button
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-300 ${
                tab === 'chats' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setTab('chats')}
            >
              <MessageCircle className="w-3 h-3" />
              Chats
            </button>
            <button
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-300 ${
                tab === 'users' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setTab('users')}
            >
              <UsersIcon className="w-3 h-3" />
              Users
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {tab === 'chats' && (
          <div className="p-2">
            {filteredChats.map((chat) => {
              const isActive = chat._id === activeChatId;
              const otherParticipants = chat.participants.filter(p => p._id !== (user?.id || ''));
              let titleRaw;
              if (chat.type === 'project' && chat.project) {
                titleRaw = chat.project.title;
              } else if (chat.type === 'group') {
                titleRaw = chat.project?.title || `Group (${chat.participants.length})`;
              } else {
                titleRaw = otherParticipants[0]?.username || 'Chat';
              }
              const title = titleRaw.toLowerCase() === 'admin' || otherParticipants[0]?.username?.toLowerCase?.() === 'admin' ? 'Admin' : titleRaw;
              const lastMessage = chat.messages[chat.messages.length - 1];
              const unreadCount = chat.messages.filter(m => !m.read && m.sender._id !== (user?.id || '')).length;
              const lastSenderName = lastMessage
                ? (lastMessage.sender._id === (user?.id || '') ? 'You' : (lastMessage.sender.username?.toLowerCase?.() === 'admin' ? 'Admin' : lastMessage.sender.username))
                : '';
              
              // Show participant count for group chats
              const subtitle = chat.type === 'group' 
                ? `${chat.participants.length} members`
                : chat.type === 'project' 
                ? 'Project chat'
                : '';
                
              return (
                <button
                  key={chat._id}
                  type="button"
                  onClick={() => onSelectChat(chat)}
                  className={`w-full text-left p-3 rounded-xl mb-1 transition-all duration-300 ${
                    isActive 
                      ? 'bg-black text-white shadow-md' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isActive ? 'bg-white/20' : 'bg-gray-100'
                    }`}>
                      <span className={`text-xs font-bold ${isActive ? 'text-white' : 'text-gray-700'}`}>
                        {title.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={`font-medium text-sm truncate ${isActive ? 'text-white' : 'text-gray-900'}`}>
                          {title}
                        </h3>
                        {unreadCount > 0 && (
                          <span className="inline-flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-blue-600 text-white text-[9px] font-medium">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                      {subtitle && (
                        <div className={`text-[10px] mb-1 ${isActive ? 'text-white/70' : 'text-gray-500'}`}>
                          {subtitle}
                        </div>
                      )}
                      {lastMessage && (
                        <div className={`text-[10px] truncate ${isActive ? 'text-white/70' : 'text-gray-500'}`}>
                          {lastMessage.type === 'system' ? lastMessage.content : `${lastSenderName}: ${lastMessage.content}`}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
            {filteredChats.length === 0 && (
              <div className="text-center py-12">
                <MessageCircle className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                <p className="text-xs text-gray-500">
                  {searchQuery ? 'No conversations found' : 'No conversations yet'}
                </p>
              </div>
            )}
          </div>
        )}
        
        {tab === 'users' && (
          <div className="p-2">
            {filteredUsers.map((u) => (
              <button
                key={u._id}
                type="button"
                onClick={async () => {
                  // find existing chat with this user, else initiate individual
                  const existing = chats.find(c =>
                    c.type === 'individual' && c.participants.some(p => p._id === u._id)
                  );
                  if (existing) return onSelectChat(existing);
                  const newChat = await initiateChat('individual', u._id);
                  onSelectChat(newChat);
                }}
                className="w-full text-left p-3 rounded-xl mb-1 hover:bg-gray-50 transition-all duration-300"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-700">
                      {((u.username?.toLowerCase?.() === 'admin') ? 'Admin' : (u.fullName || u.username)).charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-sm text-gray-900">
                      {(u.username?.toLowerCase?.() === 'admin') ? 'Admin' : (u.fullName || u.username)}
                    </h3>
                    <p className="text-[10px] text-gray-500">
                      {(u.username?.toLowerCase?.() === 'admin') ? 'Admin' : (u.role || '')}
                    </p>
                  </div>
                </div>
              </button>
            ))}
            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <UsersIcon className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                <p className="text-xs text-gray-500">
                  {searchQuery ? 'No users found' : 'No users available'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};

export default ChatSidebar;