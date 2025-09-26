import { useUser } from '../../../contexts/UserContext';
import { useProject } from '../../../contexts/ProjectContext';
import { DollarSign, ChartBar as BarChart3, CircleCheck as CheckCircle, Clock, FolderOpen, Receipt } from 'lucide-react';

export default function AnalyticsFreelancer() {
  const { user } = useUser();
  const { projects } = useProject();

  const myProjects = projects.filter(
    p =>
      Array.isArray(p.assignedTo) &&
      p.assignedTo.some((a: any) => (a.id || a._id) === user?.id)
  );
  const completed = myProjects.filter(p => p.status === 'completed').length;
  const inProgress = myProjects.filter(p => p.status === 'in-progress').length;
  const earnings = myProjects.reduce((sum, p: any) => sum + (p.payout || 0), 0);
  const recentPaid = myProjects
    .filter((p: any) => (p.payout || 0) > 0)
    .slice(0, 5)
    .map((p: any) => ({ id: p.id, title: p.title, amount: p.payout, date: p.completedAt || p.updatedAt }));

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-900">Freelancer Analytics</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <Card title="Total Earnings" value={`$${Intl.NumberFormat().format(earnings)}`} icon={DollarSign} color="text-green-600" bg="bg-green-100" />
        <Card title="Completed" value={completed.toString()} icon={CheckCircle} color="text-blue-600" bg="bg-blue-100" />
        <Card title="In Progress" value={inProgress.toString()} icon={Clock} color="text-amber-600" bg="bg-amber-100" />
        <Card title="Assigned" value={myProjects.length.toString()} icon={FolderOpen} color="text-purple-600" bg="bg-purple-100" />
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2"><Receipt className="w-4 h-4 text-blue-600" /> Recent Payouts</h3>
        {recentPaid.length === 0 ? (
          <p className="text-xs text-gray-600">No payouts yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead className="text-left text-gray-500">
                <tr>
                  <th className="py-1 pr-3">Project</th>
                  <th className="py-1 pr-3">Amount</th>
                  <th className="py-1">Date</th>
                </tr>
              </thead>
              <tbody className="text-gray-800">
                {recentPaid.map((r: any) => (
                  <tr key={r.id} className="border-t">
                    <td className="py-1 pr-3">{r.title}</td>
                    <td className="py-1 pr-3">${Intl.NumberFormat().format(r.amount)}</td>
                    <td className="py-1">{r.date ? new Date(r.date).toLocaleDateString() : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Card({ title, value, icon: Icon, color, bg }: { title: string; value: string; icon: any; color: string; bg: string; }) {
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg ${bg}`}>
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-1">{value}</h3>
      <p className="text-gray-600 text-xs">{title}</p>
    </div>
  );
}


