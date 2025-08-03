import { model, Schema } from "mongoose";
import { Guide_Status, IGuide } from "./guide.interface";

const GuideSchema = new Schema<IGuide>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    divisionId: {
      type: Schema.Types.ObjectId,
      ref: "Division",
      required: true,
    },
    nidPhoto: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(Guide_Status),
      default: Guide_Status.PENDING,
    },
    name: { type: String },
    email: { type: String },
    divisionName: { type: String },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

export const Guide = model<IGuide>("Guide", GuideSchema);
