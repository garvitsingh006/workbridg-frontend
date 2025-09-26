import { Menu, Bell, Search, User, Settings } from 'lucide-react';
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
    <header className={`bg-white/95 backdrop-blur-md border-b border-gray-200 px-4 lg:px-6 py-4 transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
      <div className="flex items-center justify-between">
        {/* Left side - Mobile menu button and title */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onMobileMenuToggle}
            className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-300 transform hover:scale-110"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
              {getFeatureTitle()}
            </h1>
            <p className="text-sm text-gray-500 hidden sm:block">
              Welcome back, {user?.fullName?.split(' ')[0] || 'User'}
            </p>
          </div>
        </div>

        {/* Right side - Search, notifications, profile */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="hidden md:flex relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all duration-300 w-64 hover:border-gray-300"
            />
          </div>

          {/* Notifications */}
          <div className="relative">
            <button 
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-300 transform hover:scale-110" 
              onClick={() => setOpen(v => !v)}
            >
              <Bell className="w-5 h-5" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[10px] animate-pulse">
                  {notifications.length}
                </span>
              )}
            </button>
            
            {open && (
              <div className="absolute right-0 mt-2 w-80 bg-white/95 backdrop-blur-md border border-gray-200 rounded-2xl shadow-2xl z-10 animate-scaleIn">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                </div>
                <div className="max-h-80 overflow-auto">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                      <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No new notifications</p>
                    </div>
                  ) : (
                    <ul>
                      {notifications.map(n => (
                        <li key={n.id}>
                          <button 
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors duration-300 border-b border-gray-100 last:border-b-0" 
                            onClick={n.onClick}
                          >
                            <div className="font-medium text-sm text-gray-900">{n.title}</div>
                            <div className="text-xs text-gray-500 mt-1">{n.time}</div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-gray-900 to-gray-700 rounded-xl flex items-center justify-center transform hover:scale-110 transition-all duration-300 shadow-lg">
              <span className="text-white font-bold text-sm">
                {user?.fullName?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="hidden md:block">
              <div className="font-medium text-gray-900 text-sm">{user?.fullName || 'User'}</div>
              <div className="text-xs text-gray-500">{user?.userType || 'Member'}</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}