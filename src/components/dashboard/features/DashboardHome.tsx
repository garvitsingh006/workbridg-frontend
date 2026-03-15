import { useProject } from '../../../contexts/ProjectContext';
import { useUser } from '../../../contexts/UserContext';
import { usePayment } from '../../../contexts/PaymentContext';
import { TrendingUp, DollarSign, FolderOpen, CircleCheck as CheckCircle, Users, Search, Crown, Zap } from 'lucide-react';
import ProjectDetailsModal from '../../modals/ProjectDetailsModal';
import { useState, useEffect } from 'react';
import api from '../../../api';
import { toast } from 'react-toastify';
import { createPortal } from 'react-dom';

type DashboardHomeProps = {
  onViewAllProjects?: () => void;
};

export default function DashboardHome({}: DashboardHomeProps) {
  const { projects, fetchProjects } = useProject();
  const { user, fetchUser } = useUser();
  const { payments, fetchUserPayments, subscribeFreelancer } = usePayment();
  const [, setIsVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [weeklyStats, setWeeklyStats] = useState<{ used: number; limit: number; remaining: number } | null>(null);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  const isFreelancer = user?.userType === 'freelancer';
  const freelancerDetails = user?.freelancerDetails;

  useEffect(() => {
    setIsVisible(true);
    fetchUserPayments();
    fetchProjects();
  }, [fetchUserPayments, fetchProjects]);

  useEffect(() => {
    if (isFreelancer) {
      api.get('/users/freelancer/weekly-stats').then((res: any) => {
        if (res.data.success) setWeeklyStats(res.data.data);
      }).catch(() => {});
    }
  }, [isFreelancer]);

  const handleSubscribe = async () => {
    setSubscribing(true);
    try {
      await subscribeFreelancer();
      await fetchUser();
      const statsRes = await api.get('/users/freelancer/weekly-stats');
      if (statsRes.data.success) setWeeklyStats(statsRes.data.data);
      setShowSubscribeModal(false);
      toast.success('🎉 You are now a Premium member!');
    } catch (err: any) {
      toast.error(err.message || 'Subscription failed');
    } finally {
      setSubscribing(false);
    }
  };

  const releasedEarnings = payments.reduce((sum, payment) => {
    return sum + (payment.releaseStatus === 'released' ? payment.releaseAmount : 0);
  }, 0);
  
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  
  const prevMonthEarnings = payments.reduce((sum, payment) => {
    if (payment.releaseStatus === 'released') {
      const releaseDate = new Date(payment.updatedAt);
      if (releaseDate.getMonth() === prevMonth && releaseDate.getFullYear() === prevYear) {
        return sum + payment.releaseAmount;
      }
    }
    return sum;
  }, 0);
  
  const prevMonthCompleted = projects.filter(p => {
    if (p.status === 'completed' && (p as any).completedAt) {
      const completedDate = new Date((p as any).completedAt);
      return completedDate.getMonth() === prevMonth && completedDate.getFullYear() === prevYear;
    }
    return false;
  }).length;
  
  const calculatePercentage = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? '+100%' : '0%';
    const change = ((current - previous) / previous) * 100;
    return change >= 0 ? `+${Math.round(change)}%` : `${Math.round(change)}%`;
  };

  const availableProjects = projects.filter(p => p.status !== 'completed').length;

  const stats = [
    {
      title: 'Total Earnings',
      value: isFreelancer ? `₹${releasedEarnings.toLocaleString()}` : '₹0',
      change: calculatePercentage(releasedEarnings, prevMonthEarnings),
      trend: `Update: ${new Date().toLocaleDateString()}`,
      icon: DollarSign,
      color: 'text-[#f72585]',
      bgColor: 'bg-[#f72585]',
      gradient: 'from-[#f72585] to-[#f72585]'
    },
    {
      title: 'Completed Projects',
      value: isFreelancer ? (freelancerDetails?.completedProjects || 0).toString() : '0',
      change: calculatePercentage(freelancerDetails?.completedProjects || 0, prevMonthCompleted),
      trend: `Update: ${new Date().toLocaleDateString()}`,
      icon: FolderOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-500',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Rating',
      value: isFreelancer && freelancerDetails?.isInterviewed ? 
        (freelancerDetails?.rating ? `${freelancerDetails.rating.toFixed(1)}/5` : 'No rating') : 
        'Not Interviewed',
      change: '',
      trend: `Update: ${new Date().toLocaleDateString()}`,
      icon: CheckCircle,
      color: 'text-[#f72585]',
      bgColor: 'bg-[#f72585]',
      gradient: 'from-[#f72585] to-[#f72585]'
    },
    {
      title: 'Available Projects',
      value: availableProjects.toString(),
      change: '0%',
      trend: `Update: ${new Date().toLocaleDateString()}`,
      icon: Users,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-500',
      gradient: 'from-indigo-500 to-indigo-600'
    },
  ];

  const recentProjects = projects.slice(0, 3).map(project => ({
    id: project.id,
    name: project.title,
    client: project.createdBy?.fullName || 'Unknown Client',
    category: 'Development',
    price: project.budget ? `₹${project.budget.toLocaleString()}` : '₹0',
    image: 'https://images.pexels.com/photos/1779487/pexels-photo-1779487.jpeg?auto=compress&cs=tinysrgb&w=200',
    status: project.createdAt ? new Date(project.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: '2-digit' }) : '-',
    deadline: project.deadline ? new Date(project.deadline).toLocaleDateString() : "No deadline",
    progress: project.status === 'completed' ? 100 :
             project.status === 'in-progress' ? 75 :
             project.status === 'pending' ? 90 : 10,
  }));

  return (
    <div className="p-6 space-y-6 mt-10">

      {/* Premium subscription banner - only for non-premium freelancers */}
      {isFreelancer && !user?.isPremium && (
        <div className="bg-linear-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-400 rounded-xl">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Upgrade to Premium</p>
              <p className="text-xs text-gray-600">Get 50 applications/week, a premium badge, and more — for just ₹299/month</p>
            </div>
          </div>
          <button
            onClick={() => setShowSubscribeModal(true)}
            className="shrink-0 flex items-center gap-1.5 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-white font-semibold text-sm rounded-xl transition-colors"
          >
            <Zap className="w-4 h-4" />
            Upgrade
          </button>
        </div>
      )}

      {/* Weekly application limit - for all freelancers */}
      {isFreelancer && weeklyStats && (
        <div className="bg-white border border-gray-100 rounded-2xl px-5 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            {user?.isPremium && <Crown className="w-4 h-4 text-yellow-500 fill-yellow-400" />}
            <span className="text-sm font-medium text-gray-700">Weekly Applications</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${weeklyStats.remaining === 0 ? 'bg-red-400' : user?.isPremium ? 'bg-yellow-400' : 'bg-[#f72585]'}`}
                  style={{ width: `${(weeklyStats.used / weeklyStats.limit) * 100}%` }}
                />
              </div>
              <span className="text-xs text-gray-500">{weeklyStats.used}/{weeklyStats.limit}</span>
            </div>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${weeklyStats.remaining === 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
              {weeklyStats.remaining} left
            </span>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden group`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br opacity-5 rounded-full translate-x-12 -translate-y-12 group-hover:scale-150 transition-transform duration-500" style={{background: `linear-gradient(135deg, ${stat.bgColor} 0%, transparent 100%)`}}></div>
            <div className="flex items-start justify-between mb-4 relative z-10">
              <div className={`p-3 rounded-xl bg-linear-to-br ${stat.gradient} shadow-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded-lg">
                <TrendingUp className="w-3 h-3 text-green-600" />
                <span className="text-xs font-semibold text-green-600">{stat.change}</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
            <p className="text-sm text-gray-600 font-medium mb-2">{stat.title}</p>
            <p className="text-xs text-gray-400">{stat.trend}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart Area */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Revenue Statistics</h3>
                <p className="text-sm text-gray-500 mt-1">This Month</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">All Services</button>
                <button className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">See All</button>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="mb-6">
              <div className="text-3xl font-bold text-gray-900">
                ₹{isFreelancer ? releasedEarnings.toLocaleString() : '0'}
              </div>
              <div className="text-sm text-gray-500 mt-1">Total Earnings</div>
            </div>
            <div className="relative h-64 flex items-end justify-between gap-2">
              {(() => {
                const monthlyData = Array(12).fill(0);
                const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                
                payments.forEach(payment => {
                  if (payment.releaseStatus === 'released') {
                    const releaseDate = new Date(payment.updatedAt);
                    const monthIndex = releaseDate.getMonth();
                    monthlyData[monthIndex] += payment.releaseAmount;
                  }
                });
                
                const maxAmount = Math.max(...monthlyData, 1);
                
                return monthlyData.map((amount, i) => {
                  const height = maxAmount > 0 ? (amount / maxAmount) * 80 + 10 : 10;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div
                        className="w-full bg-linear-to-t from-[#f72585] to-[#f72585] rounded-t-lg relative group cursor-pointer transition-all duration-300 hover:from-[#f72585] hover:to-[#f72585]"
                        style={{ height: `${height}%` }}
                      >
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                          ₹{amount.toLocaleString()}
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">
                        {monthNames[i]}
                      </span>
                    </div>
                  );
                });
              })()
              }
            </div>
          </div>
        </div>

        {/* All Services Sidebar */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">All Services</h3>
              <button className="text-sm text-[#f72585] hover:text-[#f72585] font-medium">See All</button>
            </div>
            <div className="mt-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search"
                  className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#f72585] focus:border-transparent outline-none transition-all text-sm"
                />
              </div>
            </div>
          </div>
          <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
            {recentProjects.map((project) => (
              <div
                key={project.id}
                onClick={() => {
                  const originalProject = projects.find(p => p.id === project.id);
                  if (originalProject) {
                    setSelectedProject(originalProject);
                    setDetailsModalOpen(true);
                  }
                }}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all cursor-pointer border border-transparent hover:border-[#f72585]/20"
              >
                <img
                  src={project.image}
                  alt={project.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm text-gray-900 truncate">{project.name}</h4>
                  <p className="text-xs text-gray-500">{project.category}</p>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-sm text-gray-900">{project.price}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Project Details Modal */}
      <ProjectDetailsModal
        isOpen={detailsModalOpen}
        onClose={() => {
          setDetailsModalOpen(false);
          setSelectedProject(null);
        }}
        project={selectedProject}
        onEdit={() => {}}
      />

      {/* Subscribe Modal */}
      {showSubscribeModal && createPortal(
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => !subscribing && setShowSubscribeModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Crown className="w-7 h-7 text-yellow-500 fill-yellow-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Go Premium</h3>
              <p className="text-gray-500 text-sm mt-1">Unlock the full potential of Workbridg</p>
            </div>

            <div className="space-y-2 mb-6">
              {['50 applications per week (vs 5)', 'Premium badge next to your name', 'Stand out to clients'].map(benefit => (
                <div key={benefit} className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                  {benefit}
                </div>
              ))}
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-6 text-center">
              <div className="text-3xl font-bold text-gray-900">₹299<span className="text-base font-normal text-gray-500">/month</span></div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowSubscribeModal(false)}
                disabled={subscribing}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSubscribe}
                disabled={subscribing}
                className="flex-1 px-4 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-white rounded-xl transition-colors text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {subscribing ? (
                  <span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                ) : (
                  <Crown className="w-4 h-4" />
                )}
                {subscribing ? 'Processing...' : 'Confirm Payment'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
