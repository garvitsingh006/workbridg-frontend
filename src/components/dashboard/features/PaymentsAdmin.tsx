import { useEffect, useState } from 'react';
import { DollarSign, Shield, Eye, AlertCircle, RefreshCw, Search, Filter } from 'lucide-react';
import { usePayment, type Payment } from '../../../contexts/PaymentContext';
import PaymentModal from '../../payment/PaymentModal';
import PaymentStatusBadge from '../../payment/PaymentStatusBadge';

export default function PaymentsAdmin() {
  const { 
    payments, 
    loading, 
    error, 
    fetchAllPayments, 
    // releasePayment, 
    // refundPayment 
  } = usePayment();
  
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
//   const [processingAction, setProcessingAction] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchAllPayments();
  }, [fetchAllPayments]);

//   const handleReleasePayment = async (payment: Payment) => {
//     if (!confirm(`Are you sure you want to release ₹${payment.releaseAmount.toLocaleString()} to ${payment.freelancerId.fullName}?`)) {
//       return;
//     }

//     try {
//       setProcessingAction(`release-${payment._id}`);
//       await releasePayment(payment._id);
//       await fetchAllPayments(); // Refresh data
//       alert(`Payment of ₹${payment.releaseAmount.toLocaleString()} released successfully!`);
//     } catch (error) {
//       console.error('Failed to release payment:', error);
//       alert('Failed to release payment. Please try again.');
//     } finally {
//       setProcessingAction(null);
//     }
//   };

//   const handleRefundPayment = async (payment: Payment) => {
//     if (!confirm(`Are you sure you want to refund this payment to ${payment.clientId.fullName}?`)) {
//       return;
//     }

//     try {
//       setProcessingAction(`refund-${payment._id}`);
//       await refundPayment(payment._id);
//       await fetchAllPayments(); // Refresh data
//       alert('Payment refunded successfully!');
//     } catch (error) {
//       console.error('Failed to refund payment:', error);
//       alert('Failed to refund payment. Please try again.');
//     } finally {
//       setProcessingAction(null);
//     }
//   };

  const openPaymentModal = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsModalOpen(true);
  };

  const closePaymentModal = () => {
    setSelectedPayment(null);
    setIsModalOpen(false);
  };

  const calculateStats = () => {
    const totalAmount = payments.reduce((sum, payment) => sum + payment.totalAmount, 0);
    const totalPlatformFees = payments.reduce((sum, payment) => {
      return sum + (payment.platformFee?.serviceCharge || 0) + (payment.platformFee?.commissionFee || 0);
    }, 0);
    const totalReleased = payments.reduce((sum, payment) => 
      sum + (payment.releaseStatus === 'released' ? payment.releaseAmount : 0), 0
    );
    const pendingRelease = payments.filter(p => 
      p.total.status === 'paid' && p.releaseStatus === 'not_released'
    ).length;

    return { totalAmount, totalPlatformFees, totalReleased, pendingRelease };
  };

  const filteredPayments = payments.filter(payment => {
    const projectTitle = String(payment.projectId?.title || '').toLowerCase();
    const clientName = String(payment.clientId?.fullName || '').toLowerCase();
    const freelancerName = String(payment.freelancerId?.fullName || '').toLowerCase();
    const q = searchTerm.toLowerCase();
    const matchesSearch = projectTitle.includes(q) || clientName.includes(q) || freelancerName.includes(q);
    
    const matchesStatus = statusFilter === 'all' || payment.overallStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const { totalAmount, totalPlatformFees, totalReleased, pendingRelease } = calculateStats();

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
          <span>Loading payments...</span>
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
            onClick={() => fetchAllPayments()}
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
          <Shield className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Payment Management</h2>
        </div>
        <button 
          onClick={() => fetchAllPayments()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="text-xs text-gray-500 mb-1">Total Volume</div>
          <div className="text-xl font-bold text-blue-600">₹{totalAmount.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="text-xs text-gray-500 mb-1">Platform Fees</div>
          <div className="text-xl font-bold text-green-600">₹{totalPlatformFees.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="text-xs text-gray-500 mb-1">Released</div>
          <div className="text-xl font-bold text-emerald-600">₹{totalReleased.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="text-xs text-gray-500 mb-1">Pending Release</div>
          <div className="text-xl font-bold text-yellow-600">{pendingRelease}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by project, client, or freelancer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="released">Released</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      {filteredPayments.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
          <p className="text-gray-600">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria.' 
              : 'Payment records will appear here as projects are approved.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr className="text-left text-sm text-gray-500">
                  <th className="px-4 py-3">Project</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Freelancer</th>
                  <th className="px-4 py-3">Total Amount</th>
                  <th className="px-4 py-3">Payment Status</th>
                  <th className="px-4 py-3">Release Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPayments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{payment.projectId.title}</div>
                      <div className="text-sm text-gray-500">Created: {formatDate(payment.createdAt)}</div>
                    </td>
                    <td className="px-4 py-3">
                          <div className="text-gray-900">{payment.clientId?.fullName || '—'}</div>
                    </td>
                    <td className="px-4 py-3">
                          <div className="text-gray-900">{payment.freelancerId?.fullName || '—'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold">₹{payment.totalAmount.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">
                        Service Charge: ₹{payment.platformFee.serviceCharge.toLocaleString()}<br/>
                        Commission Fee: ₹{payment.platformFee.commissionFee.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <PaymentStatusBadge status={payment.total.status} size="sm" />
                    </td>
                    <td className="px-4 py-3">
                      <PaymentStatusBadge status={payment.releaseStatus} type="release" size="sm" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {/* {payment.total.status === 'paid' && payment.releaseStatus === 'not_released' && (
                          <button
                            onClick={() => handleReleasePayment(payment)}
                            disabled={processingAction === `release-${payment._id}`}
                            className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-3 py-1 rounded text-sm font-medium transition-colors flex items-center gap-1"
                          >
                            {processingAction === `release-${payment._id}` ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : (
                              <CheckCircle className="w-3 h-3" />
                            )}
                            Release
                          </button>
                        )}
                         */}
                        {/* {payment.releaseStatus === 'not_released' && payment.overallStatus !== 'pending' && (
                          <button
                            onClick={() => handleRefundPayment(payment)}
                            disabled={processingAction === `refund-${payment._id}`}
                            className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-3 py-1 rounded text-sm font-medium transition-colors flex items-center gap-1"
                          >
                            {processingAction === `refund-${payment._id}` ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : (
                              <RotateCcw className="w-3 h-3" />
                            )}
                            Refund
                          </button>
                        )} */}
                        
                        <button
                          onClick={() => openPaymentModal(payment)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
