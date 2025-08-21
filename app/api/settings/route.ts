import { NextResponse } from "next/server";

export async function GET() {
  try {
    const settings = {
      autoApprove: false,
      displayMode: "grid",
      photosPerPage: 20,
      showCaptions: true,
    };
    return NextResponse.json(settings);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to read settings" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const newSettings = await request.json();
    // await writeSettings(newSettings);
    return NextResponse.json({ success: true, settings: newSettings });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to save settings" },
      { status: 500 }
    );
  }
}
