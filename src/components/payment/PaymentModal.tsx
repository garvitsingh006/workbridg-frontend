import { X, Calendar, CreditCard, User, Building, DollarSign, Shield, HelpCircle } from 'lucide-react';
import type { Payment } from '../../contexts/PaymentContext';
import { useUser } from '../../contexts/UserContext';

interface PaymentModalProps {
    payment: Payment;
    isOpen: boolean;
    onClose: () => void;
}

export default function PaymentModal({ payment, isOpen, onClose }: PaymentModalProps) {
    const { user } = useUser();
    if (!isOpen) return null;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'failed':
                return 'bg-red-100 text-red-800';
            case 'created':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getReleaseStatusColor = (status: string) => {
        switch (status) {
            case 'released':
                return 'bg-green-100 text-green-800';
            case 'not_released':
                return 'bg-yellow-100 text-yellow-800';
            case 'refunded':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col">
                {/* Fixed Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 shrink-0">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-blue-600" />
                        Payment Details
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="p-6 space-y-6 overflow-y-auto flex-1" style={{scrollBehavior: 'smooth'}}>
                    {/* Project & Users Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {payment.isSubscriptionPayment ? (
                            <div className="space-y-3 col-span-2">
                                <div className="flex items-center gap-2">
                                    <Building className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm font-medium text-gray-700">Subscription</span>
                                </div>
                                <p className="text-gray-900 font-medium">Premium Subscription — ₹299/month</p>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Building className="w-4 h-4 text-gray-500" />
                                        <span className="text-sm font-medium text-gray-700">Project</span>
                                    </div>
                                    <p className="text-gray-900 font-medium">{payment.projectId?.title || 'N/A'}</p>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <User className="w-4 h-4 text-gray-500" />
                                        <span className="text-sm font-medium text-gray-700">Client</span>
                                    </div>
                                    <p className="text-gray-900">{payment.clientId?.fullName || 'N/A'}</p>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {!payment.isSubscriptionPayment && (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm font-medium text-gray-700">Freelancer</span>
                                </div>
                                <p className="text-gray-900">{payment.freelancerId?.fullName || 'N/A'}</p>
                            </div>
                        )}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-gray-500" />
                                <span className="text-sm font-medium text-gray-700">Payment ID</span>
                            </div>
                            <p className="text-gray-900 font-mono text-sm">{payment._id}</p>
                        </div>
                    </div>

                    {/* Financial Breakdown */}
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                        <h3 className="font-medium text-gray-900 flex items-center gap-2">
                            <DollarSign className="w-4 h-4" />
                            {payment.isSubscriptionPayment ? 'Subscription Details' : payment.isAdminManagementFee ? 'Admin Management Fee' : 'Financial Breakdown'}
                        </h3>
                        {payment.isSubscriptionPayment ? (
                            <div className="text-center">
                                <div className="text-sm text-gray-600 mb-1">Premium Subscription (Monthly)</div>
                                <div className="text-2xl font-bold text-yellow-600">₹299</div>
                                <div className="text-xs text-gray-500 mt-1">Unlocks 50 applications/week</div>
                            </div>
                        ) : payment.isAdminManagementFee ? (
                            // Admin Management Fee - Simple display
                            <div className="text-center">
                                <div className="text-sm text-gray-600 mb-1">Admin Management Fee (5%)</div>
                                <div className="text-2xl font-bold text-blue-600">₹{payment.totalAmount.toLocaleString()}</div>
                                <div className="text-xs text-gray-500 mt-1">{payment.description}</div>
                            </div>
                        ) : (
                            // Regular payment breakdown
                            user?.userType === 'client' ? (
                                // Client view - show only client-side information
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-600">Project Amount:</span>
                                        <p className="font-semibold text-lg">₹{payment.totalAmount.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Service Charge ({payment.platformFee.serviceCharge > 0 ? '5%' : '0%'}):</span>
                                        <p className="font-semibold text-lg text-red-600">₹{payment.platformFee.serviceCharge.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Total You Pay:</span>
                                        <p className="font-semibold text-lg text-blue-600">
                                            ₹{(payment.totalAmount + payment.platformFee.serviceCharge).toLocaleString()}
                                        </p>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-1">
                                            <span className="text-gray-600">Freelancer Receives:</span>
                                            <div className="relative group">
                                                <HelpCircle className="w-3 h-3 text-gray-400 cursor-help" />
                                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                                                    10% commission fee is deducted from the total amount
                                                </div>
                                            </div>
                                        </div>
                                        <p className="font-semibold text-lg text-green-600">
                                            ₹{(payment.totalAmount - payment.platformFee.commissionFee).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                // Freelancer/Admin view - show detailed breakdown
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-600">Project Amount:</span>
                                        <p className="font-semibold text-lg">₹{payment.totalAmount.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-1">
                                            <span className="text-gray-600">Service Charge ({payment.platformFee.serviceCharge > 0 ? '5%' : '0%'}):</span>
                                            <div className="relative group">
                                                <HelpCircle className="w-3 h-3 text-gray-400 cursor-help" />
                                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                                                    From Client
                                                </div>
                                            </div>
                                        </div>
                                        <p className="font-semibold text-lg text-red-600">₹{payment.platformFee.serviceCharge.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-1">
                                            <span className="text-gray-600">Commission Fee (10%):</span>
                                            <div className="relative group">
                                                <HelpCircle className="w-3 h-3 text-gray-400 cursor-help" />
                                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                                                    From Freelancer
                                                </div>
                                            </div>
                                        </div>
                                        <p className="font-semibold text-lg text-orange-600">₹{payment.platformFee.commissionFee.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Freelancer Final Amount:</span>
                                        <p className="font-semibold text-lg text-green-600">
                                            ₹{(payment.totalAmount - payment.platformFee.commissionFee).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            )
                        )}
                        
                        {payment.releaseAmount > 0 && (
                            <div className="grid grid-cols-1 gap-2 text-sm mt-4">
                                <div>
                                    <span className="text-gray-600">Release Amount:</span>
                                    <p className="font-semibold text-lg text-blue-600">
                                        ₹{payment.releaseAmount.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Payment Information */}
                    <div className="space-y-4">
                        <h3 className="font-medium text-gray-900">Payment Information</h3>
                        
                        {/* Total Payment */}
                        <div className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="font-medium text-gray-900">Total Payment</h4>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.total.status)}`}>
                                    {payment.total.status}
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-600">Amount:</span>
                                    <p className="font-semibold">₹{payment.isAdminManagementFee ? payment.totalAmount.toLocaleString() : (payment.totalAmount + payment.platformFee.serviceCharge).toLocaleString()}</p>
                                </div>
                                {payment.total.orderId && (
                                    <div>
                                        <span className="text-gray-600">Order ID:</span>
                                        <p className="font-mono text-xs">{payment.total.orderId}</p>
                                    </div>
                                )}
                                {payment.total.paymentId && (
                                    <div className="col-span-2">
                                        <span className="text-gray-600">Payment ID:</span>
                                        <p className="font-mono text-xs">{payment.total.paymentId}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Status Information */}
                    <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                        <h3 className="font-medium text-gray-900 flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            Status Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <span className="text-sm text-gray-600">Overall Status:</span>
                                <p className={`inline-block ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.overallStatus)}`}>
                                    {payment.overallStatus.replace('_', ' ')}
                                </p>
                            </div>
                            {!payment.isSubscriptionPayment && (
                                <div>
                                    <span className="text-sm text-gray-600">Release Status:</span>
                                    <p className={`inline-block ml-2 px-2 py-1 rounded-full text-xs font-medium ${getReleaseStatusColor(payment.releaseStatus)}`}>
                                        {payment.releaseStatus.replace('_', ' ')}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Timestamps */}
                    <div className="border-t border-gray-200 pt-4 space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>Created: {formatDate(payment.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>Last Updated: {formatDate(payment.updatedAt)}</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 p-6">
                    <button
                        onClick={onClose}
                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors cursor-pointer"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
