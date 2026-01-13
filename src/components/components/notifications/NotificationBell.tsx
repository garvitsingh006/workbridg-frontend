import React, { useState, useRef, useEffect } from "react";
import { Bell, MessageCircle, CreditCard, Briefcase, Settings } from "lucide-react";
import { useNotifications } from "../../../contexts/NotificationContext";
import { useNavigate } from "react-router-dom";

const NotificationBell: React.FC = () => {
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const getIcon = (type: string) => {
        switch (type) {
            case "message": return <MessageCircle className="w-4 h-4" />;
            case "payment": return <CreditCard className="w-4 h-4" />;
            case "project": return <Briefcase className="w-4 h-4" />;
            default: return <Settings className="w-4 h-4" />;
        }
    };

    const handleNotificationClick = async (notification: any) => {
        if (!notification.isRead) {
            await markAsRead(notification._id);
        }

        const { type, meta } = notification;
        let section = "";
        
        if (type === "message") section = "chat";
        else if (type === "payment") section = "payments";
        else if (type === "project") section = "projects";

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
                paymentId: meta.paymentId
            }
        });

        setIsOpen(false);
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return "now";
        if (minutes < 60) return `${minutes}m`;
        if (hours < 24) return `${hours}h`;
        return `${days}d`;
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
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
                        {notifications.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">
                                No notifications
                            </div>
                        ) : (
                            notifications.map((notification) => (
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
                                            {getIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <p className="font-medium text-gray-900 text-sm">
                                                    {notification.title}
                                                </p>
                                                <span className="text-xs text-gray-500 ml-2">
                                                    {formatTime(notification.createdAt)}
                                                </span>
                                            </div>
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

export default NotificationBell;