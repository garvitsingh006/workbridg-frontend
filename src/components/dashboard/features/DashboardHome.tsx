import { useUser } from '../../../contexts/UserContext';
import { useProject } from '../../../contexts/ProjectContext';
import { useChat } from '../../../contexts/ChatContext';
import { TrendingUp, DollarSign, FolderOpen, MessageCircle, Calendar, Star, Clock, CircleCheck as CheckCircle, ArrowRight, Users, Award } from 'lucide-react';
import { useState, useEffect } from 'react';

type DashboardHomeProps = {
  onViewAllProjects: () => void;
};

export default function DashboardHome({ onViewAllProjects }: DashboardHomeProps) {
  const { user } = useUser();
  const { projects } = useProject();
  const { chats } = useChat();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

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
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      title: 'Active Projects',
      value: activeProjects.toString(),
      change: `+${Math.max(0, activeProjects - 2)}`,
      icon: FolderOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      title: 'Completed Projects',
      value: completedProjects.toString(),
      change: `+${Math.max(0, completedProjects - 20)}`,
      icon: CheckCircle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      title: 'Client Rating',
      value: '4.9',
      change: '+0.1',
      icon: Star,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200'
    },
  ];

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
    <div className="p-4 space-y-4">
      {/* Welcome Section */}
      <div className={`bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-4 text-white relative overflow-hidden transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
        <div className="absolute bottom-0 left-0 w-12 h-12 bg-white/5 rounded-full translate-y-6 -translate-x-6"></div>
        <div className="relative z-10">
          <h2 className="text-xl font-bold mb-2">Welcome back, {user?.fullName?.split(' ')[0] || 'User'}! 👋</h2>
          <p className="text-gray-300 text-sm">
            You have {unreadMessages} new messages and {activeProjects} active projects.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className={`bg-white rounded-lg p-3 border ${stat.borderColor} hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 animate-fadeInUp`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                {stat.change}
              </span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">{stat.value}</h3>
            <p className="text-gray-600 text-xs font-medium">{stat.title}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Projects */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300">
          <div className="p-3 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900 flex items-center">
                <FolderOpen className="w-4 h-4 mr-1 text-blue-600" />
                Recent Projects
              </h3>
              <button 
                className="text-blue-600 hover:text-blue-700 text-xs font-medium flex items-center group transition-all duration-300" 
                onClick={onViewAllProjects}
              >
                View All
                <ArrowRight className="w-3 h-3 ml-0.5 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </div>
          </div>
          <div className="p-3 space-y-2">
            {recentProjects.map((project, index) => (
              <div 
                key={project.id} 
                className="border border-gray-100 rounded-lg p-2 hover:bg-gray-50 transition-all duration-300"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <h4 className="font-medium text-xs text-gray-900">{project.name}</h4>
                    <p className="text-xs text-gray-600">{project.client}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-medium bg-blue-100 text-blue-800">
                    {project.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1 text-xs text-gray-600">
                    <Calendar className="w-3 h-3" />
                    <span>{project.deadline}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-12 bg-gray-200 rounded-full h-1">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-1 rounded-full transition-all duration-500"
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-medium text-gray-600">{project.progress}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Messages */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300">
          <div className="p-3 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900 flex items-center">
                <MessageCircle className="w-4 h-4 mr-1 text-green-600" />
                Recent Messages
              </h3>
              <button className="text-green-600 hover:text-green-700 text-xs font-medium flex items-center group transition-all duration-300">
                View All
                <ArrowRight className="w-3 h-3 ml-0.5 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </div>
          </div>
          <div className="p-3 space-y-2">
            {recentMessages.map((message, index) => (
              <div 
                key={message.id} 
                className="flex items-start space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-all duration-300"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-7 h-7 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">
                    {(message.sender || 'U').charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-gray-900">{message.sender}</p>
                    <div className="flex items-center space-x-1">
                      <span className="text-[9px] text-gray-500">{message.time}</span>
                      {message.unread && (
                        <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 truncate">{message.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}