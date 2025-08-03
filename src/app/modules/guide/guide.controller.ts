import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { StatusCodes } from "http-status-codes";
import { GuideServices } from "./guide.service";
import { IGuide } from "./guide.interface";

const createGuide = catchAsync(async (req: Request, res: Response) => {
  const payload: IGuide = {
    ...req.body,
    nidPhoto: req.file?.path,
  };
  const guide = await GuideServices.createGuide(payload);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Guide Created Successfully",
    data: guide,
  });
});
const approveGuide = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const payload = req.body;
  const approveGuide = await GuideServices.approveGuide(id, payload);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Guide Approve Successfully",
    data: approveGuide,
  });
});
const getGuide = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;
  const guideData = await GuideServices.getGuide(
    query as Record<string, string>
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Payment Validated Successfully",
    data: guideData,
  });
});
const getSingleGuide = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const guideData = await GuideServices.getSingleGuide(id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Payment Validated Successfully",
    data: guideData,
  });
});

export const GuideController = {
  createGuide,
  approveGuide,
  getGuide,
  getSingleGuide,
};
