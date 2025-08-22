"use client";

import { useState, useEffect, Suspense, useRef } from "react";
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
  const color = searchParams.get("color") || "#3B82F6";
  const logo = searchParams.get("logo");

  const [images, setImages] = useState<ImageType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [streamError, setStreamError] = useState<string | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);

  // Parse the color and create CSS variables
  const primaryColor = color;
  const primaryColorLight = `${color}20`; // 20% opacity
  const primaryColorDark = color;

  // Function to fetch images
  const fetchImages = async () => {
    console.log("=== fetchImages function called ===");
    try {
      let url = "/api/images?status=approved";

      if (streamId) {
        url = `/api/images?status=approved&streamId=${streamId}`;
      }

      console.log("=== WIDGET DEBUG START ===");
      console.log("Widget streamId:", streamId);
      console.log("Widget displayMode:", displayMode);
      console.log("Fetching images from:", url);

      const response = await fetch(url);
      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Stream not found");
        }
        throw new Error("Failed to fetch images");
      }

      const result = await response.json();
      console.log("API Response:", result);
      console.log("Response success:", result.success);
      console.log("Response data length:", result.data?.length);

      if (result.success) {
        console.log("Images found:", result.data.length);
        console.log("First few images:", result.data.slice(0, 3));
        setImages(result.data);
        setLastUpdate(new Date());
        setStreamError(null); // Clear any previous stream errors
      } else {
        console.log("API returned error:", result.error);
        if (
          result.error?.includes("Stream not found") ||
          result.error?.includes("Invalid stream")
        ) {
          setStreamError("Invalid or missing stream ID");
          setImages([]);
        } else {
          throw new Error(result.error || "Failed to fetch images");
        }
      }
      console.log("=== WIDGET DEBUG END ===");
    } catch (err) {
      console.error("Error in fetchImages:", err);
      if (err instanceof Error) {
        if (err.message === "Stream not found") {
          setStreamError("Invalid or missing stream ID");
          setImages([]);
        } else {
          setError(err.message);
        }
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  // Also add this to see when the component mounts
  useEffect(() => {
    console.log("=== Widget component mounted ===");
    console.log("Initial streamId:", streamId);
    console.log("Initial displayMode:", displayMode);
  }, []);

  // Set up SSE for real-time updates
  useEffect(() => {
    console.log("=== useEffect for SSE/fetchImages ===");
    console.log("streamId:", streamId);

    if (!streamId) {
      console.log("No streamId, calling fetchImages directly");
      fetchImages();
      return;
    }

    // Try SSE first, fallback to regular fetch
    const setupSSE = () => {
      try {
        console.log("Setting up SSE for streamId:", streamId);
        const eventSource = new EventSource(
          `/api/widget/updates?streamId=${streamId}`
        );
        eventSourceRef.current = eventSource;

        // Add a timeout to fallback to regular fetch if SSE doesn't respond
        const timeout = setTimeout(() => {
          console.log("SSE timeout, falling back to fetchImages");
          eventSource.close();
          fetchImages();
        }, 3000); // 3 second timeout

        eventSource.onopen = () => {
          console.log("SSE connection opened");
          clearTimeout(timeout);
        };

        eventSource.onmessage = (event) => {
          console.log("SSE message received:", event.data);
          try {
            const data = JSON.parse(event.data);
            if (data.type === "update" || data.type === "initial") {
              console.log("SSE data received:", data);
              setImages(data.images);
              setLastUpdate(new Date());
              setLoading(false);
            }
          } catch (error) {
            console.error("Error parsing SSE data:", error);
          }
        };

        eventSource.onerror = (error) => {
          console.error("SSE error:", error);
          clearTimeout(timeout);
          eventSource.close();
          // Fallback to regular polling
          console.log("SSE failed, falling back to fetchImages");
          fetchImages();
        };

        return () => {
          clearTimeout(timeout);
          eventSource.close();
        };
      } catch (error) {
        console.error("Error setting up SSE:", error);
        // Fallback to regular polling
        console.log("SSE setup failed, falling back to fetchImages");
        fetchImages();
      }
    };

    const cleanup = setupSSE();
    return cleanup;
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

  // Reset current slide when images change
  useEffect(() => {
    setCurrentSlide(0);
  }, [images.length]);

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
            <div
              className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin"
              style={{
                borderColor: `${primaryColor} transparent transparent transparent`,
              }}
            ></div>
          </div>
          <p className="text-lg font-medium text-slate-600">
            Loading gallery...
          </p>
        </div>
      </div>
    );
  }

  if (streamError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center space-y-4 p-8 bg-white rounded-2xl shadow-lg max-w-md mx-4">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
            <span className="text-orange-500 text-2xl">⚠</span>
          </div>
          <h2 className="text-xl font-semibold text-slate-800">
            Invalid Stream Access
          </h2>
          <p className="text-slate-600">
            {streamError === "Invalid or missing stream ID"
              ? "The stream ID provided is invalid or missing. Please check your embed code or URL parameters."
              : streamError}
          </p>
          <div className="space-y-2 text-sm text-slate-500">
            <p>Make sure you have:</p>
            <ul className="text-left space-y-1">
              <li>• A valid stream ID in the URL</li>
              <li>• Proper embed code with correct parameters</li>
              <li>• Access to the stream content</li>
            </ul>
          </div>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            style={{ borderColor: primaryColor, color: primaryColor }}
          >
            Try Again
          </Button>
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
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            style={{ borderColor: primaryColor, color: primaryColor }}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (images.length === 0 && !loading && !error && !streamError) {
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
          {streamId && (
            <div className="text-sm text-slate-500">
              <p>Stream ID: {streamId}</p>
              <p>Check back later for new content.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="sticky top-0 bg-white/50 backdrop-blur-xl z-40">
        <div className="max-w-[1460px] mx-auto">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {logo && (
                <Image
                  src={logo}
                  alt="Stream Logo"
                  width={40}
                  height={40}
                  className="rounded-lg object-cover"
                />
              )}
              <div>
                <h1 className="text-2xl font-bold text-slate-800">
                  Gallery Widget
                </h1>
                <p className="text-sm text-slate-600">
                  {images.length} images • {displayMode} view
                  {streamId &&
                    images[0]?.streamName &&
                    ` • ${images[0].streamName}`}
                  {lastUpdate && (
                    <span className="ml-2 text-xs text-green-600">
                      • Live updates enabled
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {displayMode === "slideshow" && (
                <Button
                  onClick={() => setIsAutoPlay(!isAutoPlay)}
                  variant="outline"
                  size="sm"
                  className="hidden sm:flex"
                  style={
                    {
                      borderColor: primaryColor,
                      color: primaryColor,
                      "--tw-ring-color": primaryColorLight,
                    } as React.CSSProperties
                  }
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

      {/* Rest of the component remains the same */}
      <div className="max-w-[1460px] mx-auto">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {displayMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {images.map((image, index) => (
                <div
                  key={image.id}
                  className="group cursor-pointer"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-500 overflow-hidden border border-slate-200/50 hover:border-slate-300">
                    <div className="relative overflow-hidden">
                      <Image
                        src={image.img}
                        alt={image.name}
                        width={300}
                        height={225}
                        className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="relative w-full">
              <div className="relative overflow-hidden rounded-2xl shadow-2xl bg-white w-full">
                <div
                  className="flex transition-transform duration-700 ease-in-out w-full"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {images.map((image) => (
                    <div
                      key={image.id}
                      className="w-full flex-shrink-0 relative min-w-full"
                    >
                      <div className="relative w-full h-64 sm:h-96 lg:h-[500px] xl:h-[600px]">
                        <Image
                          src={image.img}
                          alt={image.name}
                          fill
                          className="object-cover w-full h-full"
                          sizes="100vw"
                          priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
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
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/60 backdrop-blur-sm hover:bg-white/20 text-white border border-white/20 hover:border-white/40 transition-all duration-200 h-12 w-12 rounded-full z-10"
                    >
                      <ChevronLeft className="w-8 h-8" color="black" />
                    </Button>

                    <Button
                      onClick={nextSlide}
                      variant="ghost"
                      size="icon"
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/60 backdrop-blur-sm hover:bg-white/20 text-white border border-white/20 hover:border-white/40 transition-all duration-200 h-12 w-12 rounded-full z-10"
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
                            ? "w-8 h-3"
                            : "w-3 h-3 bg-slate-300 hover:bg-slate-400"
                        }`}
                        style={
                          index === currentSlide
                            ? { backgroundColor: primaryColor }
                            : {}
                        }
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
                    className="h-full transition-all duration-75 ease-linear"
                    style={{
                      width: "100%",
                      backgroundColor: primaryColor,
                      animation: "progress 4s linear infinite",
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes progress {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
      `}</style>
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
