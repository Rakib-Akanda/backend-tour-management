import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { StatusCodes } from "http-status-codes";
import { StatsServices } from "./stats.service";

const getBookingStats = catchAsync(async (req: Request, res: Response) => {
  const stats = await StatsServices.getBookingStats();
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Booking Stats Retrieve Successfully",
    data: stats,
  });
});
const getPaymentStats = catchAsync(async (req: Request, res: Response) => {
  const stats = await StatsServices.getPaymentStats();
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: "User Updated Successfully",
    data: stats,
  });
});
const getUserStats = catchAsync(async (req: Request, res: Response) => {
  const stats = await StatsServices.getUserStats();
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "User Stats Retrieve Successfully",
    data: stats,
  });
});
const getTourStats = catchAsync(async (req: Request, res: Response) => {
  const stats = await StatsServices.getTourStats();
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Tour Stats Retrieve Successfully",
    data: stats,
  });
});

export const StatsController = {
  getBookingStats,
  getPaymentStats,
  getUserStats,
  getTourStats,
};
