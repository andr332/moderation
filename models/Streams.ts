import mongoose, { Document, Schema } from "mongoose";

export interface IStream extends Document {
  _id: string;
  name: string;
  campaignIds: string[];
  logoUrl?: string;
  isActive: boolean;
  displaySettings: {
    mode: "grid" | "slideshow";
    autoPlay: boolean;
    slideInterval: number;
    showMetadata: boolean;
    theme: {
      primaryColor: string;
      backgroundColor: string;
    };
  };
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
      },
    ],
    logoUrl: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    displaySettings: {
      mode: {
        type: String,
        enum: ["grid", "slideshow"],
        default: "grid",
      },
      autoPlay: {
        type: Boolean,
        default: false,
      },
      slideInterval: {
        type: Number,
        default: 5,
      },
      showMetadata: {
        type: Boolean,
        default: true,
      },
      theme: {
        primaryColor: {
          type: String,
          default: "#3B82F6",
        },
        backgroundColor: {
          type: String,
          default: "#F8FAFC",
        },
      },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Stream ||
  mongoose.model<IStream>("Stream", StreamSchema);
