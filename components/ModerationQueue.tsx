"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ImageData {
  id: string;
  img: string;
  name: string;
  description?: string;
  date: string;
  approved: boolean;
  status: "pending" | "approved" | "rejected";
  campaignId: string;
  campaignName: string;
  streamId?: string;
  streamName?: string;
  source: "internal" | "external_app" | "manual";
}

export default function ModeratorView() {
  const [data, setData] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/images?status=pending");
      console.log("Fetching pending images:", response);
      // if (!response.ok) {
      //   throw new Error("Failed to fetch images");
      // }
      const result = await response.json();
      console.log("Fetched pending images:", result);

      if (result.success) {
        setData(result.data);
        setCurrentIndex(0);
      } else {
        console.error("API Error:", result.error);
        setData([]);
      }
    } catch (error) {
      console.error("Error fetching images:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleModerate = async (approved: boolean) => {
    const currentImage = data[currentIndex];
    if (!currentImage) return;

    try {
      const response = await fetch("/api/images/moderate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: currentImage.id, approved }),
      });

      if (!response.ok) {
        throw new Error("Failed to moderate image");
      }

      const result = await response.json();
      if (result.success) {
        // Move to next image
        setCurrentIndex((prev) => prev + 1);
        toast.success(approved ? "Image approved!" : "Image rejected!");
      } else {
        console.error("Moderation failed:", result.error);
        toast.error("Failed to moderate image");
      }
    } catch (error) {
      console.error("Error moderating image:", error);
      toast.error("Error moderating image");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-lg">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-lg font-medium text-slate-600">
            Loading images...
          </p>
        </div>
      </div>
    );
  }

  if (data.length === 0 || currentIndex >= data.length) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <h2 className="text-2xl font-bold">🎉 No more pending images!</h2>
        <p className="text-gray-600 mt-2">All images have been moderated</p>
        <Button className="mt-4" onClick={fetchData}>
          Refresh
        </Button>
      </div>
    );
  }

  const currentImage = data[currentIndex];

  return (
    <div className="flex flex-col items-center justify-center mt-10">
      <div className="max-w-3xl w-full flex flex-col items-center">
        <div className="mb-4 text-center">
          <p className="text-sm text-gray-500">
            Image {currentIndex + 1} of {data.length}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Campaign: {currentImage.campaignName}
            {currentImage.streamName && ` • Stream: ${currentImage.streamName}`}
          </p>
        </div>

        {/* Fullscreen Image */}
        <Image
          src={currentImage.img}
          alt={currentImage.name}
          width={800}
          height={800}
          className="object-contain rounded-xl shadow-lg max-h-[80vh] w-auto"
        />

        {/* Meta info */}
        <div className="mt-4 text-center">
          <p className="text-lg font-semibold">{currentImage.name}</p>
          {currentImage.description && (
            <p className="text-sm text-gray-600 mt-1">
              {currentImage.description}
            </p>
          )}
          <p className="text-sm text-gray-400 mt-1">
            {new Date(currentImage.date).toLocaleDateString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Source: {currentImage?.source?.replace("_", " ")}
          </p>
        </div>

        {/* Approve / Reject buttons */}
        <div className="flex gap-6 mt-6">
          <Button
            variant="destructive"
            className="px-8 py-4 text-lg"
            onClick={() => handleModerate(false)}
          >
            Reject
          </Button>
          <Button
            className="px-8 py-4 text-lg"
            onClick={() => handleModerate(true)}
          >
            Approve
          </Button>
        </div>
      </div>
    </div>
  );
}
