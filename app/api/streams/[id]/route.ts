/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Stream } from "@/models";
import { deleteFileFromGridFS } from "@/lib/gridfs";

// Helper function to add CORS headers
function addCorsHeaders(response: NextResponse) {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  return response;
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS() {
  return addCorsHeaders(new NextResponse(null, { status: 200 }));
}

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
      const response = NextResponse.json(
        { success: false, error: "Stream not found" },
        { status: 404 }
      );
      return addCorsHeaders(response);
    }

    const response = NextResponse.json({
      success: true,
      data: {
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
      },
    });

    return addCorsHeaders(response);
  } catch (error) {
    console.error("Error fetching stream:", error);
    const response = NextResponse.json(
      { success: false, error: "Failed to fetch stream" },
      { status: 500 }
    );
    return addCorsHeaders(response);
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
    const displayMode = formData.get("displayMode") as string;
    const color = formData.get("color") as string;
    const showLogo = formData.get("showLogo") as string;

    if (!name) {
      return NextResponse.json(
        { success: false, error: "name is required" },
        { status: 400 }
      );
    }

    const stream = await Stream.findById(id);
    if (!stream) {
      return NextResponse.json(
        { success: false, error: "Stream not found" },
        { status: 404 }
      );
    }

    let logoFileId = stream.logoFileId;

    // Handle logo upload
    if (logoFile) {
      try {
        // Delete old logo if exists
        if (stream.logoFileId) {
          await deleteFileFromGridFS(stream.logoFileId);
        }

        // Upload the new file to GridFS
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

    const updatedStream = await Stream.findByIdAndUpdate(
      id,
      {
        name,
        campaignIds: parsedCampaignIds,
        logoFileId,
        widgetConfig,
        updatedAt: new Date(),
      },
      { new: true }
    ).populate("campaignIds", "name description");

    const streamData = {
      id: updatedStream._id.toString(),
      name: updatedStream.name,
      campaigns: updatedStream.campaignIds.map((campaign: any) => ({
        id: campaign._id.toString(),
        name: campaign.name,
        description: campaign.description,
      })),
      logoUrl: updatedStream.logoFileId
        ? `${process.env.NEXT_PUBLIC_APP_URL}/api/files/${updatedStream.logoFileId}`
        : undefined,
      widgetConfig: updatedStream.widgetConfig,
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

    // Delete logo file if exists
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
