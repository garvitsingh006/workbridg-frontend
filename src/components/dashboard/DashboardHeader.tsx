import { Menu, Bell, Search, User, Settings, Sparkles } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import { useEffect, useMemo, useState } from 'react';
import { useChat } from '../../contexts/ChatContext';

interface DashboardHeaderProps {
  onMobileMenuToggle: () => void;
  activeFeature: string;
}

export default function DashboardHeader({ onMobileMenuToggle, activeFeature }: DashboardHeaderProps) {
  const { user, fetchUser } = useUser();
  const { chats } = useChat();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    fetchUser();
    setIsVisible(true);
  }, []);

  const notifications = useMemo(() => {
    const items: Array<{ id: string; title: string; time: string; onClick?: () => void }> = [];
    chats.forEach(c => {
      const latestUnread = [...c.messages].reverse().find(m => !m.read && m.sender._id !== (user?.id || ''));
      if (latestUnread) {
        const senderName = (latestUnread.sender.username?.toLowerCase?.() === 'admin') ? 'Admin' : latestUnread.sender.username;
        const prefix = c.type === 'project' && c.project ? c.project.title : senderName;
        const snippet = (latestUnread.content || '').slice(0, 15) + ((latestUnread.content || '').length > 15 ? '…' : '');
        items.push({
          id: `${c._id}-${latestUnread.timestamp}`,
          title: `${prefix}: ${snippet}`,
          time: new Date(latestUnread.timestamp).toLocaleTimeString(),
          onClick: () => {
            window.location.hash = `#messages:${c._id}`;
            window.dispatchEvent(new CustomEvent('open-messages-feature'));
            if (!window.location.pathname.includes('/dashboard')) {
              window.location.href = '/dashboard';
            }
          }
        });
      }
    });
    return items;
  }, [chats, user?.id]);

  const getFeatureTitle = () => {
    const titles: { [key: string]: string } = {
      home: 'Dashboard',
      projects: 'My Projects',
      messages: 'Messages',
      earnings: 'Earnings',
      payments: 'Payments',
      analytics: 'Analytics',
      calendar: 'Calendar',
      notifications: 'Notifications',
      profile: 'Profile',
      settings: 'Settings',
    };
    return titles[activeFeature] || 'Dashboard';
  };

  return (
    <header className={`bg-white/95 backdrop-blur-md border-b border-gray-200 px-6 lg:px-8 py-6 transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
      <div className="flex items-center justify-between">
        {/* Left side - Mobile menu button and title */}
        <div className="flex items-center space-x-6">
          <button
            onClick={onMobileMenuToggle}
            className="lg:hidden p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-2xl transition-all duration-300 transform hover:scale-110"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                {getFeatureTitle()}
              </h1>
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Pro
              </div>
            </div>
            <p className="text-sm text-gray-500 hidden sm:block">
              Welcome back, {user?.fullName?.split(' ')[0] || 'User'}! Ready to make progress today?
            </p>
          </div>
        </div>

        {/* Right side - Search, notifications, profile */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="hidden md:flex relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search anything..."
              className="pl-11 pr-4 py-3 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-black focus:bg-white transition-all duration-300 w-72 hover:bg-white text-sm"
            />
          </div>

          {/* Notifications */}
          <div className="relative">
            <button 
              className="relative p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-2xl transition-all duration-300 transform hover:scale-110" 
              onClick={() => setOpen(v => !v)}
            >
              <Bell className="w-5 h-5" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] animate-pulse font-medium">
                  {notifications.length}
                </span>
              )}
            </button>
            
            {open && (
              <div className="absolute right-0 mt-3 w-96 bg-white/95 backdrop-blur-md border border-gray-200 rounded-3xl shadow-2xl z-10 animate-scaleIn overflow-hidden">
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                  <h3 className="font-bold text-gray-900 text-lg">Notifications</h3>
                  <p className="text-sm text-gray-600 mt-1">Stay updated with your latest activity</p>
                </div>
                <div className="max-h-80 overflow-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="font-medium">No new notifications</p>
                      <p className="text-sm mt-1">You're all caught up!</p>
                    </div>
                  ) : (
                    <div className="p-2">
                      {notifications.map(n => (
                        <button 
                          key={n.id}
                          className="w-full text-left p-4 hover:bg-gray-50 transition-colors duration-300 rounded-2xl m-1 border border-transparent hover:border-gray-200" 
                          onClick={n.onClick}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <Bell className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-sm text-gray-900">{n.title}</div>
                              <div className="text-xs text-gray-500 mt-1">{n.time}</div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-gray-900 to-gray-700 rounded-2xl flex items-center justify-center transform hover:scale-110 transition-all duration-300 shadow-lg cursor-pointer">
              <span className="text-white font-bold text-sm">
                {user?.fullName?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="hidden md:block">
              <div className="font-semibold text-gray-900 text-sm">{user?.fullName || 'User'}</div>
              <div className="text-xs text-gray-500 capitalize">{user?.userType || 'Member'}</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}