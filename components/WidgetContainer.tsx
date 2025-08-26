"use client";

import { useEffect, useRef } from "react";

interface WidgetContainerProps {
  streamId: string;
  baseUrl?: string;
  height?: string;
}

const WidgetContainer = ({
  streamId,
  baseUrl = "http://localhost:3001",
  height = "600px",
}: WidgetContainerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !streamId) return;

    // Create a script element to load the widget
    const script = document.createElement("script");
    script.src = `${baseUrl}/widget.js`;
    script.defer = true;

    // Set up the container with the required attributes
    const container = containerRef.current;
    container.id = "gallery-widget";
    container.setAttribute("data-stream-id", streamId);
    container.setAttribute("data-base-url", baseUrl);
    container.style.height = height;
    container.style.width = "100%";

    // Append the script to the document
    document.head.appendChild(script);

    // Cleanup function
    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [streamId, baseUrl, height]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        minHeight: height,
        borderRadius: "12px",
        overflow: "hidden",
      }}
    />
  );
};

export default WidgetContainer;
