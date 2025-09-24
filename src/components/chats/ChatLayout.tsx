import React, { useEffect } from 'react';
import { useChat, type Chat } from '../../contexts/ChatContext';
import { useUser } from '../../contexts/UserContext';
import ChatSidebar from './ChatSidebar';
import ChatThread from './ChatThread';
import ChatEmptyState from './ChatEmptyState';

const ChatLayout: React.FC = () => {
  const { chats, activeChat, setActiveChat, fetchChats, loading, error } = useChat();
  const { user } = useUser();

  useEffect(() => {
    fetchChats();
  }, []);

  // Handle deep-link from notifications: #messages:<chatId>
  useEffect(() => {
    const applyHash = () => {
      const hash = window.location.hash || '';
      if (hash.startsWith('#messages:')) {
        const id = hash.replace('#messages:', '');
        const found = chats.find(c => c._id === id);
        if (found) setActiveChat(found);
      }
    };
    applyHash();
    window.addEventListener('hashchange', applyHash);
    return () => window.removeEventListener('hashchange', applyHash);
  }, [chats, setActiveChat]);

  const handleSelectChat = (chat: Chat) => {
    setActiveChat(chat);
  };

  return (
    <div className="w-full h-full flex border rounded-md overflow-hidden">
      <ChatSidebar
        chats={chats}
        activeChatId={activeChat?._id || null}
        onSelectChat={handleSelectChat}
      />

      <div className="flex-1 min-w-0 h-[70vh] sm:h-[80vh]">
        {loading && (
          <div className="h-full flex items-center justify-center text-sm text-gray-500">Loading chats…</div>
        )}
        {!loading && error && (
          <div className="h-full flex items-center justify-center text-sm text-red-600">{error}</div>
        )}
        {!loading && !error && !activeChat && <ChatEmptyState userRole={user?.userType || 'freelancer'} />}
        {!loading && !error && activeChat && <ChatThread chat={activeChat} />}
      </div>
    </div>
  );
};

export default ChatLayout;


