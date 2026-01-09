import ChatLayout from '../../chats/ChatLayout';

function MessageFeature() {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-6xl">
        <ChatLayout />
      </div>
    </div>
  );
}

export default MessageFeature;