"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const http_status_codes_1 = require("http-status-codes");
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const booking_interface_1 = require("../booking/booking.interface");
const booking_model_1 = require("../booking/booking.model");
const payment_interface_1 = require("./payment.interface");
const payment_model_1 = require("./payment.model");
const sslCommerz_service_1 = require("../SSLCommerz/sslCommerz.service");
const invoice_1 = require("../../utils/invoice");
const sendEmail_1 = require("../../utils/sendEmail");
const cloudinary_config_1 = require("../../config/cloudinary.config");
const initPayment = (bookingId) => __awaiter(void 0, void 0, void 0, function* () {
    const payment = yield payment_model_1.Payment.findOne({ booking: bookingId });
    if (!payment) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, "Payment not found, You have not booked this tour");
    }
    const booking = yield booking_model_1.Booking.findById(payment.booking);
    const userAddress = (booking === null || booking === void 0 ? void 0 : booking.user).address;
    const userEmail = (booking === null || booking === void 0 ? void 0 : booking.user).email;
    const userPhoneNumber = (booking === null || booking === void 0 ? void 0 : booking.user).phone;
    const userName = (booking === null || booking === void 0 ? void 0 : booking.user).name;
    const sslPayload = {
        address: userAddress,
        email: userEmail,
        phoneNumber: userPhoneNumber,
        name: userName,
        amount: payment.amount,
        transactionId: payment.transactionId,
    };
    const sslPayment = yield sslCommerz_service_1.SSLService.sslPaymentInit(sslPayload);
    return {
        paymentUrl: sslPayment.GatewayPageURL,
    };
});
const successPayment = (query) => __awaiter(void 0, void 0, void 0, function* () {
    // update Booking status to confirm
    // update Payment status to Paid
    const session = yield booking_model_1.Booking.startSession();
    session.startTransaction();
    try {
        // const booking = await Booking.findByIdAndUpdate(
        //   [
        //     {
        //       user: userId,
        //       status: BOOKING_STATUS.PENDING,
        //       ...payload,
        //     },
        //   ],
        //   { session }
        // );
        //   throw new Error("Fake error");
        const updatedPayment = yield payment_model_1.Payment.findOneAndUpdate({ transactionId: query.transactionId }, {
            status: payment_interface_1.PAYMENT_STATUS.PAID,
        }, {
            new: true,
            runValidators: true,
            session,
        });
        if (!updatedPayment) {
            throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, "Payment not found.");
        }
        const updatedBooking = yield booking_model_1.Booking.findByIdAndUpdate(updatedPayment === null || updatedPayment === void 0 ? void 0 : updatedPayment.booking, {
            status: booking_interface_1.BOOKING_STATUS.COMPLETE,
        }, {
            new: true,
            runValidators: true,
            session,
        })
            .populate("user", "name email phone address")
            .populate("tour", "title costFrom")
            .populate("payment");
        if (!updatedBooking) {
            throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, "Booking not found.");
        }
        const invoiceData = {
            bookingDate: updatedBooking.createdAt,
            guestCount: updatedBooking.guestCount,
            totalAmount: updatedPayment.amount,
            tourTitle: updatedBooking.tour.title,
            transactionId: updatedPayment.transactionId,
            username: updatedBooking.user.name,
        };
        const pdfBuffer = yield (0, invoice_1.generatePdf)(invoiceData);
        const cloudinaryResult = yield (0, cloudinary_config_1.uploadBufferToCloudinary)(pdfBuffer, "invoice");
        if (!cloudinaryResult) {
            throw new AppError_1.default(http_status_codes_1.StatusCodes.UNAUTHORIZED, "Error uploading pdf");
        }
        yield payment_model_1.Payment.findByIdAndUpdate(updatedPayment._id, {
            invoiceUrl: cloudinaryResult === null || cloudinaryResult === void 0 ? void 0 : cloudinaryResult.secure_url,
        }, { runValidators: true, session });
        yield (0, sendEmail_1.sendEmail)({
            to: updatedBooking.user.email,
            subject: "Your Booking Invoice",
            templateName: "invoice",
            templateData: invoiceData,
            attachments: [
                {
                    filename: "invoice.pdf",
                    content: pdfBuffer,
                    contentType: "application/pdf",
                },
            ],
        });
        yield session.commitTransaction(); //Transaction:-
        session.endSession();
        return { success: true, message: "Payment Completed Successfully" };
    }
    catch (error) {
        yield session.abortTransaction(); //Rollback:-
        session.endSession();
        throw error;
    }
});
const failPayment = (query) => __awaiter(void 0, void 0, void 0, function* () {
    // update Booking status to fail
    // update Payment status to fail
    const session = yield booking_model_1.Booking.startSession();
    session.startTransaction();
    try {
        const updatedPayment = yield payment_model_1.Payment.findOneAndUpdate({ transactionId: query.transactionId }, {
            status: payment_interface_1.PAYMENT_STATUS.FAILED,
        }, {
            new: true,
            runValidators: true,
            session,
        });
        yield booking_model_1.Booking.findByIdAndUpdate(updatedPayment === null || updatedPayment === void 0 ? void 0 : updatedPayment.booking, {
            status: booking_interface_1.BOOKING_STATUS.FAILED,
        }, {
            runValidators: true,
            session,
        });
        yield session.commitTransaction(); //Transaction:-
        session.endSession();
        return { success: false, message: "Payment Failed" };
    }
    catch (error) {
        yield session.abortTransaction(); //Rollback:-
        session.endSession();
        throw error;
    }
});
const cancelPayment = (query) => __awaiter(void 0, void 0, void 0, function* () {
    // update Booking status to fail
    // update Payment status to fail
    const session = yield booking_model_1.Booking.startSession();
    session.startTransaction();
    try {
        const updatedPayment = yield payment_model_1.Payment.findOneAndUpdate({ transactionId: query.transactionId }, {
            status: payment_interface_1.PAYMENT_STATUS.CANCELED,
        }, {
            runValidators: true,
            session,
        });
        yield booking_model_1.Booking.findByIdAndUpdate(updatedPayment === null || updatedPayment === void 0 ? void 0 : updatedPayment.booking, {
            status: booking_interface_1.BOOKING_STATUS.CANCEL,
        }, {
            new: true,
            runValidators: true,
            session,
        });
        yield session.commitTransaction(); //Transaction:-
        session.endSession();
        return { success: false, message: "Payment Canceled" };
    }
    catch (error) {
        yield session.abortTransaction(); //Rollback:-
        session.endSession();
        throw error;
    }
});
const getInvoiceDownloadUrl = (paymentId) => __awaiter(void 0, void 0, void 0, function* () {
    const payment = yield payment_model_1.Payment.findById(paymentId).select("invoiceUrl");
    if (!payment) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, "Payment Not Found");
    }
    if (!payment.invoiceUrl) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, "Payment Not Found");
    }
    return payment.invoiceUrl;
});
exports.PaymentService = {
    initPayment,
    successPayment,
    failPayment,
    cancelPayment,
    getInvoiceDownloadUrl,
};
