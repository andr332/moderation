import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Image, Stream } from "@/models";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const streamId = searchParams.get("streamId");

    // Set up SSE headers
    const responseHeaders = {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Cache-Control",
    };

    const stream = new ReadableStream({
      start(controller) {
        sendInitialData(controller, streamId);

        // Set up interval to check for updates (every 5 seconds)
        const interval = setInterval(async () => {
          try {
            const images = await getStreamImages(streamId);
            const data = JSON.stringify({
              type: "update",
              timestamp: new Date().toISOString(),
              images: images,
            });

            controller.enqueue(`data: ${data}\n\n`);
          } catch (error) {
            console.error("Error fetching updates:", error);
          }
        }, 5000);

        // Clean up on close
        req.signal.addEventListener("abort", () => {
          clearInterval(interval);
          controller.close();
        });
      },
    });

    return new Response(stream, { headers: responseHeaders });
  } catch (error) {
    console.error("Error setting up SSE:", error);
    return NextResponse.json(
      { success: false, error: "Failed to set up real-time updates" },
      { status: 500 }
    );
  }
}

async function sendInitialData(
  controller: ReadableStreamDefaultController,
  streamId: string | null
) {
  try {
    const images = await getStreamImages(streamId);
    const data = JSON.stringify({
      type: "initial",
      timestamp: new Date().toISOString(),
      images: images,
    });

    controller.enqueue(`data: ${data}\n\n`);
  } catch (error) {
    console.error("Error sending initial data:", error);
  }
}

async function getStreamImages(streamId: string | null) {
  await dbConnect();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: any = { status: "approved" };

  // Handle stream filtering - get campaign IDs from the stream
  if (streamId) {
    // Get the stream and its campaign IDs
    const stream = await Stream.findById(streamId).select("campaignIds");

    if (stream && stream.campaignIds && stream.campaignIds.length > 0) {
      // Filter images by campaign IDs from the stream
      query.campaignId = { $in: stream.campaignIds };
    } else {
      // No campaigns in stream, return empty array
      return [];
    }
  }

  const images = await Image.find(query)
    .populate({
      path: "campaignId",
      select: "name description", // Remove the nested populate
    })
    .sort({ createdAt: -1 });

  return images.map((img) => ({
    id: img._id.toString(),
    img: img.img,
    name: img.name,
    description: img.description,
    date: img.date.toISOString(),
    approved: img.approved,
    status: img.status,
    campaignId: img.campaignId._id.toString(),
    campaignName: img.campaignId.name,
    // Remove streamId and streamName since Campaign no longer has streamId
    source: img.source,
  }));
}
