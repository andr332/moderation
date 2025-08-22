import { dbConnect } from "@/lib/db";

import ModerationQueue from "@/components/ModerationQueue";
import { Image } from "@/models";

async function getImages() {
  try {
    await dbConnect();

    const images = await Image.find({})
      .populate("campaignId", "name description")
      .populate("streamId", "name")
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
      streamId: img.streamId?._id.toString(),
      streamName: img.streamId?.name,
      source: img.source,
    }));
  } catch (error) {
    console.error("Error fetching images:", error);
    return [];
  }
}

export default async function Home() {
  const images = await getImages();

  return <ModerationQueue initialData={images} />;
}
