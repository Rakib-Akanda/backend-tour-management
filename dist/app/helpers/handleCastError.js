"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleCastError = void 0;
const handleCastError = (err) => {
    // console.log(err.message);
    return {
        statusCode: 400,
        message: "Invalid mongodb object id, Please provider valid id"
    };
};
exports.handleCastError = handleCastError;
