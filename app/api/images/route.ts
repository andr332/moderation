/* eslint-disable @typescript-eslint/no-explicit-any */
import { dbConnect } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { Image, Stream } from "@/models";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const campaignId = searchParams.get("campaignId");
    const streamId = searchParams.get("streamId");
    const assignment = searchParams.get("assignment");

    console.log("=== API DEBUG START ===");
    console.log("Request URL:", req.url);
    console.log("Status filter:", status);
    console.log("Campaign ID filter:", campaignId);
    console.log("Stream ID filter:", streamId);
    console.log("Assignment filter:", assignment);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};

    if (status) query.status = status;
    if (campaignId) query.campaignId = campaignId;

    console.log("Initial query:", query);

    // Handle stream filtering - get campaign IDs from the stream
    if (streamId) {
      try {
        console.log("Looking for stream:", streamId);

        // Get the stream and its campaign IDs
        const stream = await Stream.findById(streamId).select("campaignIds");

        if (!stream) {
          console.log("Stream not found:", streamId);
          return NextResponse.json({
            success: true,
            data: [],
          });
        }

        if (!stream.campaignIds || stream.campaignIds.length === 0) {
          console.log("No campaigns in stream:", streamId);
          return NextResponse.json({
            success: true,
            data: [],
          });
        }

        // Filter images by campaign IDs from the stream
        query.campaignId = { $in: stream.campaignIds };

        console.log("Stream campaign IDs:", stream.campaignIds);
        console.log("Query after stream filter:", query);
      } catch (error) {
        console.error("Error finding stream:", error);
        return NextResponse.json({
          success: true,
          data: [],
        });
      }
    }

    // Handle assignment filter
    if (assignment === "assigned") {
      query.streamId = { $ne: null }; // Images that have a stream assigned
    } else if (assignment === "unassigned") {
      query.streamId = null; // Images that don't have a stream assigned
    }

    console.log("Final query before Image.find:", query);

    const images = await Image.find(query)
      .populate({
        path: "campaignId",
        select: "name description", // Remove the nested populate since Campaign no longer has streamId
      })
      .sort({ createdAt: -1 });

    console.log("Raw images found:", images.length);
    console.log(
      "Raw images data:",
      images.map((img) => ({
        id: img._id.toString(),
        name: img.name,
        status: img.status,
        approved: img.approved,
        campaignId: img.campaignId?._id?.toString(),
        campaignName: img.campaignId?.name,
      }))
    );

    // Debug logging
    console.log("Stream ID:", streamId);
    console.log("Query:", query);
    console.log("Found images:", images.length);

    const processedData = images.map((img) => ({
      id: img._id.toString(),
      img: img.img,
      name: img.name,
      description: img.description,
      date: img.date.toISOString(),
      approved: img.approved,
      status: img.status,
      campaignId: img.campaignId._id.toString(),
      campaignName: img.campaignId.name,
      source: img.source,
    }));

    console.log("Processed data:", processedData);
    console.log("=== API DEBUG END ===");

    return NextResponse.json({
      success: true,
      data: processedData,
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
    const { name, campaignIds, logoUrl } = body;

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
      logoUrl: populatedStream.logoUrl,
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
