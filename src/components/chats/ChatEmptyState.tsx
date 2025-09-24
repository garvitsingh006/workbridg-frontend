import React from 'react';

const roleHint: Record<string, string> = {
  freelancer: 'You can chat with admin. Project chats open after approval.',
  client: 'You can chat with admin. Freelancer chat opens after approval.',
  admin: 'Select or create a chat with clients or freelancers.',
};

const ChatEmptyState: React.FC<{ userRole: string }> = ({ userRole }) => {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center gap-2">
      <div className="text-lg font-medium">No conversation selected</div>
      <div className="text-sm text-gray-500 max-w-sm">
        {roleHint[userRole] || 'Select a chat from the left to get started.'}
      </div>
    </div>
  );
};

export default ChatEmptyState;


