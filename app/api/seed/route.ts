import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Campaign from "@/models/Campaign";
import Image from "@/models/Image";
import Stream from "@/models/Streams";

const sampleStreams = [
  {
    name: "Summer Campaign Gallery",
    logoUrl: "https://picsum.photos/id/23/300/200",
    isActive: true,
    displaySettings: {
      mode: "grid",
      autoPlay: false,
      slideInterval: 5,
      showMetadata: true,
      theme: {
        primaryColor: "#3B82F6",
        backgroundColor: "#F8FAFC",
      },
    },
  },
  {
    name: "Winter Promo Wall",
    logoUrl: "https://picsum.photos/id/33/300/200",
    isActive: true,
    displaySettings: {
      mode: "slideshow",
      autoPlay: true,
      slideInterval: 8,
      showMetadata: false,
      theme: {
        primaryColor: "#DC2626",
        backgroundColor: "#FEF2F2",
      },
    },
  },
  {
    name: "Holiday Customer Stories",
    logoUrl: "https://picsum.photos/id/11/300/200",
    isActive: true,
    displaySettings: {
      mode: "grid",
      autoPlay: false,
      slideInterval: 6,
      showMetadata: true,
      theme: {
        primaryColor: "#059669",
        backgroundColor: "#ECFDF5",
      },
    },
  },
];

const sampleCampaigns = [
  {
    name: "Summer Sale 2024",
    description: "Summer promotional campaign with customer photos",
    images: [
      "https://picsum.photos/id/1/800/600",
      "https://picsum.photos/id/2/800/600",
      "https://picsum.photos/id/3/800/600",
      "https://picsum.photos/id/4/800/600",
    ],
  },
  {
    name: "Beach Vibes Collection",
    description: "Beach and summer lifestyle photos",
    images: [
      "https://picsum.photos/id/5/800/600",
      "https://picsum.photos/id/6/800/600",
      "https://picsum.photos/id/7/800/600",
    ],
  },
  {
    name: "Winter Collection",
    description: "Winter fashion showcase campaign",
    images: [
      "https://picsum.photos/id/8/800/600",
      "https://picsum.photos/id/9/800/600",
      "https://picsum.photos/id/10/800/600",
      "https://picsum.photos/id/11/800/600",
      "https://picsum.photos/id/12/800/600",
    ],
  },
  {
    name: "Customer Stories",
    description: "Real customer testimonials and photos",
    images: [
      "https://picsum.photos/id/13/800/600",
      "https://picsum.photos/id/14/800/600",
      "https://picsum.photos/id/15/800/600",
    ],
  },
];

