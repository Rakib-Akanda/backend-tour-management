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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const http_status_codes_1 = require("http-status-codes");
const user_service_1 = require("./user.service");
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = require("../../utils/sendResponse");
// const createUser = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     // throw new AppError(httpStatus.BAD_REQUEST, "fake error")
//     const user = await UserServices.createUser(req.body);
//     res.status(httpStatus.CREATED).json({
//       message: "User Created Successfully",
//       user,
//     });
//   } catch (error: any) {
//     // eslint-disable-next-line no-console
//     console.log(error);
//     next(error);
//   }
// };
const createUser = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_service_1.UserServices.createUser(req.body);
    // res.status(httpStatus.CREATED).json({
    //   success: true,
    //   message: "User Created Successfully",
    //   user,
    // });
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.CREATED,
        message: "User Created Successfully",
        data: user,
    });
}));
const updateUser = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.id;
    // const token = req.headers.authorization;
    // const verifiedToken = verifyToken(
    //   token as string,
    //   envVars.JWT_ACCESS_SECRET
    // ) as JwtPayload;
    const verifiedToken = req.user;
    const payload = req.body;
    const user = yield user_service_1.UserServices.updateUser(userId, payload, verifiedToken);
    // res.status(httpStatus.CREATED).json({
    //   success: true,
    //   message: "User Created Successfully",
    //   user,
    // });
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.CREATED,
        message: "User Updated Successfully",
        data: user,
    });
}));
const getAllUsers = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_service_1.UserServices.getAllUsers();
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: "Users Retrieved Successfully",
        data: result.data,
        meta: result.meta,
    });
}));
const getSingleUsers = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.id;
    const result = yield user_service_1.UserServices.getSingleUsers(userId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: "User Retrieved Successfully",
        data: result.data,
    });
}));
const getMe = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const decodedToken = req.user;
    const result = yield user_service_1.UserServices.getMe(decodedToken.userId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: "Your Profile Retrieved Successfully",
        data: result.data,
    });
}));
exports.UserController = {
    createUser,
    getAllUsers,
    getSingleUsers,
    getMe,
    updateUser,
};
// before controller
// route matching -> controller -> service -> model -> DB
