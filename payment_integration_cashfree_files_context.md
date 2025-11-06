CONTROLLER FILE:

import { Cashfree } from "cashfree-pg-sdk-javascript";
import crypto from "crypto";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Payment } from "../models/payment.model.js";
import { Project } from "../models/project.model.js";

Cashfree.XClientId = process.env.CASHFREE_APP_ID;
Cashfree.XClientSecret = process.env.CASHFREE_APP_SECRET;
Cashfree.XEnvironment = process.env.CASHFREE_ENVIRONMENT || "TEST";

const createPaymentRecord = asyncHandler(async (req, res) => {
    const {
        projectId,
        totalAmount,
        clientPlatformFeePercentage = 5,
    } = req.body;

    if (!projectId || !totalAmount) {
        throw new ApiError(400, "Project ID and total amount are required");
    }

    const project = await Project.findById(projectId).populate(
        "createdBy assignedTo"
    );
    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    if (!project.assignedTo) {
        throw new ApiError(400, "Project must have a freelancer assigned");
    }

    const existingPayment = await Payment.findOne({ projectId });
    if (existingPayment) {
        throw new ApiError(
            400,
            "Payment record already exists for this project"
        );
    }

    const clientPlatformFee = (totalAmount * clientPlatformFeePercentage) / 100;
    const freelancerPlatformFee = (totalAmount * 8) / 100;

    const payment = await Payment.create({
        projectId,
        clientId: project.createdBy._id,
        freelancerId: project.assignedTo._id,
        totalAmount,
        currency: "INR",
        platformFee: {
            serviceCharge: clientPlatformFee,
            commissionFee: freelancerPlatformFee,
        },
        total: {
            amount: totalAmount,
            currency: "INR",
            status: "pending",
            customerName: project.createdBy.fullName,
            customerEmail: project.createdBy.email,
        },
        overallStatus: "pending",
    });

    project.payment = payment._id;
    await project.save();

    const populatedPayment = await Payment.findById(payment._id)
        .populate("clientId", "username email fullName")
        .populate("freelancerId", "username email fullName")
        .populate("projectId", "title");

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                populatedPayment,
                "Payment record created successfully"
            )
        );
});

const createOrder = asyncHandler(async (req, res) => {
    const { paymentId } = req.body;

    if (!paymentId) {
        throw new ApiError(400, "Payment ID is required");
    }

    const payment = await Payment.findById(paymentId)
        .populate("clientId", "username email fullName")
        .populate("projectId", "title");

    if (!payment) {
        throw new ApiError(404, "Payment record not found");
    }

    if (payment.total.status === "paid") {
        throw new ApiError(400, "Payment has already been completed");
    }

    const orderId = `order_${payment._id}_${Date.now()}`;

    const orderRequest = {
        order_amount: payment.total.amount,
        order_currency: "INR",
        order_id: orderId,
        customer_details: {
            customer_id: payment.clientId._id.toString(),
            customer_name: payment.clientId.fullName,
            customer_email: payment.clientId.email,
            customer_phone: payment.clientId.phone || "9999999999",
        },
        order_meta: {
            return_url: `${process.env.FRONTEND_URL}/payment/callback?order_id=${orderId}`,
            notify_url: `${process.env.BACKEND_URL}/api/v1/payments/webhook`,
        },
        order_note: `Payment for project: ${payment.projectId.title}`,
    };

    try {
        const response = await Cashfree.PGCreateOrder(
            "2023-08-01",
            orderRequest
        );

        payment.total.cashfreeOrderId = response.data.order_id;
        payment.total.status = "created";
        await payment.save();

        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    orderId: response.data.order_id,
                    orderToken: response.data.order_token,
                    paymentSessionId: response.data.payment_session_id,
                    amount: payment.total.amount,
                    currency: "INR",
                },
                "Cashfree order created successfully"
            )
        );
    } catch (error) {
        console.error("Cashfree order creation error:", error);
        throw new ApiError(
            500,
            error.message || "Failed to create payment order"
        );
    }
});

