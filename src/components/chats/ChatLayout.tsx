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
        // Switch to Messages feature if host page supports it by dispatching a custom event
        window.dispatchEvent(new CustomEvent('open-messages-feature'));
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
    <div className="w-full h-full flex bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden backdrop-blur-sm">
      <ChatSidebar
        chats={chats}
        activeChatId={activeChat?._id || null}
        onSelectChat={handleSelectChat}
      />

      <div className="flex-1 min-w-0 h-[70vh] sm:h-[80vh] bg-gray-50/50">
        {loading && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <div className="text-sm text-gray-500">Loading conversations...</div>
            </div>
          </div>
        )}
        {!loading && error && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center p-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-600 text-2xl">!</span>
              </div>
              <div className="text-sm text-red-600 font-medium">{error}</div>
            </div>
          </div>
        )}
        {!loading && !error && !activeChat && <ChatEmptyState userRole={user?.userType || 'freelancer'} />}
        {!loading && !error && activeChat && <ChatThread chat={activeChat} />}
      </div>
    </div>
  );
};

export default ChatLayout;