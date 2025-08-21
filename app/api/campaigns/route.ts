import { NextRequest, NextResponse } from "next/server";
import Campaign from "@/models/Campaign";
import { dbConnect } from "@/lib/db";

export async function GET() {
  try {
    await dbConnect();

    const campaigns = await Campaign.find()
      .populate("streamId", "name")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: campaigns.map((campaign) => ({
        id: campaign._id.toString(),
        name: campaign.name,
        description: campaign.description,
        images: campaign.images,
        streamId: campaign.streamId._id.toString(),
        streamName: campaign.streamId.name,
        createdAt: campaign.createdAt.toISOString(),
        updatedAt: campaign.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch campaigns" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const body = await req.json();
    const { name, description, images, streamId } = body;

    if (!name || !images || !streamId) {
      return NextResponse.json(
        { success: false, error: "name, images, and streamId are required" },
        { status: 400 }
      );
    }

    const campaign = await Campaign.create({
      name,
      description,
      images,
      streamId,
    });

    const populatedCampaign = await Campaign.findById(campaign._id).populate(
      "streamId",
      "name"
    );

    return NextResponse.json(
      {
        success: true,
        data: {
          id: populatedCampaign._id.toString(),
          name: populatedCampaign.name,
          description: populatedCampaign.description,
          images: populatedCampaign.images,
          streamId: populatedCampaign.streamId._id.toString(),
          streamName: populatedCampaign.streamId.name,
          createdAt: populatedCampaign.createdAt.toISOString(),
          updatedAt: populatedCampaign.updatedAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating campaign:", error);
    // if (error?.code === 11000) {
    //   return NextResponse.json(
    //     { success: false, error: "Campaign name already exists" },
    //     { status: 409 }
    //   );
    // }
    return NextResponse.json(
      { success: false, error: "Failed to create campaign" },
      { status: 500 }
    );
  }
}
