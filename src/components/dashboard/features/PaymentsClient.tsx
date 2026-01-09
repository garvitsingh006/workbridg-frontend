import { useEffect, useState } from 'react';
import { DollarSign, CreditCard, Receipt, Shield, MoreVertical, AlertCircle, RefreshCw, Clock } from 'lucide-react';
import { usePayment, type Payment } from '../../../contexts/PaymentContext';
import { useUser } from '../../../contexts/UserContext';
import PaymentModal from '../../payment/PaymentModal';
import PaymentStatusBadge from '../../payment/PaymentStatusBadge';
import { toast } from 'react-toastify';

export default function PaymentsClient() {
  const { user } = useUser();
  const { 
    payments, 
    loading, 
    error, 
    fetchUserPayments, 
    createPaymentOrder, 
    verifyPayment, 
    openCashfreeCheckout 
  } = usePayment();
  
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [processingPayment, setProcessingPayment] = useState<string | null>(null);

  useEffect(() => {
    fetchUserPayments();
  }, [fetchUserPayments]);

  const handlePayment = async (payment: Payment) => {
    if (!user) return;
    
    try {
      setProcessingPayment(`${payment._id}-total`);
      
      // Create Cashfree order
      const orderData = await createPaymentOrder(payment._id, 'total');
      
      // Open Cashfree checkout
      openCashfreeCheckout(
        orderData,
        { 
          name: user.fullName, 
          email: user.email,
          phone: user.phone
        },
        async (response) => {
          try {
            // Verify payment
            await verifyPayment(
              payment._id, 
              'total', 
              response.orderId,
              response.paymentSessionId
            );

            // Signature verification can be done here using webhook
            
            // Refresh payments
            await fetchUserPayments();
            
            toast.success('Payment successful! 🎉');
          } catch (error) {
            console.error('Payment verification failed:', error);
            toast.error('Payment verification failed. Please contact support.');
          } finally {
            setProcessingPayment(null);
          }
        },
        (error: any) => {
          console.error('Payment failed:', error);
          toast.error(error.message || 'Payment failed. Please try again.');
          setProcessingPayment(null);
        }
      );
    } catch (error) {
      console.error('Failed to initiate payment:', error);
      toast.error('Failed to initiate payment. Please try again.');
      setProcessingPayment(null);
    }
  };

  const openPaymentModal = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsModalOpen(true);
  };

  const closePaymentModal = () => {
    setSelectedPayment(null);
    setIsModalOpen(false);
  };

  const calculateTotals = () => {
    const totalPaid = payments.reduce((sum, payment) => {
      if (payment.total.status === 'paid') {
        return sum + (payment.totalAmount + payment.platformFee.serviceCharge);
      }
      return sum;
    }, 0);
    
    const totalPending = payments.reduce((sum, payment) => {
      if (payment.total.status === 'created' || payment.total.status === 'failed') {
        return sum + (payment.totalAmount + payment.platformFee.serviceCharge);
      }
      return sum;
    }, 0);
    
    return { totalPaid, totalPending };
  };

  const { totalPaid, totalPending } = calculateTotals();

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
          <h2 className="text-2xl font-bold text-gray-900">Payments</h2>
          <p className="text-sm text-gray-600 mt-1">Manage your project payments</p>
        </div>
        <button 
          onClick={() => fetchUserPayments()}
          className="p-2.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          disabled={loading}
        >
          <RefreshCw className={`w-5 h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-green-500/10 to-transparent rounded-full translate-x-12 -translate-y-12"></div>
          <div className="flex items-start justify-between mb-4 relative z-10">
            <div className="p-3 rounded-xl bg-linear-to-br from-green-500 to-green-600 shadow-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">₹{totalPaid.toLocaleString()}</h3>
          <p className="text-sm text-gray-600 font-medium">Total Paid</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-yellow-500/10 to-transparent rounded-full translate-x-12 -translate-y-12"></div>
          <div className="flex items-start justify-between mb-4 relative z-10">
            <div className="p-3 rounded-xl bg-linear-to-br from-yellow-500 to-yellow-600 shadow-lg">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">₹{totalPending.toLocaleString()}</h3>
          <p className="text-sm text-gray-600 font-medium">Pending</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-blue-500/10 to-transparent rounded-full translate-x-12 -translate-y-12"></div>
          <div className="flex items-start justify-between mb-4 relative z-10">
            <div className="p-3 rounded-xl bg-linear-to-br from-blue-500 to-blue-600 shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">Enabled</h3>
          <p className="text-sm text-gray-600 font-medium">Escrow Protection</p>
        </div>
      </div>

      {/* Project Payments Table */}
      {payments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Receipt className="w-8 h-8 text-blue-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No payments yet</h3>
          <p className="text-gray-600 max-w-md mx-auto">Your payment history will appear here once projects are approved.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-blue-500" />
                Payment History
              </h3>
              <div className="text-sm text-gray-600">
                {payments.length} {payments.length === 1 ? 'payment' : 'payments'}
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <th className="px-6 py-4">Project</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-sm text-gray-900">{payment.projectId?.title || 'Unknown Project'}</div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {new Date(payment.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <PaymentStatusBadge status={payment.total.status} size="sm" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-sm text-gray-900">₹{(payment.totalAmount + payment.platformFee.serviceCharge).toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openPaymentModal(payment)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <MoreVertical className="w-4 h-4 text-gray-500" />
                        </button>
                        {(payment.overallStatus === 'pending' || payment.overallStatus === "failed") && (
                          <button
                            onClick={() => handlePayment(payment)}
                            disabled={processingPayment === `${payment._id}-total`}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                          >
                            {processingPayment === `${payment._id}-total` ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <CreditCard className="w-4 h-4" />
                            )}
                            Pay Now
                          </button>
                        )}
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

