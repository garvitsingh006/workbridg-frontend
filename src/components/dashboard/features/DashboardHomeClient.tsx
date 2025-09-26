import { useUser } from '../../../contexts/UserContext';
import { useProject } from '../../../contexts/ProjectContext';
import { useChat } from '../../../contexts/ChatContext';
import {
  FolderOpen,
  DollarSign,
  ClipboardList,
  BadgeCheck,
  Calendar
} from 'lucide-react';

type DashboardHomeClientProps = {
  onViewAllProjects: () => void;
};

export default function DashboardHomeClient({ onViewAllProjects }: DashboardHomeClientProps) {
  const { user } = useUser();
  const { projects } = useProject();
  const { chats } = useChat();

  const unreadMessages = chats.reduce((total, chat) => {
    return total + (user ? chat.messages.filter(msg => !msg.read && msg.sender._id !== user.id).length : 0);
  }, 0);

  const postedProjects = projects.filter(p => p.createdBy?.id === user?.id).length;
  const openProjects = projects.filter(p => p.status === 'pending' && p.createdBy?.id === user?.id).length;
  const inProgressProjects = projects.filter(p => p.status === 'in-progress' && p.createdBy?.id === user?.id).length;

  const prefs = user?.clientDetails;
  const preferredBudget = prefs?.budgetRange || '-';

  const quickActions = [
    { title: 'Post a Project', icon: FolderOpen, onClick: onViewAllProjects },
    { title: 'Manage Agreements', icon: ClipboardList },
  ];

  return (
    <div className="p-4 space-y-3">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-3 text-white">
        <h2 className="text-lg font-bold mb-1">Welcome back, {user?.fullName?.split(' ')[0] || 'Client'}! 👋</h2>
        <p className="text-blue-100 text-xs">
          You have {unreadMessages} unread messages and {openProjects} open projects.
        </p>
      </div>

      {/* Client-focused KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Projects Posted" value={postedProjects.toString()} icon={FolderOpen} color="text-blue-600" bg="bg-blue-100" />
        <StatCard title="Open Projects" value={openProjects.toString()} icon={ClipboardList} color="text-amber-600" bg="bg-amber-100" />
        <StatCard title="In Progress" value={inProgressProjects.toString()} icon={BadgeCheck} color="text-purple-600" bg="bg-purple-100" />
        <StatCard title="Preferred Budget" value={formatBudget(preferredBudget)} icon={DollarSign} color="text-green-600" bg="bg-green-100" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Your Open Projects */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-3 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Your Open Projects</h3>
              <button className="text-blue-600 hover:text-blue-700 text-xs font-medium" onClick={onViewAllProjects}>
                View All
              </button>
            </div>
          </div>
          <div className="p-3 space-y-2">
            {projects.filter(p => (p.createdBy?.id === user?.id) && (p.status === 'pending' || p.status === 'in-progress')).slice(0,4).map(p => (
              <div key={p.id} className="border border-gray-100 rounded-lg p-2 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <h4 className="font-medium text-xs text-gray-900">{p.title}</h4>
                    <p className="text-xs text-gray-600">Status: {p.status}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-medium ${p.status === 'in-progress' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>{p.status}</span>
                </div>
                <div className="flex items-center space-x-1 text-xs text-gray-600">
                  <Calendar className="w-3 h-3" />
                  <span>{p.deadline ? new Date(p.deadline as any).toLocaleDateString() : 'No deadline'}</span>
                </div>
              </div>
            ))}
            {projects.filter(p => (p.createdBy?.id === user?.id) && (p.status === 'pending' || p.status === 'in-progress')).length === 0 && (
              <p className="text-xs text-gray-600">You have no open projects right now.</p>
            )}
          </div>
        </div>

        {/* Recent Messages */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-3 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Recent Messages</h3>
              <button className="text-blue-600 hover:text-blue-700 text-xs font-medium">
                View All
              </button>
            </div>
          </div>
          <div className="p-3 space-y-2">
            {renderRecentMessages(chats, user?.id || '')}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map((qa, i) => (
            <button key={i} onClick={qa.onClick} className="flex flex-col items-center p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <qa.icon className="w-5 h-5 text-blue-600 mb-1" />
              <span className="text-xs font-medium text-gray-900">{qa.title}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, bg }: { title: string; value: string; icon: any; color: string; bg: string; }) {
  return (
    <div className="bg-white rounded-lg p-3 border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <div className={`p-1.5 rounded-lg ${bg}`}>
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-1">{value}</h3>
      <p className="text-gray-600 text-xs">{title}</p>
    </div>
  );
}

function formatBudget(key: string) {
  switch (key) {
    case 'under-1000': return 'Under $1,000';
    case '1000-5000': return '$1,000 - $5,000';
    case '5000-10000': return '$5,000 - $10,000';
    case '10000-25000': return '$10,000 - $25,000';
    case '25000-50000': return '$25,000 - $50,000';
    case '50000+': return '$50,000+';
    default: return '-';
  }
}

function renderRecentMessages(chats: any[], userId: string) {
  const items = chats
    .map(chat => {
      const latest = [...chat.messages].reverse().find((m: any) => !m.read && m.sender?._id !== (userId || ''));
      if (!latest) return null;
      const titleRaw = chat.type === 'project' && chat.project ? chat.project.title : (latest.sender?.username || 'User');
      const title = (titleRaw?.toLowerCase?.() === 'admin') ? 'Admin' : titleRaw;
      return {
        id: `${chat._id}-${latest.timestamp?.toString?.() || Date.now()}`,
        sender: title,
        message: latest.content || '',
        time: new Date(latest.timestamp).toLocaleString(),
        unread: true,
      };
    })
    .filter(Boolean)
    .slice(0, 3) as Array<{id: string; sender: string; message: string; time: string; unread: boolean}>;

  if (items.length === 0) {
    return <p className="text-xs text-gray-600">No recent unread messages.</p>;
  }

  return items.map((message) => (
    <div key={message.id} className="flex items-start space-x-2 p-1.5 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
        <span className="text-white text-xs font-medium">
          {(message.sender || 'U').charAt(0)}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-gray-900">{message.sender}</p>
          <div className="flex items-center space-x-1">
            <span className="text-[9px] text-gray-500">{message.time}</span>
            {message.unread && (
              <div className="w-1 h-1 bg-blue-600 rounded-full"></div>
            )}
          </div>
        </div>
        <p className="text-xs text-gray-600 truncate">{message.message}</p>
      </div>
    </div>
  ));
}


