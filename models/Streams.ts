import mongoose, { Document, Schema } from "mongoose";

export interface IStream extends Document {
  _id: string;
  name: string;
  campaignIds: string[];
  widgetConfig: {
    displayMode: "grid" | "slideshow";
    color: string;
    showLogo: boolean;
  };
  logoFileId?: string;
  logoUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const StreamSchema = new Schema({
  name: { type: String, required: true },
  logoUrl: { type: String },
  campaignIds: [{ type: Schema.Types.ObjectId, ref: "Campaign" }],
  widgetConfig: {
    displayMode: {
      type: String,
      enum: ["grid", "slideshow"],
      default: "grid",
    },
    color: {
      type: String,
      default: "#3B82F6",
    },
    showLogo: {
      type: Boolean,
      default: true,
    },
  },
  logoFileId: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Stream ||
  mongoose.model<IStream>("Stream", StreamSchema);
