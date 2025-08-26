/* eslint-disable @typescript-eslint/no-explicit-any */
import { dbConnect } from "@/lib/db";
import Stream from "@/models/Streams";
import Campaign from "@/models/Campaign";
import Streams from "@/components/Streams";
import React from "react";
import { unstable_noStore as noStore } from "next/cache";

export const revalidate = 0;

async function getStreamsData() {
  noStore();
  try {
    await dbConnect();

    const [streams, campaigns] = await Promise.all([
      Stream.find()
        .populate("campaignIds", "name description")
        .sort({ createdAt: -1 }),
      Campaign.find()
        .populate("imageIds", "img name description approved status date")
        .sort({ createdAt: -1 }),
    ]);

    // Properly serialize the streams data to avoid circular references
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
      widgetConfig: stream.widgetConfig
        ? {
            displayMode: stream.widgetConfig.displayMode,
            color: stream.widgetConfig.color,
            showLogo: stream.widgetConfig.showLogo,
          }
        : undefined,
      createdAt: stream.createdAt.toISOString(),
      updatedAt: stream.updatedAt.toISOString(),
    }));

    // Properly serialize the campaigns data with images
    const campaignsData = campaigns.map((campaign) => ({
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
    return {
      streams: streamsData,
      campaigns: campaignsData,
    };
  } catch (error) {
    console.error("Error fetching streams data:", error);
    return {
      streams: [],
      campaigns: [],
    };
  }
}

const StreamsPage = async () => {
  const { streams, campaigns } = await getStreamsData();

  return <Streams initialStreams={streams} initialCampaigns={campaigns} />;
};

export default StreamsPage;
