import { useEffect, useState } from 'react';
import { DollarSign, CreditCard, Receipt, Shield, MoreVertical, AlertCircle, RefreshCw, Clock } from 'lucide-react';
import { usePayment, type Payment } from '../../../contexts/PaymentContext';
import { useUser } from '../../../contexts/UserContext';
import PaymentModal from '../../payment/PaymentModal';
import PaymentStatusBadge from '../../payment/PaymentStatusBadge';
import { toast } from 'react-toastify';
import api from '../../../api';

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

  const [showUpiModal, setShowUpiModal] = useState(false);
  const [upiData, setUpiData] = useState<{link: string, amount: number, upiId: string, upiLink: string} | null>(null);

  const handlePayment = async (payment: Payment) => {
    if (!user) return;
    
    try {
      setProcessingPayment(`${payment._id}-total`);
      
      // Check if it's a UPI payment (admin management fee)
      if (payment.total.paymentType === 'upi') {
        // Generate UPI deeplink using the api instance
        const response = await api.get(`/upi/${payment._id}/upi-link`);
        const data = response.data;
        
        if (data.success) {
          // Show UPI modal instead of redirecting
          setUpiData(data.data);
          setShowUpiModal(true);
          toast.success('UPI payment details loaded. Scan QR code or use the link to pay.');
        } else {
          throw new Error(data.message);
        }
      } else {
        // Original Cashfree payment logic
        const orderData = await createPaymentOrder(payment._id, 'total');
        
        openCashfreeCheckout(
          orderData,
          { 
            name: user.fullName, 
            email: user.email,
            phone: user.phone
          },
          async (response) => {
            try {
              await verifyPayment(
                payment._id, 
                'total', 
                response.orderId,
                response.paymentSessionId
              );
              
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
      }
    } catch (error) {
      console.error('Failed to initiate payment:', error);
      toast.error('Failed to initiate payment. Please try again.');
    } finally {
      setProcessingPayment(null);
    }
  };

  const handleMarkAsPaid = async (paymentId: string) => {
    try {
      const response = await api.patch(`/upi/${paymentId}/mark-paid`);
      const data = response.data;
      
      if (data.success) {
        toast.success('Payment marked as paid successfully!');
        await fetchUserPayments();
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Failed to mark payment as paid');
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
        return sum + (payment.isAdminManagementFee ? payment.totalAmount : payment.totalAmount + payment.platformFee.serviceCharge);
      }
      return sum;
    }, 0);
    
    const totalPending = payments.reduce((sum, payment) => {
      if (payment.total.status === 'created' || payment.total.status === 'failed') {
        return sum + (payment.isAdminManagementFee ? payment.totalAmount : payment.totalAmount + payment.platformFee.serviceCharge);
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
                        <div className="font-medium text-sm text-gray-900">
                          {payment.isAdminManagementFee && payment.moderationId 
                            ? payment.moderationId 
                            : (payment.projectId?.title || 'Unknown Project')
                          }
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {new Date(payment.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <PaymentStatusBadge status={payment.total.status} size="sm" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-sm text-gray-900">₹{(payment.isAdminManagementFee ? payment.totalAmount : payment.totalAmount + payment.platformFee.serviceCharge).toLocaleString()}</div>
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
                          <>
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
                              Pay
                            </button>
                            {payment.total.paymentType === 'upi' && (
                              <button
                                onClick={() => handleMarkAsPaid(payment._id)}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                              >
                                I have paid
                              </button>
                            )}
                          </>
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

      {/* UPI Payment Modal */}
      {showUpiModal && upiData && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowUpiModal(false)}
        >
          <div 
            className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl transform transition-all duration-300 ease-out scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4">UPI Payment</h3>
            <div className="text-center mb-4">
              <div className="mb-4">
                <div className="text-2xl font-bold text-green-600 mb-2">₹{upiData.amount.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Pay to: {upiData.upiId}</div>
              </div>
              
              {/* QR Code */}
              <div className="mb-4 flex justify-center">
                <div className="p-4 bg-white border-2 border-gray-200 rounded-lg">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiData.upiLink)}`}
                    alt="UPI QR Code"
                    className="w-48 h-48"
                  />
                </div>
              </div>
              
              {/* UPI Link */}
              <div className="mb-4">
                <div className="text-xs text-gray-500 mb-2">Or click the link below:</div>
                <a 
                  href={upiData.upiLink}
                  className="text-blue-600 hover:text-blue-800 text-sm break-all"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open UPI App
                </a>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowUpiModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(upiData.upiLink);
                  toast.success('UPI link copied to clipboard!');
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Copy Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

