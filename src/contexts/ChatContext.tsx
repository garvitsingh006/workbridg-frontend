import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import axios from 'axios';

// Types for Chat Context - Updated to match backend
export interface Message {
  sender: {
    _id: string;
    username: string;
  };
  content: string;
  timestamp: Date;
  read: boolean;
}

export interface Chat {
  _id: string;
  type: 'individual' | 'project';
  participants: Array<{
    _id: string;
    username: string;
  }>;
  project?: {
    _id: string;
    title: string;
  };
  messages: Message[];
  status: 'pending' | 'approved' | 'with_admin';
  adminAdded: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Chat methods interface
export interface ChatMethods {
  addMessage: (chatId: string, content: string) => Promise<void>;
  markMessagesRead: (chatId: string) => Promise<void>;
  getUnreadMessages: (chatId: string) => Message[];
  addAdminToChat: (chatId: string) => Promise<void>;
  approveChat: (chatId: string) => Promise<void>;
}

// Static methods interface
export interface ChatStatics {
  initiateChat: (type: 'individual' | 'project', otherUserId?: string, projectId?: string) => Promise<Chat>;
  findChatsByUser: () => Promise<Chat[]>;
}

interface ChatContextType extends ChatMethods, ChatStatics {
  chats: Chat[];
  activeChat: Chat | null;
  loading: boolean;
  error: string | null;
  fetchChats: () => Promise<void>;
  setActiveChat: (chat: Chat | null) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

// Configure axios defaults
const API_BASE_URL = import.meta.env.VITE_SERVER || 'http://localhost:8000/api/v1';
axios.defaults.baseURL = API_BASE_URL;
axios.defaults.withCredentials = true;

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalizeMessage = (msg: any): Message => {
    return {
      sender: {
        _id: msg.sender?._id || msg.senderId || msg.userId || msg.sender || '',
        username: msg.sender?.username || msg.sender?.fullName || msg.senderName || msg.username || 'User',
      },
      content: msg.content || msg.text || msg.message || '',
      timestamp: new Date(msg.timestamp || msg.createdAt || Date.now()),
      read: Boolean(msg.read ?? msg.isRead ?? false),
    };
  };

  const normalizeChat = (chat: any): Chat => {
    return {
      _id: chat._id || chat.id,
      type: chat.type === 'project' || chat.project ? 'project' : 'individual',
      participants: (chat.participants || chat.users || []).map((p: any) => ({
        _id: p._id || p.id,
        username: p.username || p.fullName || p.name || 'User',
      })),
      project: chat.project
        ? {
            _id: chat.project._id || chat.project.id,
            title: chat.project.title || chat.project.name || 'Project',
          }
        : undefined,
      messages: Array.isArray(chat.messages) ? chat.messages.map(normalizeMessage) : [],
      status: (chat.status as any) || 'approved',
      adminAdded: Boolean(chat.adminAdded ?? (chat.status === 'with_admin')),
      createdAt: new Date(chat.createdAt || Date.now()),
      updatedAt: new Date(chat.updatedAt || chat.createdAt || Date.now()),
    } as Chat;
  };

  const fetchChats = async (silent: boolean = false) => {
    try {
      if (!silent) setLoading(true);
      setError(null);
      
      const response = await axios.get('/chats/user');
      const chatsData = response.data?.data || response.data || [];
      const transformedChats = (Array.isArray(chatsData) ? chatsData : []).map(normalizeChat);
      // Only update state if something meaningful changed to avoid UI flicker
      const prev = chats;
      const prevKey = prev.map(c => `${c._id}:${c.updatedAt?.toString?.()}`).join('|');
      const nextKey = transformedChats.map(c => `${c._id}:${c.updatedAt?.toString?.()}`).join('|');
      if (prevKey !== nextKey) {
        setChats(transformedChats);
      }
    } catch (err: any) {
      if (!silent) {
        setError(err.response?.data?.message || 'Failed to fetch chats');
        console.error('Error fetching chats:', err);
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Chat methods
  const addMessage = async (chatId: string, content: string) => {
    try {
      setError(null);
      
      const response = await axios.post(`/chats/${chatId}/message`, {
        content
      });
      
      const updatedChat = response.data?.data || response.data;
      const transformedChat = normalizeChat(updatedChat);
      
      setChats(prev => prev.map(chat => 
        chat._id === chatId ? transformedChat : chat
      ));
      
      // Update active chat if it's the same
      if (activeChat?._id === chatId) {
        setActiveChat(transformedChat);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add message');
      throw err;
    }
  };

  const markMessagesRead = async (chatId: string) => {
    try {
      setError(null);
      
      await axios.patch(`/chats/${chatId}/read`);
      
      // Update local state to mark messages as read
      setChats(prev => prev.map(chat => 
        chat._id === chatId 
          ? {
              ...chat,
              messages: chat.messages.map(msg => ({ ...msg, read: true }))
            }
          : chat
      ));
      
      // Update active chat if it's the same
      if (activeChat?._id === chatId) {
        setActiveChat(prev => prev ? {
          ...prev,
          messages: prev.messages.map(msg => ({ ...msg, read: true }))
        } : null);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to mark messages as read');
      throw err;
    }
  };

  const getUnreadMessages = (chatId: string): Message[] => {
    const chat = chats.find(c => c._id === chatId);
    if (!chat) return [];
    
    // Get current user ID from token or context (you'll need to implement this)
    // For now, we'll filter based on read status
    return chat.messages.filter(msg => !msg.read);
  };

  const addAdminToChat = async (chatId: string) => {
    try {
      setError(null);
      
      const response = await axios.patch(`/chats/${chatId}/add-admin`);
      const updatedChat = response.data?.data || response.data;
      const transformedChat = normalizeChat(updatedChat);
      
      setChats(prev => prev.map(chat => 
        chat._id === chatId ? transformedChat : chat
      ));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add admin to chat');
      throw err;
    }
  };

  const approveChat = async (chatId: string) => {
    try {
      setError(null);
      
      const response = await axios.patch(`/chats/${chatId}/approve`);
      const updatedChat = response.data?.data || response.data;
      const transformedChat = normalizeChat(updatedChat);
      
      setChats(prev => prev.map(chat => 
        chat._id === chatId ? transformedChat : chat
      ));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to approve chat');
      throw err;
    }
  };

  // Static methods
  const initiateChat = async (type: 'individual' | 'project', otherUserId?: string, projectId?: string): Promise<Chat> => {
    try {
      setError(null);
      
      const response = await axios.post('/chats/new', {
        type,
        otherUserId,
        project: projectId
      });
      
      const newChat = response.data?.data || response.data;
      const transformedChat = normalizeChat(newChat);
      
      setChats(prev => [...prev, transformedChat]);
      return transformedChat;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to initiate chat');
      throw err;
    }
  };

  const findChatsByUser = async (): Promise<Chat[]> => {
    try {
      setError(null);
      await fetchChats();
      return chats;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to find user chats');
      return [];
    }
  };

  useEffect(() => {
    fetchChats();
    // Lightweight polling for near real-time updates (silent, no flicker)
    const intervalId = setInterval(() => {
      fetchChats(true).catch(() => {});
    }, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const value: ChatContextType = {
    chats,
    activeChat,
    loading,
    error,
    fetchChats,
    setActiveChat,
    addMessage,
    markMessagesRead,
    getUnreadMessages,
    addAdminToChat,
    approveChat,
    initiateChat,
    findChatsByUser
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};