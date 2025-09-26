import React, { useEffect, useMemo, useRef } from 'react';
import { type Chat } from '../../contexts/ChatContext';
import { useChat } from '../../contexts/ChatContext';
import { useUser } from '../../contexts/UserContext';
import MessageInput from './MessageInput';
import { ShieldPlus, CheckCircle2, Users, UserPlus, UserMinus, MoreVertical, Phone, Video } from 'lucide-react';
import GroupChatInfo from './GroupChatInfo';

interface ChatThreadProps {
  chat: Chat;
}

const ChatThread: React.FC<ChatThreadProps> = ({ chat }) => {
  const { addMessage, markMessagesRead, addParticipantToChat, getChatParticipants } = useChat();
  const { user } = useUser();
  const endRef = useRef<HTMLDivElement | null>(null);
  const [showGroupInfo, setShowGroupInfo] = React.useState(false);
  const [participants, setParticipants] = React.useState<any[]>([]);

  const title = useMemo(() => {
    const otherParticipants = chat.participants.filter(p => p._id !== (user?.id || ''));
    if (chat.type === 'project' && chat.project) {
      return chat.project.title;
    }
    if (chat.type === 'group') {
      return chat.project?.title || `Group Chat (${chat.participants.length})`;
    }
    return otherParticipants[0]?.username || 'Chat';
  }, [chat, user?.id]);

  useEffect(() => {
    const loadParticipants = async () => {
      if (chat.type === 'group' || chat.type === 'project') {
        try {
          const chatParticipants = await getChatParticipants(chat._id);
          setParticipants(chatParticipants);
        } catch (error) {
          console.error('Failed to load participants:', error);
        }
      }
    };
    loadParticipants();
  }, [chat._id, chat.type]);

  useEffect(() => {
    markMessagesRead(chat._id).catch(() => {});
  }, [chat._id]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat.messages.length]);

  const handleSend = async (content: string) => {
    if (!content.trim()) return;
    await addMessage(chat._id, content.trim());
  };

  const getChatTypeLabel = () => {
    switch (chat.type) {
      case 'project':
        return 'Project chat';
      case 'group':
        return `Group chat • ${chat.participants.length} members`;
      default:
        return 'Direct chat';
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {title.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{title}</h2>
              <p className="text-sm text-gray-500">{getChatTypeLabel()}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Action buttons */}
            <button className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
              <Phone className="w-4 h-4 text-gray-600" />
            </button>
            <button className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
              <Video className="w-4 h-4 text-gray-600" />
            </button>
            
            {/* Group info button for group/project chats */}
            {(chat.type === 'group' || chat.type === 'project') && (
              <button
                type="button"
                onClick={() => setShowGroupInfo(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
              >
                <Users className="w-4 h-4" />
                Info
              </button>
            )}
            
            {/* Admin actions */}
            {user?.userType === 'admin' && (
              <AdminActions chatId={chat._id} status={chat.status} />
            )}
            
            <button className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
              <MoreVertical className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/30">
        {chat.messages.map((m, idx) => {
          const isMine = m.sender._id === (user?.id || '');
          const isSystemMessage = m.type === 'system';
          
          if (isSystemMessage) {
            return (
              <div key={idx} className="flex justify-center">
                <div className="bg-white/80 backdrop-blur-sm text-gray-600 px-4 py-2 rounded-full text-xs font-medium shadow-sm border border-gray-200">
                  {m.content}
                </div>
              </div>
            );
          }
          
          return (
            <div key={idx} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] ${isMine ? 'order-2' : 'order-1'}`}>
                {!isMine && (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-600">
                        {(m.sender.username?.toLowerCase() === 'admin' ? 'Admin' : m.sender.username).charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-xs font-medium text-gray-600">
                      {m.sender.username?.toLowerCase() === 'admin' ? 'Admin' : m.sender.username}
                    </span>
                  </div>
                )}
                <div className={`rounded-3xl px-4 py-3 shadow-sm ${
                  isMine 
                    ? 'bg-black text-white' 
                    : 'bg-white border border-gray-200'
                }`}>
                  <div className="text-sm leading-relaxed">{m.content}</div>
                  <div className={`text-xs mt-2 ${isMine ? 'text-white/60' : 'text-gray-400'}`}>
                    {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-100 bg-white">
        <MessageInput
          onSend={handleSend}
          disabled={
            // Only lock pending project chats for non-admins. Direct chats are always open.
            chat.type === 'project' && chat.status === 'pending' && user?.userType !== 'admin'
          }
          status={chat.status}
        />
      </div>
      
      {/* Group Info Modal */}
      {showGroupInfo && (chat.type === 'group' || chat.type === 'project') && (
        <GroupChatInfo
          chat={chat}
          participants={participants}
          onClose={() => setShowGroupInfo(false)}
          onParticipantAdded={() => {
            // Refresh participants
            getChatParticipants(chat._id).then(setParticipants);
          }}
        />
      )}
    </div>
  );
};

const AdminActions: React.FC<{ chatId: string; status: 'pending' | 'approved' | 'with_admin' }> = ({ chatId, status }) => {
  const { approveChat, addAdminToChat } = useChat();
  return (
    <div className="flex items-center gap-2">
      {status === 'pending' && (
        <button
          type="button"
          onClick={() => approveChat(chatId)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full text-sm font-medium text-green-700 hover:bg-green-200 transition-colors"
        >
          <CheckCircle2 className="w-4 h-4" />
          Approve
        </button>
      )}
      <button
        type="button"
        onClick={() => addAdminToChat(chatId)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full text-sm font-medium text-blue-700 hover:bg-blue-200 transition-colors"
      >
        <ShieldPlus className="w-4 h-4" />
        Add Admin
      </button>
    </div>
  );
};

export default ChatThread;