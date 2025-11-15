import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    type ReactNode,
} from "react";
import api from "../api";

// Types for Chat Context - Updated to match backend
export interface Message {
    sender: {
        _id: string;
        username: string;
    };
    content: string;
    timestamp: Date;
    read: boolean;
    type?: "user" | "system"; // Add message type for system messages
}

export interface Chat {
    _id: string;
    type: "individual" | "project" | "group";
    participants: Array<{
        _id: string;
        username: string;
        role?: string; // Add role to identify admin, client, freelancer
    }>;
    project?: {
        _id: string;
        title: string;
    };
    messages: Message[];
    status: "pending" | "approved" | "with_admin";
    adminAdded: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy?: string; // Track who created the chat
}

// Chat methods interface
export interface ChatMethods {
    addMessage: (chatId: string, content: string) => Promise<void>;
    markMessagesRead: (chatId: string) => Promise<void>;
    getUnreadMessages: (chatId: string) => Message[];
    addAdminToChat: (chatId: string) => Promise<void>;
    approveChat: (chatId: string) => Promise<void>;
    addParticipantToChat: (chatId: string, userId: string) => Promise<void>;
    removeParticipantFromChat: (
        chatId: string,
        userId: string
    ) => Promise<void>;
    getChatParticipants: (chatId: string) => Promise<any[]>;
}

// Static methods interface
export interface ChatStatics {
    initiateChat: (
        type: "individual" | "project" | "group",
        otherUserId?: string,
        projectId?: string,
        participantIds?: string[]
    ) => Promise<Chat>;
    createProjectGroupChat: (
        projectId: string,
        clientId: string,
        freelancerId: string
    ) => Promise<Chat>;
    findChatsByUser: () => Promise<Chat[]>;
    createAdminChat: () => Promise<Chat>;
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
        throw new Error("useChat must be used within a ChatProvider");
    }
    return context;
};

interface ChatProviderProps {
    children: ReactNode;
}

