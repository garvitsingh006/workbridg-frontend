import { useEffect, useState } from 'react';
import { Wallet, Receipt, Clock, CheckCircle, AlertCircle, RefreshCw, MoreVertical, TrendingUp, Download } from 'lucide-react';
import { usePayment, type Payment } from '../../../contexts/PaymentContext';
import PaymentModal from '../../payment/PaymentModal';
import PaymentStatusBadge from '../../payment/PaymentStatusBadge';

export default function EarningsFreelancer() {
  const {
    payments,
    loading,
    error,
    fetchUserPayments
  } = usePayment();

  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchUserPayments();
  }, [fetchUserPayments]);

  const openPaymentModal = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsModalOpen(true);
  };

  const closePaymentModal = () => {
    setSelectedPayment(null);
    setIsModalOpen(false);
  };

  const calculateEarnings = () => {
    const totalEarnings = payments.reduce((sum, payment) => {
      const freelancerAmount = payment.totalAmount - payment.platformFee.commissionFee;
      return sum + freelancerAmount;
    }, 0);

    const releasedEarnings = payments.reduce((sum, payment) => {
      return sum + (payment.releaseStatus === 'released' ? payment.releaseAmount : 0);
    }, 0);

    const pendingEarnings = payments.reduce((sum, payment) => {
      if (payment.total.status === 'paid' && payment.releaseStatus === 'not_released') {
        const freelancerAmount = payment.totalAmount - payment.platformFee.commissionFee;
        return sum + freelancerAmount;
      }
      return sum;
    }, 0);

    const inProgressEarnings = payments.reduce((sum, payment) => {
      if (payment.total.status === 'pending') {
        return sum + (payment.totalAmount - payment.platformFee.commissionFee);
      }
      return sum;
    }, 0);

    return { totalEarnings, releasedEarnings, pendingEarnings, inProgressEarnings };
  };

  const { totalEarnings, releasedEarnings, pendingEarnings } = calculateEarnings();
  
  // Calculate previous month data for percentage changes
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  
  const prevMonthTotalEarnings = payments.reduce((sum, payment) => {
    const freelancerAmount = payment.totalAmount - payment.platformFee.commissionFee;
    const paymentDate = new Date(payment.createdAt);
    if (paymentDate.getMonth() === prevMonth && paymentDate.getFullYear() === prevYear) {
      return sum + freelancerAmount;
    }
    return sum;
  }, 0);
  
  const prevMonthReleasedEarnings = payments.reduce((sum, payment) => {
    if (payment.releaseStatus === 'released') {
      const releaseDate = new Date(payment.updatedAt);
      if (releaseDate.getMonth() === prevMonth && releaseDate.getFullYear() === prevYear) {
        return sum + payment.releaseAmount;
      }
    }
    return sum;
  }, 0);
  
  const calculatePercentage = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? '+100%' : '0%';
    const change = ((current - previous) / previous) * 100;
    return change >= 0 ? `+${Math.round(change)}%` : `${Math.round(change)}%`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading && payments.length === 0) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="flex items-center gap-2 text-gray-600">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Loading earnings...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-800">{error}</span>
          <button
            onClick={() => fetchUserPayments()}
            className="ml-auto px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Earnings</h2>
          <p className="text-sm text-gray-600 mt-1">Track your income and payouts</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchUserPayments()}
            className="p-2.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            <RefreshCw className={`w-5 h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-linear-to-r from-[#f72585] to-[#f72585] text-white rounded-lg hover:from-[#f72585] hover:to-[#f72585] transition-all font-medium text-sm shadow-lg shadow-[#f72585]/30">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-[#f72585]/10 to-transparent rounded-full translate-x-12 -translate-y-12"></div>
          <div className="flex items-start justify-between mb-4 relative z-10">
            <div className="p-3 rounded-xl bg-linear-to-br from-[#f72585] to-[#f72585] shadow-lg">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded-lg">
              <TrendingUp className="w-3 h-3 text-green-600" />
              <span className="text-xs font-semibold text-green-600">{calculatePercentage(totalEarnings, prevMonthTotalEarnings)}</span>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">₹{totalEarnings.toLocaleString()}</h3>
          <p className="text-sm text-gray-600 font-medium">Total Expected</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-green-500/10 to-transparent rounded-full translate-x-12 -translate-y-12"></div>
          <div className="flex items-start justify-between mb-4 relative z-10">
            <div className="p-3 rounded-xl bg-linear-to-br from-green-500 to-green-600 shadow-lg">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded-lg">
              <TrendingUp className="w-3 h-3 text-green-600" />
              <span className="text-xs font-semibold text-green-600">{calculatePercentage(releasedEarnings, prevMonthReleasedEarnings)}</span>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">₹{releasedEarnings.toLocaleString()}</h3>
          <p className="text-sm text-gray-600 font-medium">Released</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-yellow-500/10 to-transparent rounded-full translate-x-12 -translate-y-12"></div>
          <div className="flex items-start justify-between mb-4 relative z-10">
            <div className="p-3 rounded-xl bg-linear-to-br from-yellow-500 to-yellow-600 shadow-lg">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-lg">
              <Clock className="w-3 h-3 text-blue-600" />
              <span className="text-xs font-semibold text-blue-600">Pending</span>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">₹{pendingEarnings.toLocaleString()}</h3>
          <p className="text-sm text-gray-600 font-medium">Pending Release</p>
        </div>
      </div>

      {/* Project Payments Table */}
      {payments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-[#f72585]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Receipt className="w-8 h-8 text-[#f72585]" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No earnings yet</h3>
          <p className="text-gray-600 max-w-md mx-auto">Your earnings will appear here once you start working on projects.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-[#f72585]" />
                Project Earnings
              </h3>
              <div className="text-sm text-gray-600">
                {payments.length} {payments.length === 1 ? 'project' : 'projects'}
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <th className="px-6 py-4">Project</th>
                  <th className="px-6 py-4">Payment Status</th>
                  <th className="px-6 py-4">Release Status</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payments.map((payment) => {
                  const freelancerAmount = payment.totalAmount - payment.platformFee.commissionFee;

                  return (
                    <tr key={payment._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-sm text-gray-900">{payment.projectId?.title || (payment.isSubscriptionPayment ? 'Premium Subscription' : 'Unknown Project')}</div>
                          {payment.isAdminManagementFee ? (
                            <div className="text-xs text-orange-600 mt-0.5 font-medium">
                              Admin Management Service Charge
                            </div>
                          ) : payment.isSubscriptionPayment ? (
                            <div className="text-xs text-yellow-600 mt-0.5 font-medium">
                              Premium Subscription
                            </div>
                          ) : (
                            <div className="text-xs text-gray-500 mt-0.5">
                              Project: ₹{payment.totalAmount.toLocaleString()} - Fee: ₹{payment.platformFee.commissionFee.toLocaleString()}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <PaymentStatusBadge status={payment.total.status} size="sm" />
                      </td>
                      <td className="px-6 py-4">
                        {payment.isSubscriptionPayment ? (
                          <span className="text-sm text-gray-400">N/A</span>
                        ) : (
                          <div className="space-y-1">
                            <PaymentStatusBadge status={payment.releaseStatus} type="release" size="sm" />
                            {payment.releaseStatus === 'released' && (
                              <div className="text-xs text-green-600">
                                Released: {formatDate(payment.updatedAt)}
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-sm text-gray-900">
                          {payment.isAdminManagementFee ? (
                            <span className="text-orange-600">₹{payment.totalAmount.toLocaleString()}</span>
                          ) : (
                            `₹${freelancerAmount.toLocaleString()}`
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => openPaymentModal(payment)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <MoreVertical className="w-4 h-4 text-gray-500" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t border-gray-100 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing 1 to {payments.length} of {payments.length} results
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                Previous
              </button>
              <button className="px-3 py-1.5 bg-[#f72585] text-white rounded-lg hover:bg-[#f72585]/90 transition-colors text-sm">
                1
              </button>
              <button className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                Next
              </button>
            </div>
          </div>
        </div>
      )}



      {/* Payment Modal */}
      {selectedPayment && (
        <PaymentModal
          payment={selectedPayment}
          isOpen={isModalOpen}
          onClose={closePaymentModal}
        />
      )}
    </div>
  );
}
