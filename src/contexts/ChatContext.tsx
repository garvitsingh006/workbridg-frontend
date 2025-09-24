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

  const fetchChats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get('/chats/user');
      const chatsData = response.data.data;
      
      // Transform dates from strings to Date objects
      const transformedChats = chatsData.map((chat: any) => ({
        ...chat,
        createdAt: new Date(chat.createdAt),
        updatedAt: new Date(chat.updatedAt),
        messages: chat.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      }));
      
      setChats(transformedChats);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch chats');
      console.error('Error fetching chats:', err);
    } finally {
      setLoading(false);
    }
  };

  // Chat methods
  const addMessage = async (chatId: string, content: string) => {
    try {
      setError(null);
      
      const response = await axios.post(`/chats/${chatId}/message`, {
        content
      });
      
      const updatedChat = response.data.data;
      
      // Transform dates
      const transformedChat = {
        ...updatedChat,
        createdAt: new Date(updatedChat.createdAt),
        updatedAt: new Date(updatedChat.updatedAt),
        messages: updatedChat.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      };
      
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
      const updatedChat = response.data.data;
      
      // Transform dates
      const transformedChat = {
        ...updatedChat,
        createdAt: new Date(updatedChat.createdAt),
        updatedAt: new Date(updatedChat.updatedAt),
        messages: updatedChat.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      };
      
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
      const updatedChat = response.data.data;
      
      // Transform dates
      const transformedChat = {
        ...updatedChat,
        createdAt: new Date(updatedChat.createdAt),
        updatedAt: new Date(updatedChat.updatedAt),
        messages: updatedChat.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      };
      
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
      
      const newChat = response.data.data;
      
      // Transform dates
      const transformedChat = {
        ...newChat,
        createdAt: new Date(newChat.createdAt),
        updatedAt: new Date(newChat.updatedAt),
        messages: newChat.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      };
      
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