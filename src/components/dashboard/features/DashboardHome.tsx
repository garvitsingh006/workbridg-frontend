import { useProject } from '../../../contexts/ProjectContext';
import { TrendingUp, DollarSign, FolderOpen, CircleCheck as CheckCircle, Users, Search, Bell } from 'lucide-react';
import { useState, useEffect } from 'react';

type DashboardHomeProps = {
  onViewAllProjects?: () => void;
};

export default function DashboardHome({}: DashboardHomeProps) {
  const { projects } = useProject();
  const [, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const totalProjects = projects.length;

  const stats = [
    {
      title: 'Total Earnings',
      value: '$80,45,679',
      change: '+12%',
      trend: 'Update: July 13, 2025',
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-500',
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Total Projects',
      value: '1,240',
      change: '+8%',
      trend: 'Update: July 13, 2025',
      icon: FolderOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-500',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Total Services',
      value: '80',
      change: '+5%',
      trend: 'Update: July 13, 2025',
      icon: CheckCircle,
      color: 'text-pink-600',
      bgColor: 'bg-pink-500',
      gradient: 'from-pink-500 to-pink-600'
    },
    {
      title: 'Total Clients',
      value: '3,500',
      change: '+12%',
      trend: 'Update: July 13, 2025',
      icon: Users,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-500',
      gradient: 'from-indigo-500 to-indigo-600'
    },
  ];

  const recentProjects = projects.slice(0, 3).map(project => ({
    id: project.id,
    name: project.title,
    client: project.createdBy.fullName,
    category: 'Development',
    price: project.payment ? `$${project.payment.amount.toLocaleString()}` : 'TBD',
    image: 'https://images.pexels.com/photos/1779487/pexels-photo-1779487.jpeg?auto=compress&cs=tinysrgb&w=200',
    status: project.createdAt ? new Date(project.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: '2-digit' }) : '-',
    deadline: project.deadline ? new Date(project.deadline).toLocaleDateString() : "No deadline",
    progress: project.status === 'completed' ? 100 :
             project.status === 'in-progress' ? 75 :
             project.status === 'pending' ? 90 : 10,
  }));


  return (
    <div className="p-6 space-y-6">
      {/* Header with Search */}
      <div className="flex items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-sm"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors relative">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-purple-500 rounded-full"></span>
          </button>
          <button className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all font-medium text-sm shadow-lg shadow-purple-500/30">
            + New
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden group`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-5 rounded-full translate-x-12 -translate-y-12 group-hover:scale-150 transition-transform duration-500" style={{background: `linear-gradient(135deg, ${stat.bgColor} 0%, transparent 100%)`}}></div>
            <div className="flex items-start justify-between mb-4 relative z-10">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
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
              <div className="text-3xl font-bold text-gray-900">$223M</div>
              <div className="text-sm text-gray-500 mt-1">Total Revenue</div>
            </div>
            {/* Chart Visualization - Simplified SVG */}
            <div className="relative h-64 flex items-end justify-between gap-2">
              {[40, 55, 45, 70, 60, 80, 65, 85, 75, 90, 70, 50].map((height, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-gradient-to-t from-purple-500 to-purple-400 rounded-t-lg relative group cursor-pointer transition-all duration-300 hover:from-purple-600 hover:to-purple-500"
                    style={{ height: `${height}%` }}
                  >
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      ${(height * 50).toFixed(0)}
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">
                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* All Services Sidebar */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">All Services</h3>
              <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">See All</button>
            </div>
            <div className="mt-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search"
                  className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-sm"
                />
              </div>
            </div>
          </div>
          <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
            {recentProjects.map((project) => (
              <div
                key={project.id}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all cursor-pointer border border-transparent hover:border-purple-100"
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

      {/* Clients Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Clients</h3>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search"
                  className="pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-sm w-48"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Project / Add Client Project</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Team</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentProjects.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={project.image}
                        alt={project.name}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <div>
                        <div className="font-medium text-sm text-gray-900">{project.name}</div>
                        <div className="text-xs text-gray-500">{project.client}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium">
                      {project.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 border-2 border-white flex items-center justify-center text-white text-xs font-semibold"
                        >
                          {['A', 'B', 'C'][i-1]}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-sm text-gray-900">{project.price}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-gray-100 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing 1 to {recentProjects.length} of {totalProjects} results
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm">
              Previous
            </button>
            <button className="px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm">
              1
            </button>
            <button className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm">
              2
            </button>
            <button className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
