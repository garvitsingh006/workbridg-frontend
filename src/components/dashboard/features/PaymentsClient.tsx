import { DollarSign, CreditCard, Receipt, Shield } from 'lucide-react';

export default function PaymentsClient() {
  const payouts = [
    { id: 'pmt_001', project: 'Landing Page Design', amount: 1200, date: '2025-08-12', status: 'Paid' },
    { id: 'pmt_002', project: 'iOS App Prototype', amount: 2800, date: '2025-08-27', status: 'Processing' },
    { id: 'pmt_003', project: 'SEO Audit', amount: 650, date: '2025-09-03', status: 'Paid' },
  ];

  const total = payouts.reduce((s, p) => s + p.amount, 0);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <DollarSign className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-900">Payments</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="text-xs text-gray-500 mb-1">Total Paid</div>
          <div className="text-xl font-bold">${Intl.NumberFormat().format(total)}</div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="text-xs text-gray-500 mb-1">Last Payment</div>
          <div className="text-xl font-bold">${payouts[0]?.amount || 0}</div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="text-xs text-gray-500 mb-1">Secure Escrow</div>
          <div className="flex items-center gap-2 text-green-700 font-medium text-sm"><Shield className="w-4 h-4" /> Enabled</div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2"><Receipt className="w-4 h-4 text-blue-600" /> Payment History</h3>
          <button className="px-2 py-1 border rounded-lg text-xs hover:bg-gray-50 flex items-center gap-1"><CreditCard className="w-3 h-3" /> Add Payment Method</button>
        </div>
        <div className="p-4">
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead className="text-left text-gray-500">
                <tr>
                  <th className="py-1 pr-3">Project</th>
                  <th className="py-1 pr-3">Amount</th>
                  <th className="py-1 pr-3">Date</th>
                  <th className="py-1">Status</th>
                </tr>
              </thead>
              <tbody className="text-gray-800">
                {payouts.map(p => (
                  <tr key={p.id} className="border-t">
                    <td className="py-1 pr-3">{p.project}</td>
                    <td className="py-1 pr-3">${p.amount}</td>
                    <td className="py-1 pr-3">{p.date}</td>
                    <td className="py-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{p.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}


