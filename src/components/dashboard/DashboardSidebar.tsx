import { Hop as Home, MessageCircle, FolderOpen, User, ChartBar as BarChart3, DollarSign, Bell, LogOut, Settings } from "lucide-react";
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
            className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                activeFeature === item.id
                    ? "bg-black text-white shadow-lg"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            }`}
            style={{
                animationDelay: `${index * 0.1}s`
            }}
        >
            <item.icon className="w-5 h-5" />
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
                    w-72 bg-white/95 backdrop-blur-md border-r border-gray-200 flex flex-col
                    transform lg:transform-none transition-all duration-300 ease-in-out
                    ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
                    ${isVisible ? 'opacity-100' : 'opacity-0'}
                `}
            >
                {/* Sidebar Header */}
                <div className="px-6 py-8 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center transform hover:scale-110 transition-transform duration-300">
                            <span className="text-white font-bold text-lg">W</span>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Workbridg</h1>
                            <p className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-full inline-block">
                                {role}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Navigation Menu */}
                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
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
                <div className="px-4 py-6 border-t border-gray-200">
                    <button 
                        className="w-full flex items-center space-x-3 px-4 py-3 text-left text-red-600 hover:bg-red-50 rounded-2xl transition-all duration-300 transform hover:scale-105 group"
                        onClick={onLogout}
                    >
                        <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </div>
        </>
    );
}