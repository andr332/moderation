"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ImageType {
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

function WidgetComponent() {
  const searchParams = useSearchParams();
  const displayMode = searchParams.get("displayMode") || "slideshow";
  const streamId = searchParams.get("streamId");

  const [images, setImages] = useState<ImageType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(false);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const url = streamId
          ? `/api/images?status=approved&streamId=${streamId}`
          : "/api/images?status=approved";

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Failed to fetch images");
        }
        const result = await response.json();

        if (result.success) {
          setImages(result.data);
        } else {
          throw new Error(result.error || "Failed to fetch images");
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [streamId]);

  // Auto-play functionality for slideshow
  useEffect(() => {
    if (displayMode === "slideshow" && isAutoPlay && images.length > 0) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % images.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isAutoPlay, images.length, displayMode]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-lg">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-lg font-medium text-slate-600">
            Loading gallery...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="text-center space-y-4 p-8 bg-white rounded-2xl shadow-lg max-w-md mx-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <span className="text-red-500 text-2xl">⚠</span>
          </div>
          <h2 className="text-xl font-semibold text-slate-800">
            Something went wrong
          </h2>
          <p className="text-slate-600">Error: {error}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center space-y-4 p-8 bg-white rounded-2xl shadow-lg max-w-md mx-4">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
            <span className="text-slate-500 text-2xl">📷</span>
          </div>
          <h2 className="text-xl font-semibold text-slate-800">
            No images available
          </h2>
          <p className="text-slate-600">
            {streamId
              ? "This stream has no approved images yet."
              : "No approved images found."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="sticky top-0 bg-white/50 backdrop-blur-xl z-40">
        <div className="max-w-[1460px] mx-auto">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                Gallery Widget
              </h1>
              <p className="text-sm text-slate-600">
                {images.length} images • {displayMode} view
                {streamId &&
                  images[0]?.streamName &&
                  ` • ${images[0].streamName}`}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {displayMode === "slideshow" && (
                <Button
                  onClick={() => setIsAutoPlay(!isAutoPlay)}
                  variant="outline"
                  size="sm"
                  className="hidden sm:flex"
                >
                  {isAutoPlay ? (
                    <Pause className="w-4 h-4 mr-2" />
                  ) : (
                    <Play className="w-4 h-4 mr-2" />
                  )}
                  {isAutoPlay ? "Pause" : "Play"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-[1460px] mx-auto">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {displayMode === "grid" ? (
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6">
              {images.map((image, index) => (
                <div
                  key={image.id}
                  className="mb-6 break-inside-avoid group cursor-pointer"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden border border-slate-200/50 hover:border-slate-300">
                    <div className="relative overflow-hidden">
                      <Image
                        src={image.img}
                        alt={image.name}
                        width={500}
                        height={350}
                        className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                        <Badge
                          variant="secondary"
                          className="text-xs backdrop-blur-sm"
                        >
                          {new Date(image.date).toLocaleDateString()}
                        </Badge>
                      </div>
                    </div>

                    <div className="p-5 space-y-2">
                      <h3 className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2">
                        {image.name}
                      </h3>
                      {image.description && (
                        <p className="text-sm text-slate-600 line-clamp-2">
                          {image.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-500">
                          {new Date(image.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                        <p className="text-xs text-slate-400">
                          {image.campaignName}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="relative max-w-5xl mx-auto">
              <div className="relative overflow-hidden rounded-2xl shadow-2xl bg-white">
                <div
                  className="flex transition-transform duration-700 ease-in-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {images.map((image) => (
                    <div
                      key={image.id}
                      className="w-full flex-shrink-0 relative"
                    >
                      <div className="relative h-64 sm:h-96 lg:h-[500px]">
                        <Image
                          src={image.img}
                          alt={image.name}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 from-black/50 via-transparent to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                          <div className="max-w-lg">
                            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                              {image.name}
                            </h2>
                            {image.description && (
                              <p className="text-white/90 text-sm sm:text-base mb-2">
                                {image.description}
                              </p>
                            )}
                            <p className="text-white/90 text-sm sm:text-base">
                              {new Date(image.date).toLocaleDateString(
                                "en-US",
                                {
                                  weekday: "long",
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )}
                            </p>
                            <p className="text-white/80 text-xs mt-1">
                              {image.campaignName}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Navigation Buttons */}
                {images.length > 1 && (
                  <>
                    <Button
                      onClick={prevSlide}
                      variant="ghost"
                      size="icon"
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/60 backdrop-blur-sm hover:bg-white/20 text-white border border-white/20 hover:border-white/40 transition-all duration-200 h-12 w-12 rounded-full"
                    >
                      <ChevronLeft className="w-8 h-8" color="black" />
                    </Button>

                    <Button
                      onClick={nextSlide}
                      variant="ghost"
                      size="icon"
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/60 backdrop-blur-sm hover:bg-white/20 text-white border border-white/20 hover:border-white/40 transition-all duration-200 h-12 w-12 rounded-full"
                    >
                      <ChevronRight className="w-10 h-10" color="black" />
                    </Button>
                  </>
                )}
              </div>

              {/* Slide Indicators */}
              {images.length > 1 && (
                <div className="flex justify-center items-center gap-3 mt-8">
                  <span className="text-sm text-slate-500 hidden sm:block">
                    {currentSlide + 1} of {images.length}
                  </span>
                  <div className="flex gap-2">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`transition-all duration-300 rounded-full ${
                          index === currentSlide
                            ? "w-8 h-3 bg-blue-500"
                            : "w-3 h-3 bg-slate-300 hover:bg-slate-400"
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Progress Bar */}
              {isAutoPlay && (
                <div className="mt-4 bg-slate-200 rounded-full h-1 overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-75 ease-linear"
                    style={{
                      width: "100%",
                      animation: "progress 4s linear infinite",
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Widget() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-lg">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-lg font-medium text-slate-600">Loading...</p>
          </div>
        </div>
      }
    >
      <WidgetComponent />
    </Suspense>
  );
}
