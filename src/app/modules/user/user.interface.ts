import { Types } from "mongoose";

export enum Role {
    SUPER_ADMIN = "SUPER_ADMIN",
    ADMIN = "ADMIN",
    USER = "USER",
    GUIDE = "GUID"
}
// AUTH Providers 
/**
 * email, password 
 * google authentication
 * 
*/

export interface IAuthProvider {
    provider: string; // google, credential
    providerId: string;
}

export enum IsActive {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    BLOCKED = "BLOCKED"
}

export interface IUser {
    name: string;
    email: string;
    password?: string;
    phone?: string;
    picture?: string;
    address?: string;
    isDeleted?: string;
    isActive?: IsActive;
    isVerified?: string;

    auths: IAuthProvider[];
    role: Role;
    bookings?: Types.ObjectId[];
    guides?: Types.ObjectId[]
}
