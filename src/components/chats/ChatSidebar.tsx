import React, { useEffect, useMemo, useState } from 'react';
import { type Chat, useChat } from '../../contexts/ChatContext';
import { useUser } from '../../contexts/UserContext';
import { Search, MessageCircle, Users as UsersIcon } from 'lucide-react';
import axios from 'axios';

interface ChatSidebarProps {
    chats: Chat[];
    activeChatId: string | null;
    onSelectChat: (chat: Chat) => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ chats, activeChatId, onSelectChat }) => {
    const { user } = useUser();
    const [isCreatingAdminChat, setIsCreatingAdminChat] = useState(false);
    const { initiateChat, createAdminChat } = useChat();
    const [allUsers, setAllUsers] = useState<Array<{ _id: string; username: string; fullName?: string; role?: string }>>([]);
    const [tab, setTab] = useState<'chats' | 'users'>(() => (user?.userType === 'admin' ? 'users' : 'chats'));
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRole, setSelectedRole] = useState<string>('all');

    useEffect(() => {
        const fetchUsers = async () => {
            if (user?.userType !== 'admin') return;
            try {
                let endpoint = '';
                let roleLabel = '';

                switch (selectedRole) {
                    case 'freelancer':
                        endpoint = '/users/getFreelancers';
                        roleLabel = 'freelancer';
                        break;
                    case 'client':
                        endpoint = '/users/getClients';
                        roleLabel = 'client';
                        break;
                    case 'interviewer':
                        endpoint = '/users/getInterviewers';
                        roleLabel = 'interviewer';
                        break;
                    default:
                        endpoint = '/users/all';
                        roleLabel = '';
                }

                const res = await axios.get(`${import.meta.env.VITE_SERVER}${endpoint}`, { withCredentials: true });
                const raw = res.data.data?.users || [];
                const normalized = (Array.isArray(raw) ? raw : []).map((u: any) => ({
                    _id: u._id || u.id || u.userId || '',
                    username: u.username || u.userName || u.email || 'user',
                    fullName: u.fullName || u.name || undefined,
                    role: roleLabel || (u.role || u.userType || '').toLowerCase(),
                })).filter((u: any) => u._id);
                setAllUsers(normalized);
            } catch (e) {
                // silent fail
            }
        };
        fetchUsers();
    }, [user?.userType, selectedRole]);

    const getOrderedChats = () => {
        const visible = user?.userType === 'admin'
            ? chats.filter(c => c.participants.some(p => p._id === (user?.id || '')))
            : chats;

        return [...visible].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    };

    const orderedChats = getOrderedChats();


    const filteredChats = !searchQuery
        ? orderedChats
        : orderedChats.filter(chat => {
            const otherParticipants = chat.participants.filter(p => p._id !== (user?.id || ''));
            const titleRaw =
                chat.type === 'project' && chat.project
                    ? chat.project.title
                    : otherParticipants[0]?.username || "Chat";

            return titleRaw.toLowerCase().includes(searchQuery.toLowerCase());
        });


    const filteredUsers = useMemo(() => {
        let filtered = allUsers.filter(u => u.username?.toLowerCase() !== 'admin');

        if (searchQuery) {
            filtered = filtered.filter(u =>
                (u.username || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (u.fullName || '').toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        return filtered;
    }, [allUsers, searchQuery]);

    return (
        <aside className="w-80 border-r border-gray-200 h-[70vh] sm:h-[80vh] overflow-visible bg-white flex flex-col relative z-20">
            {/* Header */}
            <div className="px-4 py-4 border-b border-gray-100">
                {/* <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
          <button className="w-8 h-8 bg-black rounded-full flex items-center justify-center hover:bg-gray-800 transition-all duration-300">
            <Plus className="w-4 h-4 text-white" />
          </button>
        </div> */}

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search conversations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-black focus:bg-white transition-all duration-300 text-sm"
                    />
                </div>
            </div>

            {/* Tabs */}
            {user?.userType === 'admin' && (
                <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex bg-gray-100 rounded-2xl p-1">
                        <button
                            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-300 ${tab === 'chats' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                                }`}
                            onClick={() => setTab('chats')}
                        >
                            <MessageCircle className="w-3 h-3" />
                            Chats
                        </button>
                        <button
                            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-300 ${tab === 'users' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                                }`}
                            onClick={() => setTab('users')}
                        >
                            <UsersIcon className="w-3 h-3" />
                            Users
                        </button>
                    </div>
                </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                {tab === 'chats' && (
                    <div className="p-2">
                        {/* Chat with Admin Button - Show for non-admin users who don't have an admin chat */}
                        {user?.userType !== 'admin' && !filteredChats.some(chat =>
                            chat.participants.some(p => {
                                const isAdmin = p.username?.toLowerCase() === 'admin' ||
                                    p.role?.toLowerCase() === 'admin' ||
                                    p._id === import.meta.env.VITE_ADMIN_ID;
                                return isAdmin;
                            })
                        ) && (
                                <button
                                    type="button"
                                    onClick={async () => {
                                        if (isCreatingAdminChat) return;
                                        setIsCreatingAdminChat(true);
                                        try {
                                            const adminChat = await createAdminChat();
                                            onSelectChat(adminChat);
                                        } catch (error) {
                                            console.error('Failed to create admin chat:', error);
                                        } finally {
                                            setIsCreatingAdminChat(false);
                                        }
                                    }}
                                    disabled={isCreatingAdminChat}
                                    className={`w-full text-left p-3 rounded-xl mb-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 hover:from-blue-100 hover:to-indigo-100 transition-all duration-300 ${isCreatingAdminChat ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                >
                                    {/* Keep the existing button content */}
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                                            <span className="text-xs font-bold text-white">👤</span>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-medium text-sm text-blue-900 mb-1">
                                                💬 Chat with Admin
                                            </h3>
                                            <p className="text-xs text-blue-700">
                                                Get help and support from our team
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            )}

                        {filteredChats.map((chat) => {
                            const isActive = chat._id === activeChatId;
                            const otherParticipants = chat.participants.filter(p => p._id !== (user?.id || ''));
                            let titleRaw;
                            if (chat.type === 'project' && chat.project) {
                                titleRaw = chat.project.title;
                            } else if (chat.type === 'group') {
                                titleRaw = chat.project?.title || `Group (${chat.participants.length})`;
                            } else {
                                titleRaw = otherParticipants[0]?.username || 'Chat';
                            }
                            const title = titleRaw.toLowerCase() === 'admin' || otherParticipants[0]?.username?.toLowerCase?.() === 'admin' ? 'Admin' : titleRaw;
                            const isAdminChat = title.toLowerCase() === 'admin';
                            const lastMessage = chat.messages[chat.messages.length - 1];
                            const unreadCount =
                                chat._id === activeChatId
                                    ? 0
                                    : chat.messages.filter(m =>
                                        !m.read && m.sender._id !== (user?.id || '')
                                    ).length;


                            const lastSenderName = lastMessage
                                ? (lastMessage.sender._id === (user?.id || '') ? 'You' : (lastMessage.sender.username?.toLowerCase?.() === 'admin' ? 'Admin' : lastMessage.sender.username))
                                : '';

                            // Show participant count for group chats
                            const subtitle = chat.type === 'group'
                                ? `${chat.participants.length} members`
                                : chat.type === 'project'
                                    ? 'Project chat'
                                    : isAdminChat
                                        ? 'Support & Help'
                                        : '';

                            return (
                                <button
                                    key={chat._id}
                                    type="button"
                                    onClick={() => onSelectChat(chat)}
                                    className={`w-full text-left p-3 rounded-xl mb-1 transition-all duration-300 ${isActive
                                        ? (isAdminChat ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' : 'bg-black text-white shadow-md')
                                        : (isAdminChat ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 hover:from-blue-100 hover:to-indigo-100' : 'hover:bg-gray-50')
                                        }`}
                                >
                                    <div className="flex items-start gap-2">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isActive
                                            ? (isAdminChat ? 'bg-white/20' : 'bg-white/20')
                                            : (isAdminChat ? 'bg-blue-600' : 'bg-gray-100')
                                            }`}>
                                            <span className={`text-xs font-bold ${isActive
                                                ? 'text-white'
                                                : (isAdminChat ? 'text-white' : 'text-gray-700')
                                                }`}>
                                                {isAdminChat ? '👤' : title.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <h3 className={`font-medium text-sm truncate ${isActive
                                                    ? 'text-white'
                                                    : (isAdminChat ? 'text-blue-900' : 'text-gray-900')
                                                    }`}>
                                                    {title}
                                                </h3>
                                                {unreadCount > 0 && (
                                                    <span className="inline-flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-blue-600 text-white text-[9px] font-medium">
                                                        {unreadCount}
                                                    </span>
                                                )}
                                            </div>
                                            {subtitle && (
                                                <div className={`text-[10px] mb-1 ${isActive
                                                    ? 'text-white/70'
                                                    : (isAdminChat ? 'text-blue-700' : 'text-gray-500')
                                                    }`}>
                                                    {subtitle}
                                                </div>
                                            )}
                                            {lastMessage && (
                                                <div className={`text-[10px] truncate ${isActive
                                                    ? 'text-white/70'
                                                    : (isAdminChat ? 'text-blue-600' : 'text-gray-500')
                                                    }`}>
                                                    {lastMessage.type === 'system' ? lastMessage.content : `${lastSenderName}: ${lastMessage.content}`}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                        {filteredChats.length === 0 && (
                            <div className="text-center py-12">
                                <MessageCircle className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                                <p className="text-xs text-gray-500">
                                    {searchQuery ? 'No conversations found' : 'No conversations yet'}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {tab === 'users' && (
                    <div className="p-2">
                        <div className="mb-3 px-1">
                            <select
                                value={selectedRole}
                                onChange={(e) => setSelectedRole(e.target.value)}
                                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-all duration-300"
                            >
                                <option value="all">Select an option</option>
                                <option value="freelancer">Freelancers</option>
                                <option value="client">Clients</option>
                                <option value="interviewer">Interviewers</option>
                            </select>
                        </div>
                        {filteredUsers.map((u) => (
                            <button
                                key={u._id}
                                type="button"
                                onClick={async () => {
                                    // find existing chat with this user, else initiate individual
                                    const existing = chats.find(c =>
                                        c.type === 'individual' && c.participants.some(p => p._id === u._id)
                                    );
                                    if (existing) return onSelectChat(existing);
                                    const newChat = await initiateChat('individual', u._id);
                                    onSelectChat(newChat);
                                }}
                                className="w-full text-left p-3 rounded-xl mb-1 hover:bg-gray-50 transition-all duration-300"
                            >
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                        <span className="text-xs font-bold text-gray-700">
                                            {((u.username?.toLowerCase?.() === 'admin') ? 'Admin' : (u.fullName || u.username)).charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-medium text-sm text-gray-900">
                                            {(u.username?.toLowerCase?.() === 'admin') ? 'Admin' : (u.fullName || u.username)}
                                        </h3>
                                        <p className="text-[10px] text-gray-500">
                                            {(u.username?.toLowerCase?.() === 'admin') ? 'Admin' : (u.role || '')}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        ))}
                        {filteredUsers.length === 0 && (
                            <div className="text-center py-12">
                                <UsersIcon className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                                <p className="text-xs text-gray-500">
                                    {searchQuery ? 'No users found' : 'No users available'}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </aside>
    );
};

export default ChatSidebar;