import React, { useState, useRef, useEffect } from 'react';
import { Send, Smile } from 'lucide-react';

interface MessageInputProps {
  onSend: (content: string) => Promise<void> | void;
  disabled?: boolean;
  status?: 'pending' | 'approved' | 'with_admin' | 'discussion' | 'committed' | 'closed';
}

const MessageInput: React.FC<MessageInputProps> = ({ onSend, disabled, status }) => {
  const [value, setValue] = useState('');
  const [sending, setSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  // Common emojis for the picker
  const emojis = [
    '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
    '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
    '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
    '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
    '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬',
    '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗',
    '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯',
    '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐',
    '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈',
    '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉',
    '👆', '🖕', '👇', '☝️', '👋', '🤚', '🖐️', '✋', '🖖', '👏',
    '🙌', '🤲', '🤝', '🙏', '✍️', '💪', '🦾', '🦿', '🦵', '🦶',
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
    '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️',
    '✨', '🎉', '🎊', '🔥', '💯', '⭐', '🌟', '💫', '⚡', '💥'
  ];

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

  const handleEmojiClick = (emoji: string) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = value.slice(0, start) + emoji + value.slice(end);
      setValue(newValue);

      // Set cursor position after the emoji
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + emoji.length, start + emoji.length);
      }, 0);
    } else {
      setValue(prev => prev + emoji);
    }
    setShowEmojiPicker(false);
  };

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showEmojiPicker]);

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
            ref={textareaRef}
            className="w-full min-h-11 max-h-32 p-4 pr-12 bg-gray-50 border-0 rounded-3xl focus:ring-2 focus:ring-black focus:bg-white transition-all duration-300 resize-none text-sm placeholder-gray-500"
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
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className={`w-6 h-6 transition-colors ${
                showEmojiPicker ? 'text-black' : 'text-gray-400 hover:text-gray-600'
              }`}
              disabled={disabled}
            >
              <Smile className="w-4 h-4" />
            </button>
          </div>

          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div
              ref={emojiPickerRef}
              className="absolute bottom-full right-0 mb-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 z-50"
            >
              <div className="mb-3">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Choose an emoji</h3>
                <div className="grid grid-cols-10 gap-1 max-h-48 overflow-y-auto">
                  {emojis.map((emoji, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleEmojiClick(emoji)}
                      className="w-8 h-8 flex items-center justify-center text-lg hover:bg-gray-100 rounded-lg transition-colors duration-200"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
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