import { useUser } from '../../../contexts/UserContext';
import { useProject } from '../../../contexts/ProjectContext';
import { useChat } from '../../../contexts/ChatContext';
import { 
  TrendingUp, 
  DollarSign, 
  FolderOpen, 
  MessageCircle, 
  Calendar,
  Star,
  Clock,
  CheckCircle
} from 'lucide-react';
 

type DashboardHomeProps = {
  onViewAllProjects: () => void;
};

export default function DashboardHome({ onViewAllProjects }: DashboardHomeProps) {
  const { user } = useUser();
  const { projects } = useProject();
  const { chats } = useChat();
  

  // Calculate stats from context data
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const activeProjects = projects.filter(p => p.status === 'in-progress').length;
  const unreadMessages = chats.reduce((total, chat) => {
    return total + (user ? chat.messages.filter(msg => !msg.read && msg.sender._id !== user.id).length : 0);
  }, 0);

  const stats = [
    {
      title: 'Total Earnings',
      value: '$12,450',
      change: '+12%',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Active Projects',
      value: activeProjects.toString(),
      change: `+${Math.max(0, activeProjects - 2)}`,
      icon: FolderOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Completed Projects',
      value: completedProjects.toString(),
      change: `+${Math.max(0, completedProjects - 20)}`,
      icon: CheckCircle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Client Rating',
      value: '4.9',
      change: '+0.1',
      icon: Star,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
  ];

  // Get recent projects from context
  const recentProjects = projects.slice(0, 3).map(project => ({
    id: project.id,
    name: project.title,
    client: project.createdBy.fullName,
    status: project.createdAt ? new Date(project.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: '2-digit' }) : '-',
    deadline: project.deadline ? new Date(project.deadline).toLocaleDateString() : "No deadline",
    progress: project.status === 'completed' ? 100 :
             project.status === 'in-progress' ? 75 :
             project.status === 'pending' ? 90 : 10,
  }));

  // Get recent messages from context
  const recentMessages = chats
    .map(chat => {
      const latest = [...chat.messages].reverse().find(m => !m.read && m.sender?._id !== (user?.id || ''));
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

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Welcome back, {user?.fullName?.split(' ')[0] || 'User'}! 👋</h2>
        <p className="text-blue-100">
          You have {unreadMessages} new messages and {activeProjects} active projects.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <span className="text-sm font-medium text-green-600">{stat.change}</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
            <p className="text-gray-600 text-sm">{stat.title}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Recent Projects</h3>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium" onClick={() => {onViewAllProjects()}}>
                View All
              </button>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {recentProjects.map((project) => (
              <div key={project.id} className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium text-gray-900">{project.name}</h4>
                    <p className="text-sm text-gray-600">{project.client}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    project.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                    project.status === 'Review' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {project.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{project.deadline}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">{project.progress}%</span>
                  </div>
                </div>
              </div>
            ))}
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
            {recentMessages.map((message) => (
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
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <FolderOpen className="w-8 h-8 text-blue-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">New Project</span>
          </button>
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <MessageCircle className="w-8 h-8 text-green-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Send Message</span>
          </button>
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Clock className="w-8 h-8 text-purple-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Time Tracker</span>
          </button>
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <TrendingUp className="w-8 h-8 text-orange-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">View Analytics</span>
          </button>
        </div>
      </div>
    </div>
  );
}