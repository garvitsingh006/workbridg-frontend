import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Smile } from 'lucide-react';
import type { ChatChannel, ChatMessage } from '../../types/chat';
import ChatMessageComponent from './ChatMessage';

interface ChatWindowProps {
  channel: ChatChannel;
  messages: ChatMessage[];
  currentUserId: string;
  onSendMessage: (content: string) => void;
}

export default function ChatWindow({ channel, messages, currentUserId, onSendMessage }: ChatWindowProps) {
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageInput.trim()) {
      onSendMessage(messageInput.trim());
      setMessageInput('');
    }
  };

  const getChannelTitle = () => {
    if (channel.type === 'admin') {
      return 'Admin Support';
    }
    return channel.name;
  };

  const getChannelSubtitle = () => {
    if (channel.type === 'admin') {
      return 'Get help from our support team';
    }
    return `Project discussion with client`;
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">{getChannelTitle()}</h2>
        <p className="text-sm text-gray-600">{getChannelSubtitle()}</p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {channel.type === 'admin' ? 'Welcome to Admin Support' : 'Start Your Project Discussion'}
              </h3>
              <p className="text-gray-600 max-w-sm">
                {channel.type === 'admin' 
                  ? 'Ask any questions about the platform or get help with your projects.'
                  : 'Discuss project details, requirements, and progress with your client.'
                }
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessageComponent
                key={message.id}
                message={message}
                isCurrentUser={message.senderId === currentUserId}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <div className="px-6 py-4 border-t border-gray-200">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder={`Message ${channel.type === 'admin' ? 'admin' : 'client'}...`}
              className="w-full px-4 py-2 pr-20 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
              <button
                type="button"
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <button
                type="button"
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Smile className="w-4 h-4" />
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={!messageInput.trim()}
            className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}