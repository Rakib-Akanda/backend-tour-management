import { NextFunction, Request, Response } from "express";
import AppError from "../errorHelpers/AppError";
import { StatusCodes } from "http-status-codes";
import { verifyToken } from "../utils/jwt";
import { envVars } from "../config/env";
import { JwtPayload } from "jsonwebtoken";
import { IsActive } from "../modules/user/user.interface";
import { User } from "../modules/user/user.model";

export const checkAuth =
  (...authRoles: string[]) =>
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const accessToken = req.headers.authorization;
        if (!accessToken) {
          throw new AppError(StatusCodes.FORBIDDEN, "No Token Received");
        }

        const verifiedToken = verifyToken(
          accessToken,
          envVars.JWT_ACCESS_SECRET
        ) as JwtPayload;

        const isUserExist = await User.findOne({ email: verifiedToken.email });

        if (!isUserExist) {
          throw new AppError(StatusCodes.BAD_REQUEST, "User does not Exist");
        }
        if (
          isUserExist.isActive === IsActive.BLOCKED ||
          isUserExist.isActive === IsActive.INACTIVE
        ) {
          throw new AppError(
            StatusCodes.BAD_REQUEST,
            `User is ${isUserExist.isActive}`
          );
        }
        if (isUserExist.isDeleted) {
          throw new AppError(StatusCodes.BAD_REQUEST, "User is deleted");
        }

        // authRoles = ["ADMIN", "SUPER_ADMIN"].includes("ADMIN")
        if (!authRoles.includes(verifiedToken.role)) {
          throw new AppError(
            StatusCodes.FORBIDDEN,
            "You are not permitted to view this route!!!"
          );
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
      } catch (error) {
        next(error);
      }
    };
