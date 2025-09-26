import React, { useState } from 'react';
import { Send, Paperclip, Smile } from 'lucide-react';

interface MessageInputProps {
  onSend: (content: string) => Promise<void> | void;
  disabled?: boolean;
  status?: 'pending' | 'approved' | 'with_admin';
}

const MessageInput: React.FC<MessageInputProps> = ({ onSend, disabled, status }) => {
  const [value, setValue] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim() || disabled || sending) return;
    try {
      setSending(true);
      await onSend(value);
      setValue('');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const placeholder = disabled
    ? status === 'pending'
      ? 'Messaging locked until admin approval'
      : 'Messaging disabled'
    : 'Type a message...';

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit} className="flex items-end gap-3">
        <div className="flex-1 relative">
          <textarea
            className="w-full min-h-[44px] max-h-32 p-4 pr-12 bg-gray-50 border-0 rounded-3xl focus:ring-2 focus:ring-black focus:bg-white transition-all duration-300 resize-none text-sm placeholder-gray-500"
            placeholder={placeholder}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={disabled || sending}
            rows={1}
            style={{
              height: 'auto',
              minHeight: '44px'
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = Math.min(target.scrollHeight, 128) + 'px';
            }}
          />
          <div className="absolute right-3 bottom-3 flex items-center gap-2">
            <button
              type="button"
              className="w-6 h-6 text-gray-400 hover:text-gray-600 transition-colors"
              disabled={disabled}
            >
              <Paperclip className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="w-6 h-6 text-gray-400 hover:text-gray-600 transition-colors"
              disabled={disabled}
            >
              <Smile className="w-4 h-4" />
            </button>
          </div>
        </div>
        <button
          type="submit"
          disabled={disabled || sending || !value.trim()}
          className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-110 disabled:transform-none shadow-lg"
        >
          {sending ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </form>
    </div>
  );
};

export default MessageInput;