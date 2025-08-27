/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Campaign } from "@/models";

export async function GET() {
  try {
    await dbConnect();

    const campaigns = await Campaign.find()
      .populate("imageIds", "img name description approved status date")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: campaigns.map((campaign) => ({
        id: campaign._id.toString(),
        name: campaign.name,
        description: campaign.description,
        images: campaign.imageIds.map((image: any) => ({
          id: image._id.toString(),
          img: image.img,
          name: image.name,
          description: image.description,
          approved: image.approved,
          status: image.status,
          date: image.date.toISOString(),
        })),
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
    const { name, description, imageIds, streamId } = body;

    if (!name || !streamId) {
      return NextResponse.json(
        { success: false, error: "name and streamId are required" },
        { status: 400 }
      );
    }

    const campaign = await Campaign.create({
      name,
      description,
      imageIds: imageIds || [],
      streamId,
    });

    const populatedCampaign = await Campaign.findById(campaign._id)
      .populate("streamId", "name")
      .populate("imageIds", "img name description approved status date");

    return NextResponse.json(
      {
        success: true,
        data: {
          id: populatedCampaign._id.toString(),
          name: populatedCampaign.name,
          description: populatedCampaign.description,
          images: populatedCampaign.imageIds.map((image: any) => ({
            id: image._id.toString(),
            img: image.img,
            name: image.name,
            description: image.description,
            approved: image.approved,
            status: image.status,
            date: image.date.toISOString(),
          })),
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
    return NextResponse.json(
      { success: false, error: "Failed to create campaign" },
      { status: 500 }
    );
  }
}
