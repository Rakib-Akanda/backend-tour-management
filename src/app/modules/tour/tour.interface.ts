import { Types } from "mongoose";

export interface ITourType {
  name: string;
}

export interface ITour {
  title: string;
  slug: string;
  description?: string;
  images?: string[];
  location?: string;
  costFrom?: number;
  startDate?: Date;
  endDate?: Date;
  departureLocation?: string;
  arrivalLocation?: string;
  inCluded?: string[];
  exCluded?: string[];
  amenities?: string[];
  tourPlan?: string[];
  maxGuests?: number;
  minAge?: number;
  division: Types.ObjectId;
  tourType: Types.ObjectId;
  deleteImages?: string[];
}
