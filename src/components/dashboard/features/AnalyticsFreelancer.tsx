import { useUser } from '../../../contexts/UserContext';
import { useProject } from '../../../contexts/ProjectContext';
import { usePayment } from '../../../contexts/PaymentContext';
import { DollarSign, CircleCheck as CheckCircle, Clock, FolderOpen, Receipt, TrendingUp, ArrowUpRight } from 'lucide-react';
import { useEffect } from 'react';

export default function AnalyticsFreelancer() {
  const { user } = useUser();
  const { projects } = useProject();
  const { payments, fetchUserPayments } = usePayment();

  useEffect(() => {
    fetchUserPayments();
  }, [fetchUserPayments]);

  const myProjects = projects.filter(
    p =>
      Array.isArray(p.assignedTo) &&
      p.assignedTo.some((a: any) => (a.id || a._id) === user?.id)
  );
  const completed = myProjects.filter(p => p.status === 'completed').length;
  const inProgress = myProjects.filter(p => p.status === 'in-progress').length;
  const earnings = payments.reduce((sum, payment) => {
    return sum + (payment.releaseStatus === 'released' ? payment.releaseAmount : 0);
  }, 0);
  
  // Calculate previous month data for percentage changes
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
  
  const prevMonthCompleted = myProjects.filter(p => {
    if (p.status === 'completed' && p.completedAt) {
      const completedDate = new Date(p.completedAt);
      return completedDate.getMonth() === prevMonth && completedDate.getFullYear() === prevYear;
    }
    return false;
  }).length;
  
  const prevMonthAssigned = myProjects.filter(p => {
    if (p.createdAt) {
      const createdDate = new Date(p.createdAt);
      return createdDate.getMonth() === prevMonth && createdDate.getFullYear() === prevYear;
    }
    return false;
  }).length;
  
  const calculatePercentage = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? '+100%' : '0%';
    const change = ((current - previous) / previous) * 100;
    return change >= 0 ? `+${Math.round(change)}%` : `${Math.round(change)}%`;
  };
  
  const recentPaid = myProjects
    .filter((p: any) => (p.payout || 0) > 0)
    .slice(0, 5)
    .map((p: any) => ({ id: p.id, title: p.title, amount: p.payout, date: p.completedAt || p.updatedAt }));

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
          <p className="text-sm text-gray-600 mt-1">Track your performance and growth</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-transparent rounded-full translate-x-12 -translate-y-12"></div>
          <div className="flex items-start justify-between mb-4 relative z-10">
            <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded-lg">
              <ArrowUpRight className="w-3 h-3 text-green-600" />
              <span className="text-xs font-semibold text-green-600">{calculatePercentage(earnings, prevMonthEarnings)}</span>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">₹{Intl.NumberFormat().format(earnings)}</h3>
          <p className="text-sm text-gray-600 font-medium">Total Earnings</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full translate-x-12 -translate-y-12"></div>
          <div className="flex items-start justify-between mb-4 relative z-10">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-lg">
              <TrendingUp className="w-3 h-3 text-blue-600" />
              <span className="text-xs font-semibold text-blue-600">{calculatePercentage(completed, prevMonthCompleted)}</span>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{completed}</h3>
          <p className="text-sm text-gray-600 font-medium">Completed Projects</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-500/10 to-transparent rounded-full translate-x-12 -translate-y-12"></div>
          <div className="flex items-start justify-between mb-4 relative z-10">
            <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 shadow-lg">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
              <Clock className="w-3 h-3 text-yellow-600" />
              <span className="text-xs font-semibold text-yellow-600">Active</span>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{inProgress}</h3>
          <p className="text-sm text-gray-600 font-medium">In Progress</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full translate-x-12 -translate-y-12"></div>
          <div className="flex items-start justify-between mb-4 relative z-10">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
              <FolderOpen className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center gap-1 bg-purple-50 px-2 py-1 rounded-lg">
              <TrendingUp className="w-3 h-3 text-purple-600" />
              <span className="text-xs font-semibold text-purple-600">{calculatePercentage(myProjects.length, prevMonthAssigned)}</span>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{myProjects.length}</h3>
          <p className="text-sm text-gray-600 font-medium">Total Assigned</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Earnings Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Earnings Overview</h3>
                <p className="text-sm text-gray-500 mt-1">Monthly earnings trend</p>
              </div>
              <button className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                Last 6 Months
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="relative h-64 flex items-end justify-between gap-2">
              {(() => {
                const monthlyData = Array(6).fill(0);
                const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
                const currentMonth = new Date().getMonth();
                
                payments.forEach(payment => {
                  if (payment.releaseStatus === 'released') {
                    const releaseDate = new Date(payment.updatedAt);
                    const monthIndex = releaseDate.getMonth();
                    if (monthIndex >= currentMonth - 5 && monthIndex <= currentMonth) {
                      const dataIndex = monthIndex - (currentMonth - 5);
                      if (dataIndex >= 0 && dataIndex < 6) {
                        monthlyData[dataIndex] += payment.releaseAmount;
                      }
                    }
                  }
                });
                
                const maxAmount = Math.max(...monthlyData, 1);
                
                return monthlyData.map((amount, i) => {
                  const height = maxAmount > 0 ? (amount / maxAmount) * 80 + 10 : 10;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div
                        className="w-full bg-gradient-to-t from-purple-500 to-purple-400 rounded-t-lg relative group cursor-pointer transition-all duration-300 hover:from-purple-600 hover:to-purple-500"
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

        {/* Project Status */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Project Status</h3>
            <p className="text-sm text-gray-500 mt-1">Distribution</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Completed</span>
                  <span className="text-sm font-semibold text-gray-900">{completed}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full"
                    style={{ width: `${myProjects.length ? (completed / myProjects.length) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">In Progress</span>
                  <span className="text-sm font-semibold text-gray-900">{inProgress}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full"
                    style={{ width: `${myProjects.length ? (inProgress / myProjects.length) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Pending</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {myProjects.length - completed - inProgress}
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-2 rounded-full"
                    style={{
                      width: `${myProjects.length ? ((myProjects.length - completed - inProgress) / myProjects.length) * 100 : 0}%`
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Payouts Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-purple-600" />
            Recent Payouts
          </h3>
        </div>
        {recentPaid.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Receipt className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-sm text-gray-600">No payouts yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <th className="px-6 py-4">Project</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentPaid.map((r: any) => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-sm text-gray-900">{r.title}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-sm text-gray-900">
                        ₹{Intl.NumberFormat().format(r.amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {r.date ? new Date(r.date).toLocaleDateString() : '-'}
                      </div>
                    </td>
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