const verifyPayment = asyncHandler(async (req, res) => {
    const { paymentId, cashfreeOrderId, cashfreeSignature } = req.body;

    if (!paymentId || !cashfreeOrderId) {
        throw new ApiError(
            400,
            "Payment ID and Cashfree order ID are required"
        );
    }

    const payment = await Payment.findById(paymentId);
    if (!payment) {
        throw new ApiError(404, "Payment record not found");
    }

    try {
        const orderResponse = await Cashfree.PGOrderFetchPayments(
            "2023-08-01",
            cashfreeOrderId
        );

        if (!orderResponse.data || orderResponse.data.length === 0) {
            throw new ApiError(400, "No payment found for this order");
        }

        const cashfreePayment = orderResponse.data[0];

        const expectedSignature = crypto
            .createHmac("sha256", process.env.CASHFREE_APP_SECRET)
            .update(cashfreeOrderId)
            .digest("base64");

        const isAuthentic =
            !cashfreeSignature || expectedSignature === cashfreeSignature;

        if (!isAuthentic) {
            payment.total.status = "failed";
            payment.total.errorMessage = "Signature verification failed";
            await payment.save();
            throw new ApiError(400, "Payment verification failed");
        }

        if (cashfreePayment.payment_status !== "SUCCESS") {
            payment.total.status = "failed";
            payment.total.errorCode = cashfreePayment.error_details?.error_code;
            payment.total.errorMessage =
                cashfreePayment.error_details?.error_description;
            await payment.save();
            throw new ApiError(
                400,
                `Payment failed: ${cashfreePayment.payment_status}`
            );
        }

        payment.total.cashfreePaymentId = cashfreePayment.cf_payment_id;
        payment.total.cashfreeSignature = cashfreeSignature;
        payment.total.status = "paid";
        payment.total.paymentMethod = cashfreePayment.payment_group;
        payment.total.completedAt = new Date(cashfreePayment.payment_time);
        payment.overallStatus = "final_paid";
        payment.rawCashfreeResponse = cashfreePayment;

        await payment.save();

        const populatedPayment = await Payment.findById(payment._id)
            .populate("clientId", "username email fullName")
            .populate("freelancerId", "username email fullName")
            .populate("projectId", "title");

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    populatedPayment,
                    "Payment verified successfully"
                )
            );
    } catch (error) {
        console.error("Payment verification error:", error);
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, error.message || "Payment verification failed");
    }
});

const handleWebhook = asyncHandler(async (req, res) => {
    const webhookData = req.body;

    try {
        const signature = req.headers["x-webhook-signature"];
        const timestamp = req.headers["x-webhook-timestamp"];

        const signatureData = timestamp + JSON.stringify(webhookData);
        const expectedSignature = crypto
            .createHmac("sha256", process.env.CASHFREE_APP_SECRET)
            .update(signatureData)
            .digest("base64");

        if (signature !== expectedSignature) {
            throw new ApiError(400, "Invalid webhook signature");
        }

        const orderId = webhookData.data?.order?.order_id;

        const payment = await Payment.findOne({
            "total.cashfreeOrderId": orderId,
        });
        if (!payment) {
            return res.status(404).json({ message: "Payment not found" });
        }

        if (webhookData.type === "PAYMENT_SUCCESS_WEBHOOK") {
            payment.total.cashfreePaymentId =
                webhookData.data.payment.cf_payment_id;
            payment.total.status = "paid";
            payment.total.paymentMethod =
                webhookData.data.payment.payment_group;
            payment.total.completedAt = new Date(
                webhookData.data.payment.payment_time
            );
            payment.overallStatus = "final_paid";
        } else if (webhookData.type === "PAYMENT_FAILED_WEBHOOK") {
            payment.total.status = "failed";
            payment.total.errorCode =
                webhookData.data.payment.error_details?.error_code;
            payment.total.errorMessage =
                webhookData.data.payment.error_details?.error_description;
        }

        payment.rawCashfreeResponse = webhookData;
        await payment.save();

        return res
            .status(200)
            .json({ message: "Webhook processed successfully" });
    } catch (error) {
        console.error("Webhook processing error:", error);
        return res.status(500).json({ message: "Webhook processing failed" });
    }
});

