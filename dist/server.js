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
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = __importDefault(require("./app"));
const env_1 = require("./app/config/env");
const seedSuperAdmin_1 = require("./app/utils/seedSuperAdmin");
let server;
const bootStrap = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield mongoose_1.default.connect(env_1.envVars.DB_URL);
        console.log("✅ Connected to DB");
        server = app_1.default.listen(env_1.envVars.PORT, () => {
            console.log(`✅ Server in running or prot ${env_1.envVars.PORT}`);
        });
    }
    catch (error) {
        console.log(error);
    }
});
//IIFE
(() => __awaiter(void 0, void 0, void 0, function* () {
    yield bootStrap();
    yield (0, seedSuperAdmin_1.seedSuperAdmin)();
}))();
//unhandled rejection error
process.on("unhandledRejection", (error) => {
    console.log("Unhandled Rejection detected .. Server shutting down..", error);
    if (server) {
        server.close(() => {
            process.exit(1);
        });
    }
    process.exit(1);
});
// uncaught rejection error
process.on("uncaughtException", (error) => {
    console.log("Uncaught Exception detected .. Server shutting down..", error);
    if (server) {
        server.close(() => {
            process.exit(1);
        });
    }
    process.exit(1);
});
// signal termination or sigterm
process.on("SIGTERM", () => {
    console.log("SIGTERM signal received.. Server shutting down");
    if (server) {
        server.close(() => {
            process.exit(1);
        });
    }
    process.exit(1);
});
process.on("SIGINT", () => {
    console.log("SIGINT signal received.. Server shutting down");
    if (server) {
        server.close(() => {
            process.exit(1);
        });
    }
    process.exit(1);
});
// Promise.reject(new Error("Forgot to catch this error")); //unhandled rejection error
// throw new Error("local handlej"); //uncaught rejection error
/**
 * ------ Error Handle ------
 *
 *  unhandled rejection error
 *  uncaught rejection error
 *  signal termination or sigterm// server jekhne host okra like aws/gcloud/digital ocean tara kisokkhon er jonno server off korar jonno signal pathai, ta gracefully handle korar jonnno use kora SIGTERM and SIGINT hoche developer ra jokhon gracefully ctrl+c die shutdown dei tokon use oi
 *
 *
 * */
