import { useUser } from '../../../contexts/UserContext';
import { useProject } from '../../../contexts/ProjectContext';
import { useChat } from '../../../contexts/ChatContext';
import { usePayment } from '../../../contexts/PaymentContext';
import {
  TrendingUp,
  DollarSign,
  Briefcase,
  Users,
  Calendar,
  Clock
} from 'lucide-react';

type DashboardHomeClientProps = {
  onViewAllProjects: () => void;
};

export default function DashboardHomeClient({ onViewAllProjects }: DashboardHomeClientProps) {
  const { user } = useUser();
  const { projects } = useProject();
  const { chats } = useChat();
  const { payments } = usePayment();

  const unreadMessages = chats.reduce((total, chat) => {
    return total + (user ? chat.messages.filter(msg => !msg.read && msg.sender._id !== user.id).length : 0);
  }, 0);

  const postedProjects = projects.filter(p => p.createdBy?.id === user?.id).length;
  const unassignedProjects = projects.filter(p => p.status === 'unassigned' && p.createdBy?.id === user?.id).length;
  const inProgressProjects = projects.filter(p => p.status === 'in-progress' && p.createdBy?.id === user?.id).length;

  const totalPaid = payments.reduce((sum, payment) => {
    if (payment.total.status === 'paid') {
      return sum + (payment.totalAmount + payment.platformFee.serviceCharge);
    }
    return sum;
  }, 0);


  return (
    <>
      <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50/30 p-4 sm:p-6 lg:p-8">
        {/* Welcome Section */}
        <div className="bg-linear-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 sm:p-8 text-white shadow-2xl mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <div className="relative z-10">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Welcome back, {user?.fullName?.split(' ')[0] || 'Client'}! 👋</h1>
            <p className="text-blue-100 text-sm sm:text-base opacity-90">
              You have <span className="font-semibold">{unreadMessages}</span> unread messages and <span className="font-semibold">{unassignedProjects}</span> unassigned projects.
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <StatCard
            title="Projects Posted"
            value={postedProjects.toString()}
            icon={Briefcase}
            color="text-blue-600"
            bg="bg-blue-100"
          />
          <StatCard
            title="Unassigned"
            value={unassignedProjects.toString()}
            icon={Users}
            color="text-amber-600"
            bg="bg-amber-100"
          />
          <StatCard
            title="In Progress"
            value={inProgressProjects.toString()}
            icon={Clock}
            color="text-violet-600"
            bg="bg-violet-100"
          />
          <StatCard
            title="Total Paid"
            value={`₹${totalPaid.toLocaleString()}`}
            icon={DollarSign}
            color="text-green-600"
            bg="bg-green-100"
          />
        </div>

        {/* Active Projects Grid */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-100 bg-linear-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" />
                Your Active Projects
              </h2>
              <button 
                onClick={onViewAllProjects} 
                className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1 transition-colors"
              >
                View All Projects
                <TrendingUp className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="p-4 sm:p-6">
            {projects.filter(p => (p.createdBy?.id === user?.id) && (p.status === 'pending' || p.status === 'in-progress')).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.filter(p => (p.createdBy?.id === user?.id) && (p.status === 'pending' || p.status === 'in-progress')).slice(0, 6).map((project, index) => (
                  <div
                    key={project.id}
                    className="group bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg hover:border-blue-300 transition-all duration-300 cursor-pointer"
                    style={{ animationDelay: `${index * 0.1}s` }}
                    onClick={() => window.location.href = `/dashboard/projects`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            project.status === 'in-progress' ? 'bg-blue-100 text-blue-600' : 
                            project.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                            'bg-gray-100 text-gray-600'
                          }`}>
                            <Briefcase className="w-4 h-4" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 text-sm mb-1 truncate">{project.title}</h3>
                            <p className="text-xs text-gray-500 mb-2">
                              {project.category || 'Development'} • Posted {new Date(project.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            project.status === 'in-progress' ? 'bg-blue-100 text-blue-800' : 
                            project.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {project.status === 'in-progress' ? 'In Progress' : 
                             project.status === 'pending' ? 'Pending' : project.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{project.deadline ? new Date(project.deadline).toLocaleDateString() : 'No deadline'}</span>
                        </div>
                        {project.budget && (
                          <span className="font-semibold text-gray-900">₹{project.budget.toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <Briefcase className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Active Projects</h3>
                <p className="text-gray-600 mb-6">You haven't posted any projects yet.</p>
                <button 
                  onClick={onViewAllProjects}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors inline-flex items-center gap-2"
                >
                  <Briefcase className="w-5 h-5" />
                  Post Your First Project
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function StatCard({ title, value, icon: Icon, color, bg }: { title: string; value: string; icon: any; color: string; bg: string; }) {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
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





