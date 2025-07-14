"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAuth = void 0;
const AppError_1 = __importDefault(require("../errorHelpers/AppError"));
const http_status_codes_1 = require("http-status-codes");
const jwt_1 = require("../utils/jwt");
const env_1 = require("../config/env");
const checkAuth = (...authRoles) => (req, res, next) => {
    try {
        const accessToken = req.headers.authorization;
        if (!accessToken) {
            throw new AppError_1.default(http_status_codes_1.StatusCodes.FORBIDDEN, "No Token Received");
        }
        const verifiedToken = (0, jwt_1.verifyToken)(accessToken, env_1.envVars.JWT_ACCESS_SECRET);
        // authRoles = ["ADMIN", "SUPER_ADMIN"].includes("ADMIN")
        if (!authRoles.includes(verifiedToken.role)) {
            throw new AppError_1.default(http_status_codes_1.StatusCodes.FORBIDDEN, "You are not permitted to view this route!!!");
        }
        req.user = verifiedToken;
        /** req.user error
         * // express er req user property er moddhe amra amra verifiedToken take rakhtechie jeno checkAuth function jekhena use kora hobe oikhne direct amra req.user er moddhe oi token ta pabo to eta korar jonno.
         *  1. globally amaderke express ke janate hobe je req er moddhe user namer property ache.
         *  2. tarjonno app er moddhe amaderke interface name er folder nite hobe and then tar moddhe index.d.ts name file er code ta lekhte hobe,
         *  3. er pore jodi error nah jai tobe vscode reload, else if tsconfig.json file e include e
         *  // "include": ["./src/app/interfaces/index.d.  ts"] mane oi index.d.ts file ta jekhane thakbe tar file path dite hobe then reload
         *
         */
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.checkAuth = checkAuth;
