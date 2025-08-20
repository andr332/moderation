"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface Image {
  id: string;
  img: string;
  name: string;
  date: string;
  approved: boolean;
}

export default function Gallery() {
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/images/approved");
        const data: Image[] = await response.json();
        setImages(data);
      } catch (error) {
        console.error("Error fetching images:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-5">
        <div className="p-4">
          <h1 className="text-3xl font-bold text-center mb-2">
            Approved Gallery
          </h1>
          <p className="text-sm text-gray-500 text-center">
            Browse through the collection of approved images.
          </p>
        </div>

        <div className="py-5">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full max-w-4xl mx-auto"
          >
            <CarouselContent>
              {images.map((image) => (
                <CarouselItem
                  key={image.id}
                  className="md:basis-1/2 lg:basis-1/3"
                >
                  <div className="relative aspect-square">
                    <Image
                      src={image.img}
                      alt={image.name}
                      fill
                      className="rounded-lg object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>

        <div className="p-4">
          <h1 className="text-3xl font-bold text-center mb-2">
            Revoked Images
          </h1>
          <p className="text-sm text-gray-500 text-center">
            Browse through the collection of approved images.
          </p>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image) => (
              <div key={image.id} className="relative aspect-square group">
                <Image
                  src={image.img}
                  alt={image.name}
                  fill
                  className="rounded-lg object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
                <div className="absolute bottom-0 left-0 bg-black bg-opacity-50 text-white p-2 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity w-full">
                  <p className="text-sm truncate">{image.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
