/* eslint-disable @typescript-eslint/no-unused-vars */
import mongoose from "mongoose"
import { TGenericErrorResponse } from "../interfaces/error.types"

export const handleCastError = (err: mongoose.Error.CastError): TGenericErrorResponse => {
    // console.log(err.message);
    return {
        statusCode: 400,
        message: "Invalid mongodb object id, Please provider valid id"
    }
}