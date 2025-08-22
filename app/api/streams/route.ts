/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Stream } from "@/models";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    console.log("streams");

    const streams = await Stream.find()
      .populate("campaignIds", "name description")
      .sort({ createdAt: -1 });
    console.log("streams datat", streams);

    const streamsData = streams.map((stream) => ({
      id: stream._id.toString(),
      name: stream.name,
      campaigns: stream.campaignIds.map((campaign: any) => ({
        id: campaign._id.toString(),
        name: campaign.name,
        description: campaign.description,
      })),
      logoUrl: stream.logoFileId
        ? `http://localhost:3001/api/files/${stream.logoFileId}`
        : stream.logoUrl,
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

    const stream = await Stream.create({
      name,
      campaignIds: parsedCampaignIds,
      logoFileId,
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
        ? `http://localhost:3001/api/files/${populatedStream.logoFileId}`
        : undefined,
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
