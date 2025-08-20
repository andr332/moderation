import { NextResponse } from "next/server";
import { getImages } from "@/lib/data";

export async function GET() {
  try {
    const images = await getImages();
    return NextResponse.json(images);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to read images data" },
      { status: 500 }
    );
  }
}
