import { useUser } from '../../../contexts/UserContext';
import { useProject } from '../../../contexts/ProjectContext';
import { BarChart3, TrendingUp, Users, DollarSign, Clock } from 'lucide-react';

export default function AnalyticsClient() {
  const { user } = useUser();
  const { projects } = useProject();

  const myProjects = projects.filter(p => p.createdBy?.id === user?.id);
  const spendEstimate = myProjects.reduce((sum, p: any) => sum + (p.budget || 0), 0);
  const open = myProjects.filter(p => p.status === 'pending').length;
  const inProgress = myProjects.filter(p => p.status === 'in-progress').length;
  const completed = myProjects.filter(p => p.status === 'completed').length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <BarChart3 className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900">Client Analytics</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card title="Total Posted" value={myProjects.length.toString()} icon={TrendingUp} color="text-blue-600" bg="bg-blue-100" />
        <Card title="Open Projects" value={open.toString()} icon={Clock} color="text-amber-600" bg="bg-amber-100" />
        <Card title="In Progress" value={inProgress.toString()} icon={Users} color="text-purple-600" bg="bg-purple-100" />
        <Card title="Estimated Spend" value={`$${Intl.NumberFormat().format(spendEstimate)}`} icon={DollarSign} color="text-green-600" bg="bg-green-100" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">By Status</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="p-4 rounded-lg bg-blue-50">
            <div className="text-gray-500 mb-1">Open</div>
            <div className="text-xl font-bold">{open}</div>
          </div>
          <div className="p-4 rounded-lg bg-amber-50">
            <div className="text-gray-500 mb-1">In Progress</div>
            <div className="text-xl font-bold">{inProgress}</div>
          </div>
          <div className="p-4 rounded-lg bg-green-50">
            <div className="text-gray-500 mb-1">Completed</div>
            <div className="text-xl font-bold">{completed}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({ title, value, icon: Icon, color, bg }: { title: string; value: string; icon: any; color: string; bg: string; }) {
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


