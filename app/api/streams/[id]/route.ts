/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Stream, Campaign } from "@/models";
import {
  uploadToGridFS,
  getFileFromGridFS,
  deleteFileFromGridFS,
} from "@/lib/gridfs";

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
        logoUrl: stream.logoFileId
          ? `/api/files/${stream.logoFileId}`
          : stream.logoUrl,
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
        ? `/api/files/${populatedStream.logoFileId}`
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

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await context.params;

    const formData = await req.formData();
    const name = formData.get("name") as string;
    const campaignIds = formData.get("campaignIds") as string;
    const logoFile = formData.get("logo") as File;

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

    const updatedStream = await Stream.findByIdAndUpdate(
      id,
      {
        name,
        campaignIds: parsedCampaignIds,
        ...(logoFileId && { logoFileId }),
      },
      { new: true }
    ).populate("campaignIds", "name description");

    if (!updatedStream) {
      return NextResponse.json(
        { success: false, error: "Stream not found" },
        { status: 404 }
      );
    }

    const streamData = {
      id: updatedStream._id.toString(),
      name: updatedStream.name,
      campaigns: updatedStream.campaignIds.map((campaign: any) => ({
        id: campaign._id.toString(),
        name: campaign.name,
        description: campaign.description,
      })),
      logoUrl: updatedStream.logoFileId
        ? `/api/files/${updatedStream.logoFileId}`
        : undefined,
      createdAt: updatedStream.createdAt.toISOString(),
      updatedAt: updatedStream.updatedAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: streamData,
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

    const stream = await Stream.findById(id);

    if (!stream) {
      return NextResponse.json(
        { success: false, error: "Stream not found" },
        { status: 404 }
      );
    }

    // Delete logo file from GridFS if it exists
    if (stream.logoFileId) {
      await deleteFileFromGridFS(stream.logoFileId);
    }

    await Stream.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Stream deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting stream:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete stream" },
      { status: 500 }
    );
  }
}
