import mongoose, { Document, Schema } from "mongoose";

export interface IImage extends Document {
  _id: string;
  img: string;
  name: string;
  description?: string;
  date: Date;
  approved: boolean;
  status: "pending" | "approved" | "rejected";
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
      enum: ["pending", "approved", "rejected"],
      default: "pending",
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
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Image ||
  mongoose.model<IImage>("Image", ImageSchema);
