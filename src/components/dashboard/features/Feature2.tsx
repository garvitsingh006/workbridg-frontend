import { DollarSign, TrendingUp, Calendar, Download, CreditCard } from 'lucide-react';

export default function Feature2() {
  const earningsData = {
    totalEarnings: 12450,
    thisMonth: 3200,
    lastMonth: 2800,
    pendingPayments: 1500,
  };

  const recentTransactions = [
    {
      id: 1,
      project: 'E-commerce Website Redesign',
      client: 'Tech Solutions Inc.',
      amount: 2500,
      date: '2024-01-28',
      status: 'Completed',
    },
    {
      id: 2,
      project: 'Mobile App UI/UX Design',
      client: 'StartupXYZ',
      amount: 1800,
      date: '2024-01-25',
      status: 'Pending',
    },
    {
      id: 3,
      project: 'Brand Identity Package',
      client: 'Local Business',
      amount: 1200,
      date: '2024-01-20',
      status: 'Completed',
    },
    {
      id: 4,
      project: 'Website Development',
      client: 'Creative Agency',
      amount: 3500,
      date: '2024-01-15',
      status: 'Completed',
    },
  ];

  const monthlyEarnings = [
    { month: 'Jan', amount: 3200 },
    { month: 'Dec', amount: 2800 },
    { month: 'Nov', amount: 2400 },
    { month: 'Oct', amount: 2900 },
    { month: 'Sep', amount: 2100 },
    { month: 'Aug', amount: 2600 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Earnings</h2>
          <p className="text-gray-600">Track your income and payment history</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <CreditCard className="w-4 h-4" />
            <span>Withdraw</span>
          </button>
        </div>
      </div>

      {/* Earnings Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-sm font-medium text-green-600">+12%</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            ${earningsData.totalEarnings.toLocaleString()}
          </h3>
          <p className="text-gray-600 text-sm">Total Earnings</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-blue-600">+14%</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            ${earningsData.thisMonth.toLocaleString()}
          </h3>
          <p className="text-gray-600 text-sm">This Month</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">Last Month</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            ${earningsData.lastMonth.toLocaleString()}
          </h3>
          <p className="text-gray-600 text-sm">Previous Period</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <CreditCard className="w-6 h-6 text-yellow-600" />
            </div>
            <span className="text-sm font-medium text-yellow-600">Pending</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            ${earningsData.pendingPayments.toLocaleString()}
          </h3>
          <p className="text-gray-600 text-sm">Pending Payments</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Earnings Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Monthly Earnings</h3>
          <div className="space-y-4">
            {monthlyEarnings.map((month, index) => (
              <div key={month.month} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{month.month}</span>
                <div className="flex items-center space-x-3 flex-1 mx-4">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${(month.amount / 4000) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-16 text-right">
                    ${month.amount.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View All
              </button>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{transaction.project}</h4>
                  <p className="text-sm text-gray-600">{transaction.client}</p>
                  <p className="text-xs text-gray-500">{transaction.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">${transaction.amount.toLocaleString()}</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                    {transaction.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Bank Transfer</h4>
                <p className="text-sm text-gray-600">****1234</p>
              </div>
            </div>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">PayPal</h4>
                <p className="text-sm text-gray-600">john@example.com</p>
              </div>
            </div>
          </div>
          <button className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 hover:bg-blue-50 transition-colors text-center">
            <div className="text-gray-600">
              <span className="text-2xl">+</span>
              <p className="text-sm mt-1">Add Payment Method</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}