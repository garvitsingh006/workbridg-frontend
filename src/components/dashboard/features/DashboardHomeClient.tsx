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
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Welcome back, {user?.fullName?.split(' ')[0] || 'Client'}! 👋</h2>
        <p className="text-blue-100">
          You have {unreadMessages} unread messages and {openProjects} open projects.
        </p>
      </div>

      {/* Client-focused KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Projects Posted" value={postedProjects.toString()} icon={FolderOpen} color="text-blue-600" bg="bg-blue-100" />
        <StatCard title="Open Projects" value={openProjects.toString()} icon={ClipboardList} color="text-amber-600" bg="bg-amber-100" />
        <StatCard title="In Progress" value={inProgressProjects.toString()} icon={BadgeCheck} color="text-purple-600" bg="bg-purple-100" />
        <StatCard title="Preferred Budget" value={formatBudget(preferredBudget)} icon={DollarSign} color="text-green-600" bg="bg-green-100" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Your Open Projects */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Your Open Projects</h3>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium" onClick={onViewAllProjects}>
                View All
              </button>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {projects.filter(p => (p.createdBy?.id === user?.id) && (p.status === 'pending' || p.status === 'in-progress')).slice(0,4).map(p => (
              <div key={p.id} className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium text-gray-900">{p.title}</h4>
                    <p className="text-sm text-gray-600">Status: {p.status}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.status === 'in-progress' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>{p.status}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{p.deadline ? new Date(p.deadline as any).toLocaleDateString() : 'No deadline'}</span>
                </div>
              </div>
            ))}
            {projects.filter(p => (p.createdBy?.id === user?.id) && (p.status === 'pending' || p.status === 'in-progress')).length === 0 && (
              <p className="text-sm text-gray-600">You have no open projects right now.</p>
            )}
          </div>
        </div>

        {/* Recent Messages */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Recent Messages</h3>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View All
              </button>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {renderRecentMessages(chats, user?.id || '')}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((qa, i) => (
            <button key={i} onClick={qa.onClick} className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <qa.icon className="w-8 h-8 text-blue-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">{qa.title}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, bg }: { title: string; value: string; icon: any; color: string; bg: string; }) {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${bg}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
      <p className="text-gray-600 text-sm">{title}</p>
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
    return <p className="text-sm text-gray-600">No recent unread messages.</p>;
  }

  return items.map((message) => (
    <div key={message.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
        <span className="text-white text-sm font-medium">
          {(message.sender || 'U').charAt(0)}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-900">{message.sender}</p>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">{message.time}</span>
            {message.unread && (
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            )}
          </div>
        </div>
        <p className="text-sm text-gray-600 truncate">{message.message}</p>
      </div>
    </div>
  ));
}


