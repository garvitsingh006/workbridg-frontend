import { useEffect, useState } from 'react';
import { DollarSign, CreditCard, Receipt, Shield, MoreVertical, AlertCircle, RefreshCw } from 'lucide-react';
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
      if (payment.total.status === 'pending') {
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
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Payments</h2>
        </div>
        <button 
          onClick={() => fetchUserPayments()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="text-xs text-gray-500 mb-1">Total Paid</div>
          <div className="text-xl font-bold text-green-600">₹{totalPaid.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="text-xs text-gray-500 mb-1">Pending Payments</div>
          <div className="text-xl font-bold text-yellow-600">₹{totalPending.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="text-xs text-gray-500 mb-1">Secure Escrow</div>
          <div className="flex items-center gap-2 text-green-700 font-medium text-sm">
            <Shield className="w-4 h-4" /> Enabled
          </div>
        </div>
      </div>

      {/* Payments Table */}
      {payments.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No payments yet</h3>
          <p className="text-gray-600">Your payment history will appear here once projects are approved.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {payments.map((payment) => (
            <div key={payment._id} className="bg-white rounded-lg border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{payment.projectId?.title || 'Unknown Project'}</h3>
                    <p className="text-sm text-gray-600">
                      Project: ₹{payment.totalAmount.toLocaleString()} + Service Charge (5%): ₹{payment.platformFee.serviceCharge.toLocaleString()} = Total: ₹{(payment.totalAmount + payment.platformFee.serviceCharge).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <PaymentStatusBadge status={payment.overallStatus} type="overall" />
                    <button
                      onClick={() => openPaymentModal(payment)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <MoreVertical className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="text-left text-sm text-gray-500">
                        <th className="pb-2">Payment Type</th>
                        <th className="pb-2">Amount</th>
                        <th className="pb-2">Status</th>
                        <th className="pb-2">Action</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      <tr className="border-t border-gray-100">
                        <td className="py-3">Total Payment</td>
                        <td className="py-3 font-semibold">₹{(payment.totalAmount + payment.platformFee.serviceCharge).toLocaleString()}</td>
                        <td className="py-3">
                          <PaymentStatusBadge status={payment.total.status} />
                        </td>
                        <td className="py-3">
                          {(payment.overallStatus === 'pending' || payment.overallStatus === "failed") ? (
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
                          ) : (
                            <span className="text-green-600 font-medium flex items-center gap-1">
                              <Shield className="w-4 h-4" />
                              Paid
                            </span>
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))}
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

