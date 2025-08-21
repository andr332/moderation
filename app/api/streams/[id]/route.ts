import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Stream from "@/models/Streams";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await context.params;

    const stream = await Stream.findById(id).populate(
      "campaignIds",
      "name description"
    );

    if (!stream) {
      return NextResponse.json(
        { success: false, error: "Stream not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
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
      },
    });
  } catch (error) {
    console.error("Error fetching stream:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch stream" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await context.params;

    const body = await req.json();
    const { name, campaignIds, logoUrl, displaySettings, isActive } = body;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};

    if (name) updateData.name = name;
    if (campaignIds) updateData.campaignIds = campaignIds;
    if (logoUrl !== undefined) updateData.logoUrl = logoUrl;
    if (displaySettings) updateData.displaySettings = displaySettings;
    if (isActive !== undefined) updateData.isActive = isActive;

    const stream = await Stream.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true }
    );

    if (!stream) {
      return NextResponse.json(
        { success: false, error: "Stream not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
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
    });
  } catch (error) {
    console.error("Error updating stream:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update stream" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await context.params;

    const stream = await Stream.findByIdAndUpdate(
      id,
      { isActive: false, updatedAt: new Date() },
      { new: true }
    );

    if (!stream) {
      return NextResponse.json(
        { success: false, error: "Stream not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Stream deactivated successfully",
    });
  } catch (error) {
    console.error("Error deleting stream:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete stream" },
      { status: 500 }
    );
  }
}
