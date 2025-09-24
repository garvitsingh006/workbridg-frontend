import React, { useState } from 'react';

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

  const placeholder = disabled
    ? status === 'pending'
      ? 'Messaging locked until admin approval'
      : 'Messaging disabled'
    : 'Type a message';

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2 p-3">
      <textarea
        className="flex-1 min-h-[44px] max-h-40 p-2 border rounded-md focus:outline-none focus:ring"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={disabled || sending}
      />
      <button
        type="submit"
        disabled={disabled || sending || !value.trim()}
        className="h-10 px-4 rounded-md bg-blue-600 text-white disabled:opacity-50"
      >
        Send
      </button>
    </form>
  );
};

export default MessageInput;


