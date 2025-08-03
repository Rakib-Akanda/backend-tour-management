import { Types } from "mongoose";

export enum Guide_Status {
  APPROVED = "APPROVED",
  PENDING = "PENDING",
  REJECTED = "REJECTED",
}

export interface IGuide {
  userId: Types.ObjectId;
  divisionId: Types.ObjectId;
  nidPhoto: string;
  status: Guide_Status;
  name?: string;
  email?: string;
  divisionName?: string;
}
