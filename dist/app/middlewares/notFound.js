"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFOund = void 0;
const http_status_codes_1 = require("http-status-codes");
const notFOund = (req, res) => {
    res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Route not Found",
    });
};
exports.notFOund = notFOund;
