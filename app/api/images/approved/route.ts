import { NextResponse } from "next/server";
import { getImages } from "@/lib/data";

export async function GET() {
  try {
    const images = await getImages();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const approvedImages = images.filter((image: any) => image.approved);
    return new NextResponse(JSON.stringify(approvedImages), {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error(error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to read images data" }),
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      }
    );
  }
}
