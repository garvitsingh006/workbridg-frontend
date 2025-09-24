import { Menu, Bell, Search, User } from 'lucide-react';
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
  useMemo(() => chats.reduce((acc, c) => acc + c.messages.filter(m => !m.read && m.sender._id !== (user?.id || "")).length, 0), [chats, user?.id]);
  const notifications = useMemo(() => {
    const items: Array<{ id: string; title: string; time: string; onClick?: () => void }> = [];
    // Build notifications from latest unread messages per chat
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
            // Set hash to identify chat; MessageFeature can read it and select
            window.location.hash = `#messages:${c._id}`;
            // If we're not in dashboard messages, we still navigate
            if (!window.location.pathname.includes('/dashboard')) {
              window.location.href = '/dashboard';
            }
          }
        });
      }
    });
    return items;
  }, [chats, user?.id]);
    useEffect(() => {
        fetchUser()
    }, [])
    
  const getFeatureTitle = () => {
    const titles: { [key: string]: string } = {
      home: 'Dashboard',
      projects: 'My Projects',
      messages: 'Messages',
      earnings: 'Earnings',
      analytics: 'Analytics',
      calendar: 'Calendar',
      notifications: 'Notifications',
      profile: 'Profile',
      settings: 'Settings',
    };
    return titles[activeFeature] || 'Dashboard';
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Mobile menu button and title */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onMobileMenuToggle}
            className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
            {getFeatureTitle()}
          </h1>
        </div>

        {/* Right side - Search, notifications, profile */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <UserSearchBox />

          {/* Notifications */}
          <div className="relative">
            <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors" onClick={() => setOpen(v => !v)}>
              <Bell className="w-5 h-5" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-blue-600 text-white text-[10px]">{notifications.length}</span>
              )}
            </button>
            {open && (
              <div className="absolute right-0 mt-2 w-64 bg-white border rounded-md shadow-lg z-10">
                <div className="p-2 text-xs text-gray-500">Notifications</div>
                <ul className="max-h-80 overflow-auto">
                  {notifications.map(n => (
                    <li key={n.id}>
                      <button className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm" onClick={n.onClick}>
                        {n.title}
                        <div className="text-xs text-gray-500">{n.time}</div>
                      </button>
                    </li>
                  ))}
                  {notifications.length === 0 && (
                    <li className="px-3 py-2 text-sm text-gray-500">No notifications</li>
                  )}
                </ul>
              </div>
            )}
          </div>

          {/* Profile */}
          <button className="flex items-center space-x-2 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className="hidden md:block font-medium">{user?.fullName || 'User'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}

function UserSearchBox() {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Array<{ _id: string; username: string; fullName?: string }>>([]);

  useEffect(() => {
    if (!q) { setResults([]); return; }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await fetch(`${import.meta.env.VITE_SERVER}/users/all`, { credentials: 'include', signal: ctrl.signal as any });
        const data = await res.json();
        const arr = data?.users || data?.data || [];
        const filtered = (Array.isArray(arr) ? arr : [])
          .filter((u: any) => (u.username || '').toLowerCase().includes(q.toLowerCase()) || (u.fullName || '').toLowerCase().includes(q.toLowerCase()))
          .slice(0, 5)
          .map((u: any) => ({ _id: u._id || u.id, username: u.username, fullName: u.fullName }));
        setResults(filtered);
        setOpen(true);
      } catch (_) {
        // ignore
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => { clearTimeout(t); ctrl.abort(); };
  }, [q]);

  return (
    <div className="hidden md:flex relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => q && setOpen(true)}
        placeholder="Search users..."
        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all w-64"
      />
      {open && (q.length > 0) && (
        <div className="absolute top-full mt-1 left-0 w-full bg-white border rounded-md shadow z-20">
          <ul>
            {loading && <li className="px-3 py-2 text-sm text-gray-500">Searching…</li>}
            {!loading && results.map(r => (
              <li key={r._id}>
                <button
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
                  onClick={() => {
                    window.location.href = `/profile/${r.username}`;
                    setOpen(false);
                  }}
                >
                  <div className="font-medium">{r.fullName || r.username}</div>
                  <div className="text-xs text-gray-500">{r.username}</div>
                </button>
              </li>
            ))}
            {!loading && results.length === 0 && (
              <li className="px-3 py-2 text-sm text-gray-500">No matches</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}