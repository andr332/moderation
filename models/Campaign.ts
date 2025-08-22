import mongoose, { Document, Schema } from "mongoose";

export interface ICampaign extends Document {
  _id: string;
  name: string;
  description?: string;
  imageIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

const CampaignSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    imageIds: {
      type: [Schema.Types.ObjectId],
      ref: "Image",
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Campaign ||
  mongoose.model<ICampaign>("Campaign", CampaignSchema);
