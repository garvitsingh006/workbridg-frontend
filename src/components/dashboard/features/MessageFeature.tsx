import { useState } from 'react';
import { useChat } from '../../../contexts/ChatContext';
import { useUser } from '../../../contexts/UserContext';
import ChatSidebar from '../../chat/ChatSidebar';
import ChatWindow from '../../chat/ChatWindow';
import type { Message } from '../../../contexts/ChatContext';

export default function MessagesFeature() {
  const { chats, activeChat, setActiveChat, addMessage } = useChat();
  const { user } = useUser();
  const [activeChannelId, setActiveChannelId] = useState('admin-chat');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Transform chats to match the old channel interface
  const channels = chats.map(chat => ({
    id: chat.id,
    name: chat.type === 'individual' ? 'Admin Support' : chat.project?.title || 'Project Chat',
    type: chat.type === 'individual' ? 'admin' as const : 'project' as const,
    projectId: chat.project?.id,
    lastMessage: chat.messages.length > 0 ? {
      id: chat.messages[chat.messages.length - 1].id,
      senderId: chat.messages[chat.messages.length - 1].sender.id,
      senderName: chat.messages[chat.messages.length - 1].sender.fullName,
      senderType: chat.messages[chat.messages.length - 1].sender.userType === 'freelancer' ? 'freelancer' as const : 'client' as const,
      content: chat.messages[chat.messages.length - 1].content,
      timestamp: chat.messages[chat.messages.length - 1].timestamp,
      isRead: chat.messages[chat.messages.length - 1].read,
    } : undefined,
    unreadCount: user ? chat.messages.filter(msg => !msg.read && msg.sender.id !== user.id).length : 0,
    participants: chat.participants.map(p => p.id),
  }));

  const currentChat = chats.find(chat => chat.id === activeChannelId);
  const currentMessages = currentChat ? currentChat.messages.map(msg => ({
    id: msg.id,
    senderId: msg.sender.id,
    senderName: msg.sender.fullName,
    senderType: msg.sender.userType === 'freelancer' ? 'freelancer' as const : 
                msg.sender.userType === 'client' ? 'client' as const : 'admin' as const,
    content: msg.content,
    timestamp: msg.timestamp,
    isRead: msg.read,
  })) : [];

  const handleSendMessage = (content: string) => {
    if (!user || !currentChat) return;

    addMessage(activeChannelId, {
      sender: user,
      content,
      timestamp: new Date(),
      read: true,
    });
  };

  const activeChannel = channels.find(channel => channel.id === activeChannelId);
  
  if (!activeChannel || !currentChat) {
    return <div>Channel not found</div>;
  }

  return (
    <div className="flex h-full bg-gray-50 -m-6">
      {/* Chat Sidebar */}
      <ChatSidebar
        channels={channels}
        activeChannelId={activeChannelId}
        onChannelSelect={setActiveChannelId}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Chat Window */}
      <div className="flex-1 flex flex-col min-w-0">
        <ChatWindow
          channel={{
            ...activeChannel,
            name: currentChat.type === 'individual' ? 'Admin Support' : currentChat.project?.title || 'Project Chat'
          }}
          messages={currentMessages}
          currentUserId={user?.id || ''}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
}