import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { DivisionService } from "./division.service";
import { IDivision } from "./division.interface";

const createDivision = catchAsync(async (req: Request, res: Response) => {
  // console.log({ file: req.file, body: req.body });
  const payload: IDivision = {
    ...req.body,
    thumbnail: req.file?.path,
  };
  const result = await DivisionService.createDivision(payload);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Division created",
    data: result,
  });
});
const getAllDivisions = catchAsync(async (req: Request, res: Response) => {
  const result = await DivisionService.getAllDivision();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Retrieve all Divisions",
    data: result,
  });
});
const getSingleDivision = catchAsync(async (req: Request, res: Response) => {
  const slug = req.params.slug;
  const result = await DivisionService.getSingleDivision(slug);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Retrieve Single Division",
    data: result,
  });
});
const updateDivision = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;

  const payload: IDivision = {
    ...req.body,
    thumbnail: req.file?.path,
  };

  const result = await DivisionService.updateDivision(id, payload);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Division Updated",
    data: result,
  });
});
const deleteDivision = catchAsync(async (req: Request, res: Response) => {
  const result = await DivisionService.deleteDivision(req.params.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Division deleted successfully",
    data: result,
  });
});

export const DivisionController = {
  createDivision,
  getAllDivisions,
  getSingleDivision,
  updateDivision,
  deleteDivision,
};
