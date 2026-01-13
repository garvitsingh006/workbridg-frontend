import { Hop as Home, MessageCircle, FolderOpen, User, Users, DollarSign, Settings, HelpCircle, Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useChat } from "../../contexts/ChatContext";
import { useUser } from "../../contexts/UserContext";
import { useNotifications } from "../../contexts/NotificationContext";
import ProfileMenu from "./ProfileMenu";

interface DashboardSidebarProps {
    activeFeature: string;
    onFeatureSelect: (feature: string) => void;
    isMobileOpen: boolean;
    onCloseMobile: () => void;
}

export default function DashboardSidebar({
    activeFeature,
    onFeatureSelect,
    isMobileOpen,
    onCloseMobile,
}: DashboardSidebarProps) {
    const { user, fetchUser } = useUser();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (!user) fetchUser();
        setIsVisible(true);
    }, [user]);

    const isAdmin = user?.userType === "admin";
    const isFreelancer = user?.userType === "freelancer";
    const isInterviewer = user?.userType === "interviewer";
    const isClient = user?.userType === "client";

    const baseItems = [
        { id: "home", label: "Dashboard", icon: Home },
        { id: "projects", label: isAdmin ? "Project Review" : isFreelancer ? "Projects" : "Projects", icon: FolderOpen },
        { id: "messages", label: "Messages", icon: MessageCircle },
    ];

    const adminExtras = [
        { id: "applications", label: "Applications", icon: FolderOpen },
        { id: "users", label: "User Profiles", icon: User },
        { id: "escrow", label: "Escrow & Payments", icon: DollarSign },
        // { id: "agreements", label: "Agreements", icon: FolderOpen },
        // { id: "disputes", label: "Disputes", icon: Bell },
        { id: "interviews", label: "Interview Management", icon: Settings },
    ];

    const nonAdminExtras = [
        ...(isFreelancer ? [
            { id: "applications", label: "Applications", icon: FolderOpen },
            { id: "earnings", label: "Earnings", icon: DollarSign },
            { id: "freelancer-interviews", label: "Interviews", icon: Settings },
        ] : []),
        ...(isInterviewer ? [
            { id: "assigned-interviews", label: "Assigned Interviews", icon: Settings },
        ] : []),
        ...(isClient ? [
            { id: "browse-freelancers", label: "Browse Freelancers", icon: Users },
            { id: "applications", label: "Applications", icon: FolderOpen },
            { id: "payments", label: "Payments", icon: DollarSign }
        ] : []),
        { id: "profile", label: "Profile", icon: User },
    ];

    let menuItems = isAdmin ? [...baseItems, ...adminExtras] : [...baseItems, ...nonAdminExtras];
    if (isInterviewer) {
        menuItems = [
            { id: "assigned-interviews", label: "Assigned Interviews", icon: Settings },
            { id: "messages", label: "Messages", icon: MessageCircle },
        ];
    }


    const MenuItem = ({ item }: { item: (typeof menuItems)[0]; index: number }) => (
        <div className="relative group">
            <button
                onClick={() => {
                    onFeatureSelect(item.id);
                    onCloseMobile();
                }}
                className={`w-full flex items-center justify-center p-3 text-left rounded-xl transition-all duration-200 relative ${
                    activeFeature === item.id
                        ? "bg-linear-to-br from-[#f72585] to-[#f72585] text-white shadow-lg"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
                title={item.label}
            >
                <item.icon className="w-5 h-5" />
                {item.id === "messages" && <UnreadBadge />}
            </button>
            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-50">
                {item.label}
            </div>
        </div>
    );

    const UnreadBadge = () => {
        try {
            const { chats } = useChatSafe();
            const userId = user?.id || "";
            const count = chats.reduce((acc: number, c: any) => 
                acc + c.messages.filter((m: any) => !m.read && m.sender._id !== userId).length, 0
            );
            if (count <= 0) return null;
            return (
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-medium">
                    {count > 9 ? '9+' : count}
                </span>
            );
        } catch {
            return null;
        }
    };

    function useChatSafe() {
        return useChat();
    }

    const NotificationButton = () => {
        const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
        const [isOpen, setIsOpen] = useState(false);
        const navigate = useNavigate();
        
        const handleNotificationClick = async (notification: any) => {
            if (!notification.isRead) {
                await markAsRead(notification._id);
            }

            const { type, meta } = notification;
            let section = "";
            
            if (type === "message") section = "messages";
            else if (type === "payment") section = "earnings";
            else if (type === "project") section = "projects";
            else if (type === "application") section = "applications";

            const currentPath = window.location.pathname;
            const targetPath = currentPath.includes("/dashboard/client") 
                ? "/dashboard/client" 
                : "/dashboard/freelancer";

            navigate(targetPath, {
                state: {
                    section,
                    chatId: meta.chatId,
                    messageId: meta.messageId,
                    projectId: meta.projectId,
                    paymentId: meta.paymentId,
                    applicationId: meta.applicationId
                }
            });
            
            setIsOpen(false);
        };
        
        return (
            <div className="relative group">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full flex items-center justify-center p-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition-all duration-200 relative"
                    title="Notifications"
                >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-medium">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </button>
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-50">
                    Notifications
                </div>
                {isOpen && (
                    <div className="absolute left-full ml-2 bottom-0 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="font-semibold text-gray-900">Notifications</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-sm text-blue-600 hover:text-blue-800"
                                >
                                    Mark all read
                                </button>
                            )}
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                            {notifications.filter(n => !n.isRead).length === 0 ? (
                                <div className="p-4 text-center text-gray-500">
                                    No unread notifications
                                </div>
                            ) : (
                                notifications.filter(n => !n.isRead).map((notification) => (
                                    <div
                                        key={notification._id}
                                        onClick={() => handleNotificationClick(notification)}
                                        className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                                            !notification.isRead ? "bg-blue-50" : ""
                                        }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`p-2 rounded-full ${
                                                notification.type === "message" ? "bg-blue-100 text-blue-600" :
                                                notification.type === "payment" ? "bg-green-100 text-green-600" :
                                                notification.type === "project" ? "bg-purple-100 text-purple-600" :
                                                "bg-gray-100 text-gray-600"
                                            }`}>
                                                {notification.type === "message" ? <MessageCircle className="w-4 h-4" /> :
                                                 notification.type === "payment" ? <DollarSign className="w-4 h-4" /> :
                                                 notification.type === "project" ? <FolderOpen className="w-4 h-4" /> :
                                                 <Settings className="w-4 h-4" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-900 text-sm">
                                                    {notification.title}
                                                </p>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {notification.preview}
                                                </p>
                                                {!notification.isRead && (
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300"
                    onClick={onCloseMobile}
                />
            )}

            {/* Sidebar */}
            <div
                className={`
                    fixed lg:relative inset-y-0 left-0 z-50 lg:z-0
                    w-16 bg-white border-r border-gray-200 flex flex-col
                    transform lg:transform-none transition-all duration-300 ease-in-out
                    ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
                    ${isVisible ? 'opacity-100' : 'opacity-0'}
                `}
            >
                {/* Sidebar Header - Logo */}
                <div className="h-16 border-b border-gray-200 flex items-center justify-center shrink-0">
                    <div className="w-9 h-9 bg-linear-to-br from-[#f72585] to-[#f72585] rounded-xl flex items-center justify-center cursor-pointer hover:from-[#f72585] hover:to-[#f72585] transition-all shadow-lg">
                        <span className="text-white font-bold text-base">W</span>
                    </div>
                </div>

                {/* Navigation Menu */}
                <nav className="flex-1 p-3 space-y-1">
                    {menuItems.map((item, index) => (
                        <MenuItem key={item.id} item={item} index={index} />
                    ))}
                </nav>

                {/* Bottom Actions */}
                <div className="p-3 border-t border-gray-200 space-y-1">
                    <NotificationButton />
                    <div className="relative group">
                        <button
                            onClick={() => {
                                onFeatureSelect("help");
                                onCloseMobile();
                            }}
                            className="w-full flex items-center justify-center p-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition-all duration-200"
                            title="Help"
                        >
                            <HelpCircle className="w-5 h-5" />
                        </button>
                        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-50">
                            Help
                        </div>
                    </div>
                    <ProfileMenu onAccountSettings={() => onFeatureSelect("account-settings")} />
                </div>
            </div>
        </>
    );
}