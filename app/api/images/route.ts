import Image from "@/models/Image";
import { dbConnect } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const campaignId = searchParams.get("campaignId");
    const streamId = searchParams.get("streamId");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};

    if (status) query.status = status;
    if (campaignId) query.campaignId = campaignId;
    if (streamId) query.streamId = streamId;

    const images = await Image.find(query)
      // .populate("campaignId", "name description")
      // .populate("streamId", "name")
      .sort({ createdAt: -1 });

    console.log("Fetched images:", images);

    return NextResponse.json({
      success: true,
      data: images.map((img) => ({
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
      })),
    });
  } catch (error) {
    console.error("Error fetching images:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch images" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const body = await req.json();
    const {
      img,
      name,
      description,
      campaignId,
      streamId,
      source = "manual",
    } = body;

    if (!img || !name || !campaignId) {
      return NextResponse.json(
        { success: false, error: "img, name, and campaignId are required" },
        { status: 400 }
      );
    }

    const image = await Image.create({
      img,
      name,
      description,
      campaignId,
      streamId: streamId || null,
      source,
      status: "pending",
      approved: false,
    });

    const populatedImage = await Image.findById(image._id)
      .populate("campaignId", "name")
      .populate("streamId", "name");

    return NextResponse.json(
      {
        success: true,
        data: {
          id: populatedImage._id.toString(),
          img: populatedImage.img,
          name: populatedImage.name,
          description: populatedImage.description,
          date: populatedImage.date.toISOString(),
          approved: populatedImage.approved,
          status: populatedImage.status,
          campaignId: populatedImage.campaignId._id.toString(),
          campaignName: populatedImage.campaignId.name,
          streamId: populatedImage.streamId?._id.toString(),
          streamName: populatedImage.streamId?.name,
          source: populatedImage.source,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating image:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create image" },
      { status: 500 }
    );
  }
}
