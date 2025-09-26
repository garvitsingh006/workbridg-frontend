import React from 'react';
import { MessageCircle, Sparkles } from 'lucide-react';

const roleHint: Record<string, string> = {
  freelancer: 'You can chat with admin. Project chats open after approval.',
  client: 'You can chat with admin. Freelancer chat opens after approval.',
  admin: 'Select or create a chat with clients or freelancers.',
};

const ChatEmptyState: React.FC<{ userRole: string }> = ({ userRole }) => {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-gradient-to-br from-gray-50 to-white">
      <div className="relative mb-8">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl">
          <MessageCircle className="w-12 h-12 text-white" />
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
      </div>
      
      <h3 className="text-2xl font-bold text-gray-900 mb-3">
        No conversation selected
      </h3>
      
      <p className="text-gray-600 max-w-sm leading-relaxed mb-8">
        {roleHint[userRole] || 'Select a chat from the left to get started.'}
      </p>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <button className="px-6 py-3 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-all duration-300 transform hover:scale-105">
          Start New Chat
        </button>
        <button className="px-6 py-3 border border-gray-200 text-gray-700 rounded-full font-medium hover:bg-gray-50 transition-all duration-300">
          Browse Contacts
        </button>
      </div>
    </div>
  );
};

export default ChatEmptyState;