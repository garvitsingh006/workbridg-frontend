import { Menu, Bell, Search } from 'lucide-react';
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
    <header className={`bg-white border-b border-gray-200 px-6 lg:px-8 py-4 transition-all duration-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
      <div className="flex items-center justify-between">
        {/* Left side - Mobile menu button and title */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onMobileMenuToggle}
            className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {getFeatureTitle()}
            </h1>
          </div>
        </div>

        {/* Right side - Search, notifications, profile */}
        <div className="flex items-center space-x-2">
          {/* Search */}
          <div className="hidden md:flex relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 w-64 text-sm placeholder:text-gray-400"
            />
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
              onClick={() => setOpen(v => !v)}
            >
              <Bell className="w-5 h-5" />
              {notifications.length > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-medium">
                  {notifications.length > 9 ? '9+' : notifications.length}
                </span>
              )}
            </button>
            
            {open && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p className="text-sm font-medium">No notifications</p>
                      <p className="text-xs mt-1">You're all caught up</p>
                    </div>
                  ) : (
                    <div>
                      {notifications.map(n => (
                        <button
                          key={n.id}
                          className="w-full text-left p-3 hover:bg-gray-50 transition-colors duration-150 border-b border-gray-100 last:border-b-0"
                          onClick={n.onClick}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <Bell className="w-4 h-4 text-gray-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm text-gray-900 truncate">{n.title}</div>
                              <div className="text-xs text-gray-500 mt-0.5">{n.time}</div>
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
          <div className="flex items-center space-x-3">
            <div className="hidden md:flex items-center space-x-2">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{user?.fullName || 'User'}</div>
                <div className="text-xs text-gray-500 capitalize">{user?.userType || 'Member'}</div>
              </div>
            </div>
            <div className="w-9 h-9 bg-gray-900 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-800 transition-colors">
              <span className="text-white font-medium text-sm">
                {user?.fullName?.charAt(0) || 'U'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}