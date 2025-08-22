import mongoose, { Document, Schema } from "mongoose";

export interface IStream extends Document {
  _id: string;
  name: string;
  campaignIds: string[];
  logoFileId?: string; // Store the GridFS file ID
  logoUrl?: string; // Keep for backward compatibility
  createdAt: Date;
  updatedAt: Date;
}

const StreamSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    campaignIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Campaign",
        required: true,
      },
    ],
    logoFileId: {
      type: String,
    },
    logoUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Stream ||
  mongoose.model<IStream>("Stream", StreamSchema);