const getPaymentByProject = asyncHandler(async (req, res) => {
    const { projectId } = req.params;

    const payment = await Payment.findOne({ projectId })
        .populate("clientId", "username email fullName")
        .populate("freelancerId", "username email fullName")
        .populate("projectId", "title status");

    if (!payment) {
        throw new ApiError(404, "Payment record not found for this project");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, payment, "Payment fetched successfully"));
});

const getPaymentById = asyncHandler(async (req, res) => {
    const { paymentId } = req.params;

    const payment = await Payment.findById(paymentId)
        .populate("clientId", "username email fullName")
        .populate("freelancerId", "username email fullName")
        .populate("projectId", "title status");

    if (!payment) {
        throw new ApiError(404, "Payment record not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, payment, "Payment fetched successfully"));
});

const releasePayment = asyncHandler(async (req, res) => {
    if (req.user.role !== "admin") {
        throw new ApiError(403, "Only admins can release payments");
    }

    const { paymentId } = req.body;

    if (!paymentId) {
        throw new ApiError(400, "Payment ID is required");
    }

    const payment = await Payment.findById(paymentId);
    if (!payment) {
        throw new ApiError(404, "Payment record not found");
    }

    if (payment.overallStatus !== "final_paid") {
        throw new ApiError(400, "Payment must be completed before release");
    }

    if (payment.releaseStatus === "released") {
        throw new ApiError(400, "Payment has already been released");
    }

    const releaseAmount =
        payment.totalAmount -
        payment.platformFee.serviceCharge -
        payment.platformFee.commissionFee;

    payment.releaseAmount = releaseAmount;
    payment.releaseStatus = "released";
    payment.overallStatus = "released";

    await payment.save();

    const populatedPayment = await Payment.findById(payment._id)
        .populate("clientId", "username email fullName")
        .populate("freelancerId", "username email fullName")
        .populate("projectId", "title");

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                populatedPayment,
                `Payment of ${payment.releaseAmount} released to freelancer`
            )
        );
});

const refundPayment = asyncHandler(async (req, res) => {
    if (req.user.role !== "admin") {
        throw new ApiError(403, "Only admins can process refunds");
    }

    const { paymentId, refundAmount, refundNote } = req.body;

    if (!paymentId) {
        throw new ApiError(400, "Payment ID is required");
    }

    const payment = await Payment.findById(paymentId);
    if (!payment) {
        throw new ApiError(404, "Payment record not found");
    }

    if (payment.releaseStatus === "released") {
        throw new ApiError(
            400,
            "Cannot refund a payment that has already been released"
        );
    }

    if (payment.releaseStatus === "refunded") {
        throw new ApiError(400, "Payment has already been refunded");
    }

    if (payment.total.status !== "paid") {
        throw new ApiError(400, "Can only refund paid payments");
    }

    try {
        const refundRequest = {
            refund_amount: refundAmount || payment.total.amount,
            refund_id: `refund_${payment._id}_${Date.now()}`,
            refund_note: refundNote || "Refund requested by admin",
        };

        const refundResponse = await Cashfree.PGOrderCreateRefund(
            "2023-08-01",
            payment.total.cashfreeOrderId,
            refundRequest
        );

        payment.releaseStatus = "refunded";
        payment.overallStatus = "refunded";
        payment.rawCashfreeResponse = {
            ...payment.rawCashfreeResponse,
            refund: refundResponse.data,
        };

        await payment.save();

        const populatedPayment = await Payment.findById(payment._id)
            .populate("clientId", "username email fullName")
            .populate("freelancerId", "username email fullName")
            .populate("projectId", "title");

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    populatedPayment,
                    "Payment refunded successfully"
                )
            );
    } catch (error) {
        console.error("Refund error:", error);
        throw new ApiError(500, error.message || "Refund processing failed");
    }
});

