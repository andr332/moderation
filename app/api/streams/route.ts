import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Stream from "@/models/Streams";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const streams = await Stream.find({ isActive: true })
      .populate("campaignIds", "name description")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: streams.map((stream) => ({
        id: stream._id.toString(),
        name: stream.name,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        campaigns: stream.campaignIds.map((campaign: any) => ({
          id: campaign._id.toString(),
          name: campaign.name,
          description: campaign.description,
        })),
        logoUrl: stream.logoUrl,
        isActive: stream.isActive,
        displaySettings: stream.displaySettings,
        createdAt: stream.createdAt.toISOString(),
        updatedAt: stream.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Error fetching streams:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch streams" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const body = await req.json();
    const { name, campaignIds, logoUrl, displaySettings } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: "name is required" },
        { status: 400 }
      );
    }

    const stream = await Stream.create({
      name,
      campaignIds: campaignIds || [],
      logoUrl,
      displaySettings: displaySettings || {
        mode: "grid",
        autoPlay: false,
        slideInterval: 5,
        showMetadata: true,
        theme: {
          primaryColor: "#3B82F6",
          backgroundColor: "#F8FAFC",
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: stream._id.toString(),
          name: stream.name,
          campaignIds: stream.campaignIds,
          logoUrl: stream.logoUrl,
          isActive: stream.isActive,
          displaySettings: stream.displaySettings,
          createdAt: stream.createdAt.toISOString(),
          updatedAt: stream.updatedAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating stream:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create stream" },
      { status: 500 }
    );
  }
}
