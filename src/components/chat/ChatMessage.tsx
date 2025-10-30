import type { ChatMessage as ChatMessageType } from '../../types/chat';

interface ChatMessageProps {
  message: ChatMessageType;
  isCurrentUser: boolean;
}

export default function ChatMessage({ message, isCurrentUser }: ChatMessageProps) {
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getSenderColor = () => {
    switch (message.senderType) {
      case 'admin':
        return 'text-red-600';
      case 'client':
        return 'text-green-600';
      case 'freelancer':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className={`flex mb-4 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs lg:max-w-md ${isCurrentUser ? 'order-2' : 'order-1'}`}>
        <div
          className={`px-4 py-2 rounded-2xl ${
            isCurrentUser
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-900'
          }`}
        >
          <p className="text-sm leading-relaxed">{message.content}</p>
        </div>
        <div className={`flex items-center mt-1 text-xs text-gray-500 ${
          isCurrentUser ? 'justify-end' : 'justify-start'
        }`}>
          <span className={getSenderColor()}>{message.senderName}</span>
          <span className="mx-1">•</span>
          <span>{formatTime(message.timestamp)}</span>
        </div>
      </div>
    </div>
  );
}