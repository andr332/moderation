import mongoose, { Document, Schema } from "mongoose";

export interface IImage extends Document {
  _id: string;
  img: string;
  name: string;
  description?: string;
  date: Date;
  approved: boolean;
  status: "approved" | "rejected";
  campaignId: string;
  streamId?: string;
  source: "internal" | "external_app" | "manual";
  createdAt: Date;
  updatedAt: Date;
}

const ImageSchema: Schema = new Schema(
  {
    img: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    approved: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["approved", "rejected"],
      default: "rejected", // Changed default to rejected since there's no pending
    },
    campaignId: {
      type: Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
    },
    streamId: {
      type: Schema.Types.ObjectId,
      ref: "Stream",
      default: null,
    },
    source: {
      type: String,
      enum: ["internal", "external_app", "manual"],
      default: "manual",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Image ||
  mongoose.model<IImage>("Image", ImageSchema);