const sampleImages = [
  {
    img: "https://picsum.photos/id/1/800/600",
    name: "Beach Sunset",
    description: "Beautiful sunset at the beach",
    status: "approved",
    approved: true,
  },
  {
    img: "https://picsum.photos/id/2/800/600",
    name: "Mountain View",
    description: "Scenic mountain landscape",
    status: "pending",
    approved: false,
  },
  {
    img: "https://picsum.photos/id/3/800/600",
    name: "City Lights",
    description: "Urban nighttime photography",
    status: "approved",
    approved: true,
  },
  {
    img: "https://picsum.photos/id/4/800/600",
    name: "Forest Path",
    description: "Peaceful forest trail",
    status: "pending",
    approved: false,
  },
  {
    img: "https://picsum.photos/id/5/800/600",
    name: "Ocean Waves",
    description: "Dynamic ocean waves",
    status: "approved",
    approved: true,
  },
  {
    img: "https://picsum.photos/id/6/800/600",
    name: "Tropical Paradise",
    description: "Beautiful tropical beach",
    status: "approved",
    approved: true,
  },
  {
    img: "https://picsum.photos/id/7/800/600",
    name: "Palm Trees",
    description: "Swaying palm trees",
    status: "pending",
    approved: false,
  },
  {
    img: "https://picsum.photos/id/8/800/600",
    name: "Winter Wonderland",
    description: "Snow-covered landscape",
    status: "approved",
    approved: true,
  },
  {
    img: "https://picsum.photos/id/9/800/600",
    name: "Cozy Cabin",
    description: "Warm cabin in winter",
    status: "pending",
    approved: false,
  },
  {
    img: "https://picsum.photos/id/10/800/600",
    name: "Snowy Mountains",
    description: "Majestic snowy peaks",
    status: "approved",
    approved: true,
  },
  {
    img: "https://picsum.photos/id/11/800/600",
    name: "Ice Lake",
    description: "Frozen lake in winter",
    status: "rejected",
    approved: false,
  },
  {
    img: "https://picsum.photos/id/12/800/600",
    name: "Winter Forest",
    description: "Snow-covered trees",
    status: "approved",
    approved: true,
  },
  {
    img: "https://picsum.photos/id/13/800/600",
    name: "Happy Customer",
    description: "Customer testimonial photo",
    status: "pending",
    approved: false,
  },
  {
    img: "https://picsum.photos/id/14/800/600",
    name: "Product Review",
    description: "Customer with product",
    status: "approved",
    approved: true,
  },
  {
    img: "https://picsum.photos/id/15/800/600",
    name: "Success Story",
    description: "Customer success story",
    status: "pending",
    approved: false,
  },
];

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    console.log("��️ Clearing existing data...");
    await Promise.all([
      Stream.deleteMany({}),
      Campaign.deleteMany({}),
      Image.deleteMany({}),
    ]);

    console.log("🏗️ Creating streams...");
    const createdStreams = await Stream.insertMany(sampleStreams);

    console.log("�� Creating campaigns...");
    const campaignsWithStreamIds = sampleCampaigns.map((campaign, index) => ({
      ...campaign,
      streamId: createdStreams[index % createdStreams.length]._id,
    }));

    const createdCampaigns = await Campaign.insertMany(campaignsWithStreamIds);

    // Update streams with campaign IDs
    console.log("🔗 Linking campaigns to streams...");
    for (let i = 0; i < createdStreams.length; i++) {
      const streamCampaigns = createdCampaigns.filter(
        (campaign) =>
          campaign.streamId.toString() === createdStreams[i]._id.toString()
      );

      await Stream.findByIdAndUpdate(createdStreams[i]._id, {
        campaignIds: streamCampaigns.map((c) => c._id),
      });
    }

    console.log("🖼️ Creating images...");
    const imagesWithCampaignIds = [];
    let imageIndex = 0;

    for (const campaign of createdCampaigns) {
      const campaignImageCount = campaign.images.length;

      for (
        let i = 0;
        i < campaignImageCount && imageIndex < sampleImages.length;
        i++
      ) {
        const imageData = sampleImages[imageIndex];
        imagesWithCampaignIds.push({
          ...imageData,
          campaignId: campaign._id,
          streamId: campaign.streamId,
          source: "manual",
          // Don't include externalId to avoid the unique constraint issue
        });
        imageIndex++;
      }
    }

    const createdImages = await Image.insertMany(imagesWithCampaignIds);

    console.log("✅ Sample data created successfully!");

    return NextResponse.json({
      success: true,
      message: "Sample data created successfully",
      data: {
        streams: createdStreams.length,
        campaigns: createdCampaigns.length,
        images: createdImages.length,
      },
    });
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    return NextResponse.json(
      //   { success: false, error: "Failed to seed data: " + error?.message },
      { success: false, error: "Failed to seed data: " },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const [streamCount, campaignCount, imageCount] = await Promise.all([
      Stream.countDocuments(),
      Campaign.countDocuments(),
      Image.countDocuments(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        streams: streamCount,
        campaigns: campaignCount,
        images: imageCount,
      },
    });
  } catch (error) {
    console.error("Error getting counts:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get counts" },
      { status: 500 }
    );
  }
}
