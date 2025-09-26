import { DollarSign, Wallet, Receipt, ArrowDownToLine, ArrowUpRight } from 'lucide-react';
import { useProject } from '../../../contexts/ProjectContext';
import { useUser } from '../../../contexts/UserContext';

export default function EarningsFreelancer() {
  const { projects } = useProject();
  const { user } = useUser();

  const myProjects = projects.filter(p => p.assignees?.some?.((a: any) => (a.id || a._id) === user?.id));

  const totalEarnings = myProjects.reduce((sum, p: any) => sum + (p.payout || 0), 0);
  const pendingClearance = myProjects
    .filter((p: any) => p.status === 'completed' && (p.payoutPending === true || p.payoutStatus === 'pending'))
    .reduce((s, p: any) => s + (p.payout || 0), 0);
  const inEscrow = myProjects
    .filter((p: any) => p.status === 'in-progress' && (p.escrowAmount || 0) > 0)
    .reduce((s, p: any) => s + (p.escrowAmount || 0), 0);

  const recentPayouts = myProjects
    .filter((p: any) => (p.payout || 0) > 0 && p.payoutStatus === 'paid')
    .slice(0, 5)
    .map((p: any) => ({ id: p.id, title: p.title, amount: p.payout, date: p.completedAt || p.updatedAt }));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <DollarSign className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900">Earnings</h2>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard title="Total Earned" value={`$${Intl.NumberFormat().format(totalEarnings)}`} icon={<Wallet className="w-6 h-6 text-green-700" />} bg="bg-green-50" />
        <SummaryCard title="Pending Clearance" value={`$${Intl.NumberFormat().format(pendingClearance)}`} icon={<ArrowUpRight className="w-6 h-6 text-amber-700" />} bg="bg-amber-50" />
        <SummaryCard title="In Escrow" value={`$${Intl.NumberFormat().format(inEscrow)}`} icon={<DollarSign className="w-6 h-6 text-blue-700" />} bg="bg-blue-50" />
      </div>

      {/* Withdraw */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2"><ArrowDownToLine className="w-5 h-5 text-blue-600" /> Withdraw</h3>
          <button className="px-3 py-2 border rounded-lg text-sm hover:bg-gray-50">Manage Methods</button>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="text-sm text-gray-600">Available to withdraw</div>
          <div className="text-2xl font-bold">${Intl.NumberFormat().format(Math.max(0, totalEarnings - pendingClearance))}</div>
          <button className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white">Withdraw</button>
        </div>
      </div>

      {/* Recent payouts */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2"><Receipt className="w-5 h-5 text-blue-600" /> Recent Payouts</h3>
        </div>
        <div className="p-6">
          {recentPayouts.length === 0 ? (
            <p className="text-sm text-gray-600">No payouts yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-left text-gray-500">
                  <tr>
                    <th className="py-2 pr-4">Project</th>
                    <th className="py-2 pr-4">Amount</th>
                    <th className="py-2">Date</th>
                  </tr>
                </thead>
                <tbody className="text-gray-800">
                  {recentPayouts.map((r: any) => (
                    <tr key={r.id} className="border-t">
                      <td className="py-2 pr-4">{r.title}</td>
                      <td className="py-2 pr-4">${Intl.NumberFormat().format(r.amount)}</td>
                      <td className="py-2">{r.date ? new Date(r.date).toLocaleDateString() : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ title, value, icon, bg }: { title: string; value: string; icon: React.ReactNode; bg: string; }) {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${bg}`}>{icon}</div>
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
      <p className="text-gray-600 text-sm">{title}</p>
    </div>
  );
}


