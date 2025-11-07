import React, { createContext, useContext, useState, useCallback } from "react";
import type { ReactNode } from "react";
import api from "../api";

declare global {
    interface Window {
        Cashfree: any; // You can replace 'any' with more specific type if available
    }
}

// Types for Payment Context
export interface PaymentStage {
    orderId?: string;
    paymentId?: string;
    signature?: string;
    amount: number;
    status: "pending" | "created" | "paid" | "failed";
}

export interface Payment {
    _id: string;
    projectId: {
        _id: string;
        title: string;
    };
    clientId: {
        _id: string;
        fullName: string;
    };
    freelancerId: {
        _id: string;
        fullName: string;
    };
    totalAmount: number;
    platformFee: {
        serviceCharge: number;
        commissionFee: number;
    };
    total: PaymentStage;
    releaseAmount: number;
    releaseStatus: "not_released" | "released" | "refunded";
    overallStatus:
        | "pending"
        | "advance_paid"
        | "final_paid"
        | "released"
        | "refunded";
    createdAt: string;
    updatedAt: string;
}

export interface CashfreeResponse {
    orderId: string;
    paymentSessionId: string;
    orderToken: string;
    amount: number;
    currency: string;
}

export interface CreateOrderResponse {
    orderId: string;
    orderToken: string;
    paymentSessionId: string;
    amount: number;
    currency: string;
    paymentType: "total";
}

interface PaymentContextType {
    payments: Payment[];
    loading: boolean;
    error: string | null;

    // Payment operations
    fetchPaymentByProject: (projectId: string) => Promise<Payment | null>;
    fetchPaymentById: (paymentId: string) => Promise<Payment | null>;
    fetchUserPayments: () => Promise<Payment[]>;
    fetchAllPayments: () => Promise<Payment[]>; // Admin only

    // Payment processing
    createPaymentOrder: (
        paymentId: string,
        paymentType: "total"
    ) => Promise<CreateOrderResponse>;
    verifyPayment: (
        paymentId: string,
        paymentType: "total",
        cashfreeOrderId: string,
        cashfreeSignature?: string
    ) => Promise<Payment>;

    // Admin operations
    createPaymentRecord: (
        projectId: string,
        totalAmount: number,
        clientPlatformFeePercentage?: number
    ) => Promise<Payment>;
    releasePayment: (paymentId: string) => Promise<Payment>;
    refundPayment: (paymentId: string) => Promise<Payment>;

    // Cashfree integration
    openCashfreeCheckout: (
        orderData: CreateOrderResponse,
        userDetails: { name: string; email: string; phone?: string },
        onSuccess: (response: {
            orderId: string;
            paymentSessionId: string;
        }) => void,
        onError?: (error: any) => void
    ) => void;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export const usePayment = () => {
    const context = useContext(PaymentContext);
    if (context === undefined) {
        throw new Error("usePayment must be used within a PaymentProvider");
    }
    return context;
};

interface PaymentProviderProps {
    children: ReactNode;
}

export const PaymentProvider: React.FC<PaymentProviderProps> = ({
    children,
}) => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleError = (err: any, context: string) => {
        const message =
            err.response?.data?.message ||
            err.message ||
            `Failed to ${context}`;
        setError(message);
        console.error(`Payment error [${context}]:`, err);
        throw new Error(message);
    };

