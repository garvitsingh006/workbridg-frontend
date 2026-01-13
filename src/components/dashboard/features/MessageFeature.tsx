import ChatLayout from '../../chats/ChatLayout';

interface MessageFeatureProps {
  notificationState?: {
    chatId?: string;
    messageId?: string;
    projectId?: string;
    paymentId?: string;
  };
}

function MessageFeature({ notificationState }: MessageFeatureProps) {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-6xl">
        <ChatLayout notificationState={notificationState} />
      </div>
    </div>
  );
}

export default MessageFeature;