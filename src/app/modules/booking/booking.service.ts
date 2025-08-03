/* eslint-disable @typescript-eslint/no-explicit-any */
import { StatusCodes } from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { User } from "../user/user.model";
import { BOOKING_STATUS, IBooking } from "./booking.interface";
import { Booking } from "./booking.model";
import { Payment } from "../payment/payment.model";
import { PAYMENT_STATUS } from "../payment/payment.interface";
import { Tour } from "../tour/tour.model";
import { SSLService } from "../SSLCommerz/sslCommerz.service";
import { ISSLCommerz } from "../SSLCommerz/sslCommerz.interface";
import { getTransactionId } from "../../utils/getTransactionId";

/** Transaction Rollback
 * Duplicate DB Collections / replica
 * 
 * // jokhon multiple collection er moddhe crud operation hobe tokon Transaction and Rollback must use korte hobe
 *
 * // virtual vabe kaj hobe jodi er operation gulor moddhe kuno error hoi tobe eta vanish hoie jabe,
 * 
 * Replica DB -> [ create booking  -> create payment -> update booking ] -> Real DB
 * 
 * transaction and rollback system integrate korte hobe karon ekadhik model nie jokhon kaj kora hobe tokon jodi ekta model er operation complete hoie and next model model er operation e kuno error hoi tobe data er integrity nosto hoie jabe jemon ekhane  booking create hobe but payment create hobe nah.

 * */

const createBooking = async (payload: Partial<IBooking>, userId: string) => {
  const transactionId = getTransactionId();
  const session = await Booking.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(userId);
    if (!user?.phone || !user.address) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "Please update your profile to book a tour"
      );
    }
    const tour = await Tour.findById(payload.tour).select("costFrom");
    if (!tour?.costFrom) {
      throw new AppError(StatusCodes.BAD_REQUEST, "No tour cost found!");
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const amount = Number(tour.costFrom) * Number(payload.guestCount!);

    const booking = await Booking.create(
      [
        {
          user: userId,
          status: BOOKING_STATUS.PENDING,
          ...payload,
        },
      ],
      { session }
    );

    //   throw new Error("Fake error");

    const payment = await Payment.create(
      [
        {
          booking: booking[0]._id,
          status: PAYMENT_STATUS.UNPAID,
          transactionId: transactionId,
          amount: amount,
        },
      ],
      { session }
    );

    const updatedBooking = await Booking.findByIdAndUpdate(
      booking[0]._id,

      {
        payment: payment[0]._id,
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

    const userAddress = (updatedBooking?.user as any).address;
    const userEmail = (updatedBooking?.user as any).email;
    const userPhoneNumber = (updatedBooking?.user as any).phone;
    const userName = (updatedBooking?.user as any).name;

    const sslPayload: ISSLCommerz = {
      address: userAddress,
      email: userEmail,
      phoneNumber: userPhoneNumber,
      name: userName,
      amount: amount,
      transactionId: transactionId,
    };

    const sslPayment = await SSLService.sslPaymentInit(sslPayload);
    // console.log(sslPayment);
    await session.commitTransaction(); //Transaction:-  Real DB te insert hobe ei commitTransaction er maddhome;
    session.endSession();
    return {
      paymentUrl: sslPayment.GatewayPageURL,
      booking: updatedBooking,
    };
  } catch (error) {
    await session.abortTransaction(); //Rollback:- replica ba virtual db theke back korbe;
    session.endSession();
    // throw new AppError(StatusCodes.BAD_REQUEST, error) // ❌❌
    throw error;
  }
};

const getAllBookings = async () => {
  return {};
};
// Frontend(localhost:5173) - User - Tour - Booking (Pending) - Payment(Unpaid) -> SSLCommerz Page -> Payment Complete -> Backend(localhost:5000/api/v1/payment/success) -> Update Payment(PAID) & Booking(CONFIRM) -> redirect to frontend -> Frontend(localhost:5173/payment/success)

// Frontend(localhost:5173) - User - Tour - Booking (Pending) - Payment(Unpaid) -> SSLCommerz Page -> Payment Fail / Cancel -> Backend(localhost:5000) -> Update Payment(FAIL / CANCEL) & Booking(FAIL / CANCEL) -> redirect to frontend -> Frontend(localhost:5173/payment/cancel or localhost:5173/payment/fail)

const getUserBookings = async () => {
  return {};
};

const getSingleBooking = async () => {
  return {};
};

const updateBookingStatus = async () => {
  return {};
};

const BookingService = {
  createBooking,
  getAllBookings,
  getSingleBooking,
  getUserBookings,
  updateBookingStatus,
};
export default BookingService;
