import React, { useEffect, useMemo, useRef } from 'react';
import { type Chat } from '../../contexts/ChatContext';
import { useChat } from '../../contexts/ChatContext';
import { useUser } from '../../contexts/UserContext';
import MessageInput from './MessageInput';
import { ShieldPlus, CheckCircle2, Users, UserPlus, UserMinus } from 'lucide-react';
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
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 border-b bg-white flex items-center justify-between gap-2">
        <div>
          <div className="text-sm font-medium">{title}</div>
          <div className="text-xs text-gray-500">{getChatTypeLabel()}</div>
        </div>
        <div className="flex items-center gap-2">
          {/* Group info button for group/project chats */}
          {(chat.type === 'group' || chat.type === 'project') && (
            <button
              type="button"
              onClick={() => setShowGroupInfo(true)}
              className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded border text-gray-700 border-gray-300 hover:bg-gray-50"
            >
              <Users className="w-3 h-3" /> Info
            </button>
          )}
          {/* Admin actions: approve chat, add admin */}
          {user?.userType === 'admin' && (
            <AdminActions chatId={chat._id} status={chat.status} />
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
        {chat.messages.map((m, idx) => {
          const isMine = m.sender._id === (user?.id || '');
          const isSystemMessage = m.type === 'system';
          
          if (isSystemMessage) {
            return (
              <div key={idx} className="flex justify-center">
                <div className="bg-gray-200 text-gray-600 px-3 py-1 rounded-full text-xs">
                  {m.content}
                </div>
              </div>
            );
          }
          
          return (
            <div key={idx} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] rounded-md px-3 py-2 text-sm ${isMine ? 'bg-blue-600 text-white' : 'bg-white border'}`}>
                <div className="text-[11px] opacity-75 mb-0.5">
                  {isMine ? 'You' : (m.sender.username?.toLowerCase() === 'admin' ? 'Admin' : m.sender.username)}
                </div>
                <div>{m.content}</div>
                <div className="text-[10px] opacity-60 mt-1">{new Date(m.timestamp).toLocaleString()}</div>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      <div className="border-t bg-white">
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
          className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded border text-green-700 border-green-300 hover:bg-green-50"
        >
          <CheckCircle2 className="w-3 h-3" /> Approve
        </button>
      )}
      <button
        type="button"
        onClick={() => addAdminToChat(chatId)}
        className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded border text-blue-700 border-blue-300 hover:bg-blue-50"
      >
        <ShieldPlus className="w-3 h-3" /> Add Admin
      </button>
    </div>
  );
};

export default ChatThread;


