/* eslint-disable @typescript-eslint/no-explicit-any */
import { StatusCodes } from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { BOOKING_STATUS } from "../booking/booking.interface";
import { Booking } from "../booking/booking.model";
import { PAYMENT_STATUS } from "./payment.interface";
import { Payment } from "./payment.model";
import { ISSLCommerz } from "../SSLCommerz/sslCommerz.interface";
import { SSLService } from "../SSLCommerz/sslCommerz.service";
import { generatePdf, IInvoiceData } from "../../utils/invoice";
import { ITour } from "../tour/tour.interface";
import { IUser } from "../user/user.interface";
import { sendEmail } from "../../utils/sendEmail";
import { uploadBufferToCloudinary } from "../../config/cloudinary.config";

const initPayment = async (bookingId: string) => {
  const payment = await Payment.findOne({ booking: bookingId });
  if (!payment) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Payment not found, You have not booked this tour"
    );
  }
  const booking = await Booking.findById(payment.booking);

  const userAddress = (booking?.user as any).address;
  const userEmail = (booking?.user as any).email;
  const userPhoneNumber = (booking?.user as any).phone;
  const userName = (booking?.user as any).name;

  const sslPayload: ISSLCommerz = {
    address: userAddress,
    email: userEmail,
    phoneNumber: userPhoneNumber,
    name: userName,
    amount: payment.amount,
    transactionId: payment.transactionId,
  };

  const sslPayment = await SSLService.sslPaymentInit(sslPayload);
  return {
    paymentUrl: sslPayment.GatewayPageURL,
  };
};
const successPayment = async (query: Record<string, string>) => {
  // update Booking status to confirm
  // update Payment status to Paid
  const session = await Booking.startSession();
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

    const updatedPayment = await Payment.findOneAndUpdate(
      { transactionId: query.transactionId },
      {
        status: PAYMENT_STATUS.PAID,
      },
      {
        new: true,
        runValidators: true,
        session,
      }
    );
    if (!updatedPayment) {
      throw new AppError(StatusCodes.NOT_FOUND, "Payment not found.");
    }
    const updatedBooking = await Booking.findByIdAndUpdate(
      updatedPayment?.booking,
      {
        status: BOOKING_STATUS.COMPLETE,
      },
      {
        new: true,
        runValidators: true,
        session,
      }
    )
      .populate("user", "name email phone address")
      .populate("tour", "title costFrom")
      .populate("payment");
    if (!updatedBooking) {
      throw new AppError(StatusCodes.NOT_FOUND, "Booking not found.");
    }

    const invoiceData: IInvoiceData = {
      bookingDate: updatedBooking.createdAt as Date,
      guestCount: updatedBooking.guestCount,
      totalAmount: updatedPayment.amount,
      tourTitle: (updatedBooking.tour as unknown as ITour).title,
      transactionId: updatedPayment.transactionId,
      username: (updatedBooking.user as unknown as IUser).name,
    };
    const pdfBuffer = await generatePdf(invoiceData);

    const cloudinaryResult = await uploadBufferToCloudinary(
      pdfBuffer,
      "invoice"
    );
    if (!cloudinaryResult) {
      throw new AppError(StatusCodes.UNAUTHORIZED, "Error uploading pdf");
    }
    await Payment.findByIdAndUpdate(
      updatedPayment._id,
      {
        invoiceUrl: cloudinaryResult?.secure_url,
      },
      { runValidators: true, session }
    );
    await sendEmail({
      to: (updatedBooking.user as unknown as IUser).email,
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

    await session.commitTransaction(); //Transaction:-
    session.endSession();
    return { success: true, message: "Payment Completed Successfully" };
  } catch (error) {
    await session.abortTransaction(); //Rollback:-
    session.endSession();
    throw error;
  }
};
const failPayment = async (query: Record<string, string>) => {
  // update Booking status to fail
  // update Payment status to fail
  const session = await Booking.startSession();
  session.startTransaction();

  try {
    const updatedPayment = await Payment.findOneAndUpdate(
      { transactionId: query.transactionId },
      {
        status: PAYMENT_STATUS.FAILED,
      },
      {
        new: true,
        runValidators: true,
        session,
      }
    );

    await Booking.findByIdAndUpdate(
      updatedPayment?.booking,
      {
        status: BOOKING_STATUS.FAILED,
      },
      {
        runValidators: true,
        session,
      }
    );

    await session.commitTransaction(); //Transaction:-
    session.endSession();
    return { success: false, message: "Payment Failed" };
  } catch (error) {
    await session.abortTransaction(); //Rollback:-
    session.endSession();
    throw error;
  }
};
const cancelPayment = async (query: Record<string, string>) => {
  // update Booking status to fail
  // update Payment status to fail
  const session = await Booking.startSession();
  session.startTransaction();

  try {
    const updatedPayment = await Payment.findOneAndUpdate(
      { transactionId: query.transactionId },
      {
        status: PAYMENT_STATUS.CANCELED,
      },
      {
        runValidators: true,
        session,
      }
    );

    await Booking.findByIdAndUpdate(
      updatedPayment?.booking,
      {
        status: BOOKING_STATUS.CANCEL,
      },
      {
        new: true,
        runValidators: true,
        session,
      }
    );
    await session.commitTransaction(); //Transaction:-
    session.endSession();
    return { success: false, message: "Payment Canceled" };
  } catch (error) {
    await session.abortTransaction(); //Rollback:-
    session.endSession();
    throw error;
  }
};

const getInvoiceDownloadUrl = async (paymentId: string) => {
  const payment = await Payment.findById(paymentId).select("invoiceUrl");
  if (!payment) {
    throw new AppError(StatusCodes.NOT_FOUND, "Payment Not Found");
  }
  if (!payment.invoiceUrl) {
    throw new AppError(StatusCodes.NOT_FOUND, "Payment Not Found");
  }
  return payment.invoiceUrl;
};

export const PaymentService = {
  initPayment,
  successPayment,
  failPayment,
  cancelPayment,
  getInvoiceDownloadUrl,
};