// Using centralized api instance

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
    const [chats, setChats] = useState<Chat[]>([]);
    const [activeChat, setActiveChat] = useState<Chat | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [adminChatEnsured, setAdminChatEnsured] = useState(false);

    const normalizeMessage = (msg: any): Message => {
        return {
            sender: {
                _id:
                    msg.sender?._id ||
                    msg.senderId ||
                    msg.userId ||
                    msg.sender ||
                    "",
                username:
                    msg.sender?.username ||
                    msg.sender?.fullName ||
                    msg.senderName ||
                    msg.username ||
                    "User",
            },
            content: msg.content || msg.text || msg.message || "",
            timestamp: new Date(msg.timestamp || msg.createdAt || Date.now()),
            read: Boolean(msg.read ?? msg.isRead ?? false),
            type: msg.type || "user",
        };
    };

    const normalizeChat = (chat: any): Chat => {
        // Find existing chat to preserve participant data
        const existingChat = chats.find(c => c._id === (chat._id || chat.id));
        
        return {
            _id: chat._id || chat.id,
            type: chat.type || (chat.project ? "project" : "individual"),
            participants: (chat.participants || chat.users || []).map(
                (p: any) => {
                    if (!p) return { _id: "", username: "User" };
                    
                    // If participant is just a string ID, try to find existing participant data
                    if (typeof p === "string") {
                        const existingParticipant = existingChat?.participants.find(ep => ep._id === p);
                        if (existingParticipant) {
                            return existingParticipant;
                        }
                        return { _id: p, username: "User" };
                    }
                    
                    // if it's an ObjectId object with toString:
                    if (
                        p._bsontype === "ObjectID" &&
                        typeof p.toString === "function"
                    ) {
                        const participantId = p.toString();
                        const existingParticipant = existingChat?.participants.find(ep => ep._id === participantId);
                        if (existingParticipant && (!p.username && !p.fullName)) {
                            return existingParticipant;
                        }
                        return { 
                            _id: participantId, 
                            username: p.username || p.fullName || existingParticipant?.username || "User",
                            role: p.role || p.userType || existingParticipant?.role
                        };
                    }
                    
                    // For regular participant objects, preserve existing data if new data is incomplete
                    const participantId = p._id || p.id || (p.toString ? p.toString() : "");
                    const existingParticipant = existingChat?.participants.find(ep => ep._id === participantId);
                    
                    return {
                        _id: participantId,
                        username: p.username || p.fullName || existingParticipant?.username || "User",
                        role: p.role || p.userType || existingParticipant?.role,
                    };
                }
            ),
            project: chat.project
                ? {
                      _id: chat.project._id || chat.project.id,
                      title:
                          chat.project.title || chat.project.name || "Project",
                  }
                : undefined,
            messages: Array.isArray(chat.messages)
                ? chat.messages.map(normalizeMessage)
                : [],
            status: (chat.status as any) || "approved",
            adminAdded: Boolean(
                chat.adminAdded ?? chat.status === "with_admin"
            ),
            createdAt: new Date(chat.createdAt || Date.now()),
            updatedAt: new Date(chat.updatedAt || chat.createdAt || Date.now()),
            createdBy: chat.createdBy,
        } as Chat;
    };

    // Check if admin chat exists in the current chats
    const hasAdminChat = (chats: Chat[]): boolean => {
        return chats.some(chat => 
            chat.participants.some(p => {
                const isAdmin = p.username?.toLowerCase() === 'admin' || 
                             p.role?.toLowerCase() === 'admin' ||
                             p._id === import.meta.env.VITE_ADMIN_ID;
                return isAdmin;
            })
        );
    };

    // Ensure admin chat exists for every user (only run once)
    const ensureAdminChatExists = async (chats: Chat[]): Promise<Chat[]> => {
        try {
            // If we've already ensured admin chat exists, don't run again
            if (adminChatEnsured || hasAdminChat(chats)) {
                setAdminChatEnsured(true);
                return chats;
            }

            // Get admin ID from environment
            const adminId = import.meta.env.VITE_ADMIN_ID;
            if (!adminId) {
                console.warn('VITE_ADMIN_ID not found in environment variables');
                setAdminChatEnsured(true);
                return chats;
            }

            // Create admin chat using the existing endpoint
            console.log('Creating admin chat for user...');
            const response = await api.post("/chats/new", {
                type: "individual",
                otherUserId: adminId
            });

            const newAdminChat = response.data?.data || response.data;
            const transformedAdminChat = normalizeChat(newAdminChat);
            
            setAdminChatEnsured(true);
            return [transformedAdminChat, ...chats];
        } catch (err: any) {
            console.error("Failed to create admin chat:", err);
            setAdminChatEnsured(true); // Mark as ensured even if failed to prevent retries
            return chats; // Return original chats if admin chat creation fails
        }
    };

    const fetchChats = async (silent: boolean = false) => {
        try {
            if (!silent) setLoading(true);
            setError(null);

            const response = await api.get("/chats/user");
            const chatsData = response.data?.data || response.data || [];
            let transformedChats = (
                Array.isArray(chatsData) ? chatsData : []
            ).map(normalizeChat);

            // Ensure admin chat exists for all users (only on first load or if not yet ensured)
            if (!silent && !adminChatEnsured) {
                transformedChats = await ensureAdminChatExists(transformedChats);
            }

            // Only update state if something meaningful changed to avoid UI flicker
            const prev = chats;
            const prevKey = prev
                .map((c) => `${c._id}:${c.updatedAt?.toString?.()}`)
                .join("|");
            const nextKey = transformedChats
                .map((c) => `${c._id}:${c.updatedAt?.toString?.()}`)
                .join("|");
            if (prevKey !== nextKey) {
                setChats(transformedChats);
            }
        } catch (err: any) {
            if (!silent) {
                setError(
                    err.response?.data?.message || "Failed to fetch chats"
                );
                console.error("Error fetching chats:", err);
            }
        } finally {
            if (!silent) setLoading(false);
        }
    };

    // Chat methods
    const addMessage = async (chatId: string, content: string) => {
        try {
            setError(null);

            const response = await api.post(`/chats/${chatId}/message`, {
                content,
            });

            const updatedChat = response.data?.data || response.data;
            const transformedChat = normalizeChat(updatedChat);

            setChats((prev) =>
                prev.map((chat) =>
                    chat._id === chatId ? transformedChat : chat
                )
            );

            // Update active chat if it's the same
            if (activeChat?._id === chatId) {
                setActiveChat(transformedChat);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to add message");
            throw err;
        }
    };

    const markMessagesRead = async (chatId: string) => {
        try {
            setError(null);

            await api.patch(`/chats/${chatId}/read`);

            // Update local state to mark messages as read
            setChats((prev) =>
                prev.map((chat) =>
                    chat._id === chatId
                        ? {
                              ...chat,
                              messages: chat.messages.map((msg) => ({
                                  ...msg,
                                  read: true,
                              })),
                          }
                        : chat
                )
            );

            // Update active chat if it's the same
            if (activeChat?._id === chatId) {
                setActiveChat((prev) =>
                    prev
                        ? {
                              ...prev,
                              messages: prev.messages.map((msg) => ({
                                  ...msg,
                                  read: true,
                              })),
                          }
                        : null
                );
            }
        } catch (err: any) {
            setError(
                err.response?.data?.message || "Failed to mark messages as read"
            );
            throw err;
        }
    };

    const getUnreadMessages = (chatId: string): Message[] => {
        const chat = chats.find((c) => c._id === chatId);
        if (!chat) return [];

        // Get current user ID from token or context (you'll need to implement this)
        // For now, we'll filter based on read status
        return chat.messages.filter((msg) => !msg.read);
    };

    const addAdminToChat = async (chatId: string) => {
        try {
            setError(null);
            const adminId = import.meta.env.VITE_ADMIN_ID
            const response = await api.patch(`/chats/${chatId}/add-admin`, {adminId: adminId});
            const updatedChat = response.data?.data || response.data;
            const transformedChat = normalizeChat(updatedChat);

            setChats((prev) =>
                prev.map((chat) =>
                    chat._id === chatId ? transformedChat : chat
                )
            );

            // Update active chat if it's the same
            if (activeChat?._id === chatId) {
                setActiveChat(transformedChat);
            }
        } catch (err: any) {
            setError(
                err.response?.data?.message || "Failed to add admin to chat"
            );
            throw err;
        }
    };

    const addParticipantToChat = async (chatId: string, userId: string) => {
        try {
            setError(null);

            const response = await api.post(`/chats/${chatId}/participants`, {
                participantIds: [userId],
            });
            const updatedChat = response.data?.data || response.data;
            const transformedChat = normalizeChat(updatedChat);

            setChats((prev) =>
                prev.map((chat) =>
                    chat._id === chatId ? transformedChat : chat
                )
            );

            if (activeChat?._id === chatId) {
                setActiveChat(transformedChat);
            }
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                    "Failed to add participant to chat"
            );
            throw err;
        }
    };

    const removeParticipantFromChat = async (
        chatId: string,
        userId: string
    ) => {
        try {
            setError(null);

            await api.delete(`/chats/${chatId}/participants/${userId}`);

            // Refresh chat data
            await fetchChats();
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                    "Failed to remove participant from chat"
            );
            throw err;
        }
    };

    const getChatParticipants = async (chatId: string): Promise<any[]> => {
        try {
            setError(null);

            const response = await api.get(`/chats/${chatId}/participants`);
            return response.data?.data || response.data || [];
        } catch (err: any) {
            setError(
                err.response?.data?.message || "Failed to get chat participants"
            );
            return [];
        }
    };

    const approveChat = async (chatId: string) => {
        try {
            setError(null);

            const response = await api.patch(`/chats/${chatId}/approve`);
            const updatedChat = response.data?.data || response.data;
            const transformedChat = normalizeChat(updatedChat);

            setChats((prev) =>
                prev.map((chat) =>
                    chat._id === chatId ? transformedChat : chat
                )
            );
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to approve chat");
            throw err;
        }
    };

    // Static methods
    const initiateChat = async (
        type: "individual" | "project" | "group",
        otherUserId?: string,
        projectId?: string,
        participantIds?: string[]
    ): Promise<Chat> => {
        try {
            setError(null);

            if (type === "group") {
                const response = await api.post("/chats/group", {
                    type,
                    otherUserId,
                    project: projectId,
                    participants: participantIds,
                });

                const newChat = response.data?.data || response.data;
                const transformedChat = normalizeChat(newChat);
                setChats((prev) => [...prev, transformedChat]);
                return transformedChat;
            } else {
                const response = await api.post("/chats/new", {
                    type,
                    otherUserId,
                    project: projectId,
                    participants: participantIds,
                });

                const newChat = response.data?.data || response.data;
                const transformedChat = normalizeChat(newChat);
                setChats((prev) => [...prev, transformedChat]);
                return transformedChat;
            }
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to initiate chat");
            throw err;
        }
    };

    const createProjectGroupChat = async (
        projectId: string,
        clientId: string,
        freelancerId: string
    ): Promise<Chat> => {
        try {
            setError(null);

            // Ensure payload matches backend expectations
            const response = await api.post("/chats/group", {
                project: projectId,
                participantIds: [clientId, freelancerId],
            });

            const newChat = response.data?.data || response.data;
            const transformedChat = normalizeChat(newChat);

            setChats((prev) => [...prev, transformedChat]);
            return transformedChat;
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                    "Failed to create project group chat"
            );
            throw err;
        }
    };

    const findChatsByUser = async (): Promise<Chat[]> => {
        try {
            setError(null);
            await fetchChats();
            return chats;
        } catch (err: any) {
            setError(
                err.response?.data?.message || "Failed to find user chats"
            );
            return [];
        }
    };

    const createAdminChat = async (): Promise<Chat> => {
        try {
            setError(null);
            
            // Check if admin chat already exists using the improved detection
            const existingAdminChat = chats.find(chat => 
                chat.participants.some(p => {
                    const isAdmin = p.username?.toLowerCase() === 'admin' || 
                                 p.role?.toLowerCase() === 'admin' ||
                                 p._id === import.meta.env.VITE_ADMIN_ID;
                    return isAdmin;
                })
            );

            if (existingAdminChat) {
                return existingAdminChat;
            }

            // Get admin ID from environment
            const adminId = import.meta.env.VITE_ADMIN_ID;
            if (!adminId) {
                throw new Error('VITE_ADMIN_ID not found in environment variables');
            }

            const response = await api.post("/chats/new", {
                type: "individual",
                otherUserId: adminId
            });

            const newAdminChat = response.data?.data || response.data;
            const transformedAdminChat = normalizeChat(newAdminChat);
            
            setChats(prev => [transformedAdminChat, ...prev]);
            setAdminChatEnsured(true);
            return transformedAdminChat;
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to create admin chat");
            throw err;
        }
    };

    useEffect(() => {
        // Only fetch chats if we have a token
        const token = localStorage.getItem('token');
        if (token) {
            fetchChats().catch(console.error);
            
            // Lightweight polling for near real-time updates (silent, no flicker)
            const intervalId = setInterval(() => {
                const currentToken = localStorage.getItem('token');
                if (currentToken) {
                    fetchChats(true).catch(() => {});
                }
            }, 5000);
            
            return () => clearInterval(intervalId);
        }
        
        // Cleanup function in case component unmounts
        return () => {};
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
        addParticipantToChat,
        removeParticipantFromChat,
        getChatParticipants,
        initiateChat,
        createProjectGroupChat,
        findChatsByUser,
        createAdminChat,
    };

    return (
        <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
    );
};
