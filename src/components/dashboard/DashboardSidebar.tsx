import {
    Home,
    MessageCircle,
    FolderOpen,
    User,
    Settings,
    BarChart3,
    DollarSign,
    Calendar,
    Bell,
    LogOut,
} from "lucide-react";
import { useEffect } from "react";

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
    const menuItems = [
        { id: "home", label: "Dashboard", icon: Home },
        { id: "projects", label: "My Projects", icon: FolderOpen },
        { id: "messages", label: "Messages", icon: MessageCircle },
        { id: "earnings", label: "Earnings", icon: DollarSign },
        { id: "analytics", label: "Analytics", icon: BarChart3 },
        { id: "calendar", label: "Calendar", icon: Calendar },
        { id: "notifications", label: "Notifications", icon: Bell },
        { id: "profile", label: "Profile", icon: User },
        { id: "settings", label: "Settings", icon: Settings },
    ];

    const navigate = useNavigate()

    // Get User
    const { user, fetchUser, logout } = useUser();
    useEffect(() => {
        if (!user) fetchUser();
    }, [user]);
    const role = user?.userType
        ? user.userType.charAt(0).toUpperCase() + user.userType.slice(1)
        : "";


    const onLogout = async () => {
        logout()
        navigate("/login")

    }



    const MenuItem = ({ item }: { item: (typeof menuItems)[0] }) => (
        <button
            onClick={() => {
                onFeatureSelect(item.id);
                onCloseMobile();
            }}
            className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-all duration-200 ${
                activeFeature === item.id
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            }`}
        >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
        </button>
    );

    return (
        <>
            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
                    onClick={onCloseMobile}
                />
            )}

            {/* Sidebar */}
            <div
                className={`
        fixed lg:relative inset-y-0 left-0 z-50 lg:z-0
        w-64 bg-white border-r border-gray-200 flex flex-col
        transform lg:transform-none transition-transform duration-300 ease-in-out
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
            >
                {/* Sidebar Header */}
                <div className="px-6 py-6 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-lg">
                                W
                            </span>
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-gray-900">
                                Workbridg
                            </h1>
                            <p className="text-sm text-gray-600">{role}</p>
                        </div>
                    </div>
                </div>

                {/* Navigation Menu */}
                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                    {menuItems.map((item) => (
                        <MenuItem key={item.id} item={item} />
                    ))}
                </nav>

                {/* Logout Button */}
                <div className="px-4 py-4 border-t border-gray-200" >
                    <button className="w-full flex items-center space-x-3 px-4 py-3 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors" onClick={() => onLogout()}>
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </div>
        </>
    );
}
