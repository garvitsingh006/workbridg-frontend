import React, { useEffect, useMemo, useRef } from 'react';
import { type Chat } from '../../contexts/ChatContext';
import { useChat } from '../../contexts/ChatContext';
import { useUser } from '../../contexts/UserContext';
import MessageInput from './MessageInput';
import { ShieldPlus, CheckCircle2 } from 'lucide-react';

interface ChatThreadProps {
  chat: Chat;
}

const ChatThread: React.FC<ChatThreadProps> = ({ chat }) => {
  const { addMessage, markMessagesRead } = useChat();
  const { user } = useUser();
  const endRef = useRef<HTMLDivElement | null>(null);

  const title = useMemo(() => {
    const otherParticipants = chat.participants.filter(p => p._id !== (user?.id || ''));
    return chat.type === 'project' && chat.project ? chat.project.title : (otherParticipants[0]?.username || 'Chat');
  }, [chat, user?.id]);

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

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 border-b bg-white flex items-center justify-between gap-2">
        <div>
          <div className="text-sm font-medium">{title}</div>
          <div className="text-xs text-gray-500">{chat.type === 'project' ? 'Project chat' : 'Direct chat'}</div>
        </div>
        {/* Admin actions: approve chat, add admin */}
        {user?.userType === 'admin' && (
          <div className="flex items-center gap-2">
            <AdminActions chatId={chat._id} status={chat.status} />
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
        {chat.messages.map((m, idx) => {
          const isMine = m.sender._id === (user?.id || '');
          return (
            <div key={idx} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] rounded-md px-3 py-2 text-sm ${isMine ? 'bg-blue-600 text-white' : 'bg-white border'}`}>
                <div className="text-[11px] opacity-75 mb-0.5">{isMine ? 'You' : m.sender.username}</div>
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


