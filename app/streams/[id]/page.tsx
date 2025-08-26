/* eslint-disable @typescript-eslint/no-explicit-any */
import { dbConnect } from "@/lib/db";
import { Stream } from "@/models";
import { notFound } from "next/navigation";
import React from "react";
import StreamDetails from "@/components/StreamDetails";
import { unstable_noStore as noStore } from "next/cache";

interface StreamDetailPageProps {
  params: Promise<{ id: string }>;
}

export const revalidate = 0;

async function getStreamData(streamId: string) {
  noStore();
  try {
    await dbConnect();

    const stream = await Stream.findById(streamId)
      .populate({
        path: "campaignIds",
        populate: {
          path: "imageIds",
          model: "Image",
        },
      })
      .lean();

    if (!stream) {
      return null;
    }

    // Type assertion to fix TypeScript confusion
    const streamDoc = stream as any;

    // Serialize the stream data
    const streamData = {
      id: streamDoc._id.toString(),
      name: streamDoc.name,
      logoUrl: streamDoc.logoFileId
        ? `${process.env.NEXT_PUBLIC_APP_URL}/api/files/${streamDoc.logoFileId}`
        : streamDoc.logoUrl,
      widgetConfig: streamDoc.widgetConfig
        ? {
            displayMode: streamDoc.widgetConfig.displayMode,
            color: streamDoc.widgetConfig.color,
            showLogo: streamDoc.widgetConfig.showLogo,
          }
        : undefined,
      createdAt: streamDoc.createdAt.toISOString(),
      updatedAt: streamDoc.updatedAt.toISOString(),
    };

    // Serialize campaigns with their images
    const campaignsData = streamDoc?.campaignIds?.map((campaign: any) => ({
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
    }));

    // Get all images for this stream (from all campaigns)
    const allImages = streamDoc?.campaignIds?.flatMap((campaign: any) =>
      campaign.imageIds.map((image: any) => ({
        id: image._id.toString(),
        img: image.img,
        name: image.name,
        description: image.description,
        approved: image.approved,
        status: image.status,
        date: image.date.toISOString(),
        campaignId: campaign._id.toString(),
        campaignName: campaign.name,
      }))
    );

    return {
      stream: streamData,
      campaigns: campaignsData,
      images: allImages,
    };
  } catch (error) {
    console.error("Error fetching stream data:", error);
    return null;
  }
}

const StreamByIdPage = async ({ params }: StreamDetailPageProps) => {
  const { id } = await params;
  const data = await getStreamData(id);

  if (!data) {
    notFound();
  }

  return (
    <StreamDetails
      stream={data.stream}
      campaigns={data.campaigns}
      images={data.images}
    />
  );
};

export default StreamByIdPage;
