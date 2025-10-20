import { useEffect, useState } from 'react';
import { DollarSign, Wallet, Receipt, Clock, CheckCircle, AlertCircle, RefreshCw, MoreVertical } from 'lucide-react';
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
      // Freelancer gets: totalAmount - commissionFee
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading && payments.length === 0) {
    return (
      <div className="p-4 flex items-center justify-center h-64">
        <div className="flex items-center gap-2 text-gray-600">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Loading earnings...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
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
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Earnings</h2>
        </div>
        <button 
          onClick={() => fetchUserPayments()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <SummaryCard 
          title="Total Expected" 
          value={`₹${totalEarnings.toLocaleString()}`} 
          icon={<Wallet className="w-6 h-6 text-blue-700" />} 
          bg="bg-blue-50" 
        />
        <SummaryCard 
          title="Released" 
          value={`₹${releasedEarnings.toLocaleString()}`} 
          icon={<CheckCircle className="w-6 h-6 text-green-700" />} 
          bg="bg-green-50" 
        />
        <SummaryCard 
          title="Pending Release" 
          value={`₹${pendingEarnings.toLocaleString()}`} 
          icon={<Clock className="w-6 h-6 text-yellow-700" />} 
          bg="bg-yellow-50" 
        />
      </div>

      {/* Project Payments Table */}
      {payments.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No earnings yet</h3>
          <p className="text-gray-600">Your earnings will appear here once you start working on projects.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-blue-600" /> 
              Project Earnings
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr className="text-left text-sm text-gray-500">
                  <th className="px-4 py-3">Project</th>
                  <th className="px-4 py-3">Payment Status</th>
                  <th className="px-4 py-3">Release Status</th>
                  <th className="px-4 py-3">More Info</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payments.map((payment) => {
                  const freelancerAmount = payment.totalAmount - payment.platformFee.commissionFee;
                  
                  return (
                    <tr key={payment._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium text-gray-900">{payment.projectId.title}</div>
                          <div className="text-sm text-gray-600">
                            <div>Final Amount: ₹{freelancerAmount.toLocaleString()}</div>
                            <div className="text-xs text-gray-500">
                              Project: ₹{payment.totalAmount.toLocaleString()} - Commission Fee (8%): ₹{payment.platformFee.commissionFee.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <PaymentStatusBadge status={payment.total.status} size="sm" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <PaymentStatusBadge status={payment.releaseStatus} type="release" size="sm" />
                          {payment.releaseStatus === 'released' && (
                            <div className="text-xs text-green-600">
                              Released: {formatDate(payment.updatedAt)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
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
        </div>
      )}

      {/* Status Timeline */}
      {payments.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Payment Status Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">{payments.length}</div>
              <div className="text-sm text-gray-600">Total Projects</div>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {payments.filter(p => p.total.status === 'pending').length}
              </div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {payments.filter(p => p.total.status === 'paid' && p.releaseStatus === 'not_released').length}
              </div>
              <div className="text-sm text-gray-600">Awaiting Release</div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {payments.filter(p => p.releaseStatus === 'released').length}
              </div>
              <div className="text-sm text-gray-600">Released</div>
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

function SummaryCard({ title, value, icon, bg }: { title: string; value: string; icon: React.ReactNode; bg: string; }) {
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg ${bg}`}>{icon}</div>
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-1">{value}</h3>
      <p className="text-gray-600 text-xs">{title}</p>
    </div>
  );
}


