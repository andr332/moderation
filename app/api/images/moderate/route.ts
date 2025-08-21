import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Image from '@/models/Image';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const { id, approved } = await req.json();
    
    if (!id || typeof approved !== 'boolean') {
      return NextResponse.json({ 
        success: false, 
        error: 'id and approved (boolean) are required' 
      }, { status: 400 });
    }

    const status = approved ? 'approved' : 'rejected';
    
    const image = await Image.findByIdAndUpdate(
      id, 
      { 
        status, 
        approved,
        updatedAt: new Date()
      }, 
      { new: true }
    );

    if (!image) {
      return NextResponse.json({ 
        success: false, 
        error: 'Image not found' 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      data: {
        id: image._id.toString(),
        img: image.img,
        name: image.name,
        description: image.description,
        date: image.date.toISOString(),
        approved: image.approved,
        status: image.status,
        campaignId: image.campaignId.toString(),
        streamId: image.streamId?.toString()
      }
    });
  } catch (error) {
    console.error("Error moderating image:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to moderate image" 
    }, { status: 500 });
  }
}