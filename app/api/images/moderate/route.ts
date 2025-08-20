import { NextResponse } from "next/server";
import { getImages, writeImages } from "@/lib/data";

export async function POST(request: Request) {
  try {
    const { id, approved } = await request.json();

    const images = await getImages();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const imageIndex = images.findIndex((image: any) => image.id === id);

    if (imageIndex === -1) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    images[imageIndex].approved = approved;

    await writeImages(images);

    return NextResponse.json({ success: true, image: images[imageIndex] });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update image status" },
      { status: 500 }
    );
  }
}
