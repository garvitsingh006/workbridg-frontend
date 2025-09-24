import React, { useEffect, useMemo, useState } from 'react';
import { type Chat, useChat } from '../../contexts/ChatContext';
import { useUser } from '../../contexts/UserContext';
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

  return (
    <aside className="w-72 border-r h-[70vh] sm:h-[80vh] overflow-hidden bg-white flex flex-col">
      <div className="px-3 py-2 border-b text-sm font-medium flex items-center gap-2">
        <button
          className={`px-2 py-1 rounded ${tab==='chats' ? 'bg-gray-200' : ''}`}
          onClick={() => setTab('chats')}
        >Chats</button>
        {user?.userType === 'admin' && (
          <button
            className={`px-2 py-1 rounded ${tab==='users' ? 'bg-gray-200' : ''}`}
            onClick={() => setTab('users')}
          >Users</button>
        )}
      </div>
      {tab === 'chats' && (
        <ul className="overflow-y-auto flex-1">
        {orderedChats.map((chat) => {
          const isActive = chat._id === activeChatId;
          const otherParticipants = chat.participants.filter(p => p._id !== (user?.id || ''));
          const titleRaw = chat.type === 'project' && chat.project ? chat.project.title : (otherParticipants[0]?.username || 'Chat');
          const title = titleRaw.toLowerCase() === 'admin' || otherParticipants[0]?.username?.toLowerCase?.() === 'admin' ? 'Admin' : titleRaw;
          const lastMessage = chat.messages[chat.messages.length - 1];
          const unreadCount = chat.messages.filter(m => !m.read && m.sender._id !== (user?.id || '')).length;
          const lastSenderName = lastMessage
            ? (lastMessage.sender._id === (user?.id || '') ? 'You' : (lastMessage.sender.username?.toLowerCase?.() === 'admin' ? 'Admin' : lastMessage.sender.username))
            : '';
          return (
            <li key={chat._id}>
              <button
                type="button"
                onClick={() => onSelectChat(chat)}
                className={`w-full text-left px-3 py-2 hover:bg-gray-50 ${isActive ? 'bg-gray-100' : ''}`}
              >
                <div className="text-sm font-medium truncate flex items-center gap-2">
                  <span className="truncate">{title}</span>
                  {unreadCount > 0 && (
                    <span className="ml-auto inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-blue-600 text-white text-[10px]">{unreadCount}</span>
                  )}
                </div>
                {lastMessage && (
                  <div className="text-xs text-gray-500 truncate">{lastSenderName}: {lastMessage.content}</div>
                )}
              </button>
            </li>
          );
        })}
        {orderedChats.length === 0 && (
          <li className="px-3 py-4 text-xs text-gray-500">No chats yet.</li>
        )}
        </ul>
      )}
      {tab === 'users' && (
        <ul className="overflow-y-auto flex-1">
          {allUsers
            .filter(u => u._id !== (user?.id || ''))
            .map((u) => (
            <li key={u._id}>
              <button
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
                className={`w-full text-left px-3 py-2 hover:bg-gray-50`}
              >
                <div className="text-sm font-medium truncate">{(u.username?.toLowerCase?.() === 'admin') ? 'Admin' : (u.fullName || u.username)}</div>
                <div className="text-xs text-gray-500 truncate">{(u.username?.toLowerCase?.() === 'admin') ? 'Admin' : (u.role || '')}</div>
              </button>
            </li>
          ))}
          {allUsers.length === 0 && (
            <li className="px-3 py-4 text-xs text-gray-500">No users.</li>
          )}
        </ul>
      )}
    </aside>
  );
};

export default ChatSidebar;


