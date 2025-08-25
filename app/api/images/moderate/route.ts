import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Image } from "@/models";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { id, approved } = await req.json();

    const image = await Image.findByIdAndUpdate(
      id,
      {
        approved,
        status: approved ? "approved" : "rejected",
      },
      { new: true }
    ).populate({
      path: "campaignId",
      select: "name description", // Remove the nested populate
    });

    if (!image) {
      return NextResponse.json(
        { success: false, error: "Image not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: image._id.toString(),
        img: image.img,
        name: image.name,
        description: image.description,
        date: image.date.toISOString(),
        approved: image.approved,
        status: image.status,
        campaignId: image.campaignId._id.toString(),
        campaignName: image.campaignId.name,
        // Remove streamId and streamName since Campaign no longer has streamId
        source: image.source,
      },
    });
  } catch (error) {
    console.error("Error moderating image:", error);
    return NextResponse.json(
      { success: false, error: "Failed to moderate image" },
      { status: 500 }
    );
  }
}