const getAllPayments = asyncHandler(async (req, res) => {
    if (req.user.role !== "admin") {
        throw new ApiError(403, "Only admins can view all payments");
    }

    const payments = await Payment.find({})
        .populate("clientId", "username email fullName")
        .populate("freelancerId", "username email fullName")
        .populate("projectId", "title status")
        .sort({ createdAt: -1 });

    return res
        .status(200)
        .json(
            new ApiResponse(200, payments, "All payments fetched successfully")
        );
});

const getUserPayments = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const userRole = req.user.role;

    let query = {};
    if (userRole === "client") {
        query.clientId = userId;
    } else if (userRole === "freelancer") {
        query.freelancerId = userId;
    } else {
        throw new ApiError(403, "Invalid user role for fetching payments");
    }

    const payments = await Payment.find(query)
        .populate("clientId", "username email fullName")
        .populate("freelancerId", "username email fullName")
        .populate("projectId", "title status")
        .sort({ createdAt: -1 });

    return res
        .status(200)
        .json(
            new ApiResponse(200, payments, "User payments fetched successfully")
        );
});

export {
    createPaymentRecord,
    createOrder,
    verifyPayment,
    handleWebhook,
    getPaymentByProject,
    getPaymentById,
    releasePayment,
    refundPayment,
    getAllPayments,
    getUserPayments,
};



ROUTE FILE:
import express from "express";
import {
  createPaymentRecord,
  createOrder,
  verifyPayment,
  handleWebhook,
  getPaymentByProject,
  getPaymentById,
  releasePayment,
  refundPayment,
  getAllPayments,
  getUserPayments,
} from "../controllers/payment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/create-record", verifyJWT, createPaymentRecord);
router.post("/create-order", verifyJWT, createOrder);
router.post("/verify-payment", verifyJWT, verifyPayment);
router.post("/webhook", handleWebhook);
router.get("/project/:projectId", verifyJWT, getPaymentByProject);
router.get("/:paymentId", verifyJWT, getPaymentById);
router.post("/release", verifyJWT, releasePayment);
router.post("/refund", verifyJWT, refundPayment);
router.get("/admin/all", verifyJWT, getAllPayments);
router.get("/user/my-payments", verifyJWT, getUserPayments);

export default router;



MODEL FILE:
import mongoose from "mongoose";

const paymentStageSchema = new mongoose.Schema({
  cashfreeOrderId: { type: String },
  cashfreePaymentId: { type: String },
  cashfreeSignature: { type: String },
  amount: { type: Number, required: true },
  currency: { type: String, default: "INR" },
  status: {
    type: String,
    enum: ["pending", "created", "paid", "failed"],
    default: "pending",
  },
  customerName: { type: String },
  customerEmail: { type: String },
  customerPhone: { type: String },
  paymentMethod: { type: String },
  errorCode: { type: String },
  errorMessage: { type: String },
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
});

const paymentSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  freelancerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  totalAmount: { type: Number, required: true },
  currency: { type: String, default: "INR" },
  platformFee: {
    serviceCharge: { type: Number, required: true },
    commissionFee: { type: Number, required: true },
  },

  total: { type: paymentStageSchema, required: true },

  rawCashfreeResponse: { type: mongoose.Schema.Types.Mixed },

  releaseAmount: { type: Number, default: 0 },
  releaseStatus: {
    type: String,
    enum: ["not_released", "released", "refunded"],
    default: "not_released",
  },

  overallStatus: {
    type: String,
    enum: [
      "pending",
      "advance_paid",
      "final_paid",
      "released",
      "refunded",
    ],
    default: "pending",
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

paymentSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

export const Payment = mongoose.model("Payment", paymentSchema);