    const fetchPaymentByProject = useCallback(
        async (projectId: string): Promise<Payment | null> => {
            try {
                setLoading(true);
                setError(null);

                const response = await api.get(
                    `/payments/project/${projectId}`
                );

                if (response.data.success) {
                    return response.data.data;
                }
                return null;
            } catch (err: any) {
                if (err.response?.status === 404) {
                    return null; // No payment record found yet
                }
                handleError(err, "fetch payment by project");
                return null;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    const fetchPaymentById = useCallback(
        async (paymentId: string): Promise<Payment | null> => {
            try {
                setLoading(true);
                setError(null);

                const response = await api.get(`/payments/${paymentId}`);

                if (response.data.success) {
                    return response.data.data;
                }
                return null;
            } catch (err: any) {
                handleError(err, "fetch payment by ID");
                return null;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    const fetchUserPayments = useCallback(async (): Promise<Payment[]> => {
        try {
            setLoading(true);
            setError(null);

            const response = await api.get("/payments/user/my-payments");

            if (response.data.success) {
                const userPayments = response.data.data;
                setPayments(userPayments);
                return userPayments;
            }
            return [];
        } catch (err: any) {
            handleError(err, "fetch user payments");
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchAllPayments = useCallback(async (): Promise<Payment[]> => {
        try {
            setLoading(true);
            setError(null);

            const response = await api.get("/payments/admin/all");

            if (response.data.success) {
                const allPayments = response.data.data;
                setPayments(allPayments);
                return allPayments;
            }
            return [];
        } catch (err: any) {
            handleError(err, "fetch all payments");
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const createPaymentOrder = useCallback(
        async (
            paymentId: string,
            _paymentType: "total"
        ): Promise<CreateOrderResponse> => {
            try {
                setLoading(true);
                setError(null);

                const response = await api.post("/payments/create-order", {
                    paymentId,
                });

                if (response.data.success) {
                    return {
                        orderId: response.data.data.orderId,
                        orderToken: response.data.data.orderToken,
                        paymentSessionId: response.data.data.paymentSessionId,
                        amount: response.data.data.amount,
                        currency: response.data.data.currency || "INR",
                        paymentType: "total",
                    };
                }
                throw new Error(response.data.message);
            } catch (err: any) {
                handleError(err, "create payment order");
                throw err;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    const verifyPayment = useCallback(
        async (
            paymentId: string,
            _paymentType: "total",
            cashfreeOrderId: string,
            cashfreeSignature?: string
        ): Promise<Payment> => {
            try {
                setLoading(true);
                setError(null);

                const response = await api.post("/payments/verify-payment", {
                    paymentId,
                    cashfreeOrderId,
                    cashfreeSignature,
                });

                if (response.data.success) {
                    const updatedPayment = response.data.data;

                    // Update payments in state
                    setPayments((prev) =>
                        prev.map((p) =>
                            p._id === updatedPayment._id ? updatedPayment : p
                        )
                    );

                    return updatedPayment;
                }
                throw new Error(response.data.message);
            } catch (err: any) {
                handleError(err, "verify payment");
                throw err;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    const createPaymentRecord = useCallback(
        async (
            projectId: string,
            totalAmount: number,
            clientPlatformFeePercentage: number = 5
        ): Promise<Payment> => {
            try {
                setLoading(true);
                setError(null);

                const response = await api.post("/payments/create-record", {
                    projectId,
                    totalAmount,
                    clientPlatformFeePercentage,
                });

                if (response.data.success) {
                    const newPayment = response.data.data;

                    // Add new payment to state
                    setPayments((prev) => [...prev, newPayment]);

                    return newPayment;
                }
                throw new Error(response.data.message);
            } catch (err: any) {
                handleError(err, "create payment record");
                throw err;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    const releasePayment = useCallback(
        async (paymentId: string): Promise<Payment> => {
            try {
                setLoading(true);
                setError(null);

                const response = await api.post("/payments/release", {
                    paymentId,
                });

                if (response.data.success) {
                    const updatedPayment = response.data.data;

                    // Update payments in state
                    setPayments((prev) =>
                        prev.map((p) =>
                            p._id === updatedPayment._id ? updatedPayment : p
                        )
                    );

                    return updatedPayment;
                }
                throw new Error(response.data.message);
            } catch (err: any) {
                handleError(err, "release payment");
                throw err;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    const refundPayment = useCallback(
        async (paymentId: string): Promise<Payment> => {
            try {
                setLoading(true);
                setError(null);

                const response = await api.post("/payments/refund", {
                    paymentId,
                });

                if (response.data.success) {
                    const updatedPayment = response.data.data;

                    // Update payments in state
                    setPayments((prev) =>
                        prev.map((p) =>
                            p._id === updatedPayment._id ? updatedPayment : p
                        )
                    );

                    return updatedPayment;
                }
                throw new Error(response.data.message);
            } catch (err: any) {
                handleError(err, "refund payment");
                throw err;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    const openCashfreeCheckout = useCallback(
        (
            orderData: CreateOrderResponse,
            _userDetails: { name: string; email: string; phone?: string },
            onSuccess: (response: {
                orderId: string;
                paymentSessionId: string;
            }) => void,
            onError?: (error: any) => void
        ) => {
            const loadScript = (src: string) => {
                return new Promise((resolve) => {
                    const script = document.createElement("script");
                    script.src = src;
                    script.onload = () => {
                        console.log("Cashfree script loaded");
                        resolve(true);
                    };
                    script.onerror = () => {
                        console.error("Failed to load Cashfree script");
                        resolve(false);
                    };
                    document.body.appendChild(script);
                });
            };

            const initializePayment = async () => {
                try {
                    if (!window.Cashfree) {
                        const scriptLoaded = await loadScript(
                            "https://sdk.cashfree.com/js/v3/cashfree.js"
                        );
                        if (!scriptLoaded)
                            throw new Error("Failed to load Cashfree script");
                    }

                    const cashfree = window.Cashfree({
                        mode:
                            import.meta.env.VITE_CASHFREE_ENV === "PRODUCTION"
                                ? "production"
                                : "sandbox",
                    });

                    const paymentOptions = {
                        paymentSessionId: orderData.paymentSessionId,
                        redirectTarget: "_modal", // or _blank for new tab
                    };

                    // ✅ v3 syntax
                    cashfree
                        .checkout(paymentOptions)
                        .then((result: { order: { orderId: string } }) => {
                            console.log("Payment success:", result);
                            onSuccess({
                                orderId: orderData.orderId,
                                paymentSessionId: orderData.paymentSessionId,
                            });
                        })
                        .catch((err: any) => {
                            console.error("Payment failed:", err);
                            if (onError) onError(err);
                        });
                } catch (error) {
                    console.error("Failed to initialize Cashfree:", error);
                    if (onError) onError(error);
                }
            };

            initializePayment();
        },
        []
    );

    const value: PaymentContextType = {
        payments,
        loading,
        error,
        fetchPaymentByProject,
        fetchPaymentById,
        fetchUserPayments,
        fetchAllPayments,
        createPaymentOrder,
        verifyPayment,
        createPaymentRecord,
        releasePayment,
        refundPayment,
        openCashfreeCheckout,
    };

    return (
        <PaymentContext.Provider value={value}>
            {children}
        </PaymentContext.Provider>
    );
};
