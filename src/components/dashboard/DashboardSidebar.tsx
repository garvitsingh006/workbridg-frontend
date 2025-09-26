import { Hop as Home, MessageCircle, FolderOpen, User, ChartBar as BarChart3, DollarSign, Bell, LogOut, Settings, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useChat } from "../../contexts/ChatContext";
import { useUser } from "../../contexts/UserContext";
import { useNavigate } from "react-router-dom";

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
    const { user, fetchUser, logout } = useUser();
    const navigate = useNavigate();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (!user) fetchUser();
        setIsVisible(true);
    }, [user]);

    const isAdmin = user?.userType === "admin";
    const isFreelancer = user?.userType === "freelancer";
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
        { id: "agreements", label: "Agreements", icon: FolderOpen },
        { id: "disputes", label: "Disputes", icon: Bell },
    ];

    const nonAdminExtras = [
        ...(isFreelancer ? [{ id: "earnings", label: "Earnings", icon: DollarSign }] : []),
        ...(isClient ? [{ id: "payments", label: "Payments", icon: DollarSign }] : []),
        { id: "analytics", label: "Analytics", icon: BarChart3 },
        { id: "profile", label: "Profile", icon: User },
    ];

    const menuItems = isAdmin ? [...baseItems, ...adminExtras] : [...baseItems, ...nonAdminExtras];

    const role = user?.userType
        ? user.userType.charAt(0).toUpperCase() + user.userType.slice(1)
        : "";

    const onLogout = async () => {
        logout();
        navigate("/login");
    };

    const MenuItem = ({ item, index }: { item: (typeof menuItems)[0]; index: number }) => (
        <button
            onClick={() => {
                onFeatureSelect(item.id);
                onCloseMobile();
            }}
            className={`w-full flex items-center space-x-4 px-6 py-4 text-left rounded-3xl transition-all duration-300 transform hover:scale-105 group ${
                activeFeature === item.id
                    ? "bg-black text-white shadow-2xl"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
            }`}
            style={{
                animationDelay: `${index * 0.1}s`
            }}
        >
            <div className={`p-2 rounded-2xl transition-all duration-300 ${
                activeFeature === item.id 
                    ? "bg-white/20" 
                    : "bg-gray-100 group-hover:bg-gray-200"
            }`}>
                <item.icon className="w-5 h-5" />
            </div>
            <span className="font-medium relative">
                {item.label}
                {item.id === "messages" && <UnreadBadge />}
            </span>
        </button>
    );

    const UnreadBadge = () => {
        try {
            const { chats } = useChatSafe();
            const count = chats.reduce((acc: number, c: any) => 
                acc + c.messages.filter((m: any) => !m.read && m.sender._id !== (user?.id || "")).length, 0
            );
            if (count <= 0) return null;
            return (
                <span className="absolute -top-2 -right-4 inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] animate-pulse">
                    {count}
                </span>
            );
        } catch {
            return null;
        }
    };

    function useChatSafe() {
        return useChat();
    }

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
                    w-80 bg-white/95 backdrop-blur-md border-r border-gray-200 flex flex-col
                    transform lg:transform-none transition-all duration-300 ease-in-out
                    ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
                    ${isVisible ? 'opacity-100' : 'opacity-0'}
                    shadow-2xl lg:shadow-none
                `}
            >
                {/* Sidebar Header */}
                <div className="px-8 py-8 border-b border-gray-200">
                    <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-black to-gray-800 rounded-3xl flex items-center justify-center transform hover:scale-110 transition-transform duration-300 shadow-lg">
                            <span className="text-white font-bold text-xl">W</span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Workbridg</h1>
                            <div className="flex items-center gap-2">
                                <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                                    <Sparkles className="w-3 h-3" />
                                    {role}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation Menu */}
                <nav className="flex-1 px-6 py-8 space-y-3 overflow-y-auto">
                    {menuItems.map((item, index) => (
                        <div
                            key={item.id}
                            className={`animate-fadeInUp ${isVisible ? 'opacity-100' : 'opacity-0'}`}
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <MenuItem item={item} index={index} />
                        </div>
                    ))}
                </nav>

                {/* Logout Button */}
                <div className="px-6 py-8 border-t border-gray-200">
                    <button 
                        className="w-full flex items-center space-x-4 px-6 py-4 text-left text-red-600 hover:bg-red-50 rounded-3xl transition-all duration-300 transform hover:scale-105 group"
                        onClick={onLogout}
                    >
                        <div className="p-2 bg-red-100 rounded-2xl group-hover:bg-red-200 transition-colors duration-300">
                            <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                        </div>
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </div>
        </>
    );
}