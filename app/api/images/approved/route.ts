import { NextRequest, NextResponse } from "next/server";
import Image from "@/models/Image";
import { dbConnect } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const streamId = searchParams.get("streamId");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = { status: "approved" };

    if (streamId) {
      query.streamId = streamId;
    }

    const images = await Image.find(query)
      .populate("campaignId", "name description")
      .populate("streamId", "name")
      .sort({ createdAt: -1 });

    return NextResponse.json(
      images.map((img) => ({
        id: img._id.toString(),
        img: img.img,
        name: img.name,
        description: img.description,
        date: img.date.toISOString(),
        approved: img.approved,
        status: img.status,
        campaignId: img.campaignId._id.toString(),
        campaignName: img.campaignId.name,
        streamId: img.streamId?._id.toString(),
        streamName: img.streamId?.name,
        source: img.source,
      }))
    );
  } catch (error) {
    console.error("Error fetching approved images:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch approved images",
      },
      { status: 500 }
    );
  }
}
