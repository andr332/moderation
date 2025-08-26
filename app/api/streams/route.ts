/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Stream } from "@/models";

export async function GET() {
  try {
    await dbConnect();

    const streams = await Stream.find()
      .populate("campaignIds", "name description")
      .sort({ createdAt: -1 });

    const streamsData = streams.map((stream) => ({
      id: stream._id.toString(),
      name: stream.name,
      campaigns: stream.campaignIds.map((campaign: any) => ({
        id: campaign._id.toString(),
        name: campaign.name,
        description: campaign.description,
      })),
      logoUrl: stream.logoFileId
        ? `${process.env.NEXT_PUBLIC_APP_URL}/api/files/${stream.logoFileId}`
        : stream.logoUrl,
      widgetConfig: stream.widgetConfig,
      createdAt: stream.createdAt.toISOString(),
      updatedAt: stream.updatedAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: streamsData,
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

    const formData = await req.formData();
    const name = formData.get("name") as string;
    const campaignIds = formData.get("campaignIds") as string;
    const logoFile = formData.get("logo") as File;
    const displayMode = formData.get("displayMode") as string;
    const color = formData.get("color") as string;
    const showLogo = formData.get("showLogo") as string;

    if (!name) {
      return NextResponse.json(
        { success: false, error: "name is required" },
        { status: 400 }
      );
    }

    let logoFileId = undefined;

    // Handle logo upload
    if (logoFile) {
      try {
        // Upload the file to GridFS
        const uploadFormData = new FormData();
        uploadFormData.append("file", logoFile);

        const uploadResponse = await fetch(`${req.nextUrl.origin}/api/upload`, {
          method: "POST",
          body: uploadFormData,
        });

        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json();
          logoFileId = uploadResult.data.fileId;
        } else {
          console.error("Failed to upload logo");
        }
      } catch (error) {
        console.error("Error uploading logo:", error);
      }
    }

    // Parse campaign IDs
    const parsedCampaignIds = campaignIds ? JSON.parse(campaignIds) : [];

    // Parse widget config
    const widgetConfig = {
      displayMode: displayMode === "slideshow" ? "slideshow" : "grid",
      color: color || "#3B82F6",
      showLogo: showLogo === "true",
    };

    const stream = await Stream.create({
      name,
      campaignIds: parsedCampaignIds,
      logoFileId,
      widgetConfig,
    });

    // Populate the campaign data for the response
    const populatedStream = await Stream.findById(stream._id).populate(
      "campaignIds",
      "name description"
    );

    const streamData = {
      id: populatedStream._id.toString(),
      name: populatedStream.name,
      campaigns: populatedStream.campaignIds.map((campaign: any) => ({
        id: campaign._id.toString(),
        name: campaign.name,
        description: campaign.description,
      })),
      logoUrl: populatedStream.logoFileId
        ? `${process.env.NEXT_PUBLIC_APP_URL}/api/files/${populatedStream.logoFileId}`
        : undefined,
      widgetConfig: populatedStream.widgetConfig,
      createdAt: populatedStream.createdAt.toISOString(),
      updatedAt: populatedStream.updatedAt.toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        data: streamData,
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
