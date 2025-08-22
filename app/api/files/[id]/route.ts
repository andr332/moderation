import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { getFileFromGridFS } from "@/lib/gridfs";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { params } = await context;
    const fileId = await (await params)?.id;
    const fileBuffer = await getFileFromGridFS(fileId);

    // Get file metadata from GridFS
    const { gridFSBucket } = await import("@/lib/gridfs").then((m) =>
      m.initGridFS()
    );

    const files = await gridFSBucket
      .find({ _id: new (await import("mongoose")).Types.ObjectId(fileId) })
      .toArray();
    const file = files[0];

    if (!file) {
      return NextResponse.json(
        { success: false, error: "File not found" },
        { status: 404 }
      );
    }

    // Convert Buffer to Uint8Array for NextResponse
    const uint8Array = new Uint8Array(fileBuffer);

    return new NextResponse(uint8Array, {
      headers: {
        "Content-Type":
          file.metadata?.contentType || "application/octet-stream",
        "Content-Disposition": `inline; filename="${file.filename}"`,
        "Cache-Control": "public, max-age=31536000", // Cache for 1 year
      },
    });
  } catch (error) {
    console.error("Error serving file:", error);
    return NextResponse.json(
      { success: false, error: "File not found" },
      { status: 404 }
    );
  }
}
