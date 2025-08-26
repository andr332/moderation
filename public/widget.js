(function () {
  "use strict";

  // Only run on client side
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  // Wait for the page to be fully loaded
  function waitForElement() {
    const embedDiv = document.getElementById("gallery-widget");
    if (embedDiv) {
      initWidget(embedDiv);
    } else {
      // If element doesn't exist yet, wait a bit and try again
      setTimeout(waitForElement, 100);
    }
  }

  function initWidget(embedDiv) {
    // Get stream ID from data attribute
    const streamId = embedDiv.getAttribute("data-stream-id");
    const baseUrl =
      embedDiv.getAttribute("data-base-url") || "http://localhost:3001";

    if (!streamId) {
      embedDiv.innerHTML = `
        <div style="
          padding: 20px; 
          text-align: center; 
          color: #666;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        ">
          <p>Stream ID is required. Please add data-stream-id attribute.</p>
        </div>
      `;
      return;
    }

    console.log("Initializing widget with stream ID:", streamId);

    // Show loading state
    embedDiv.innerHTML = `
      <div style="
        padding: 40px; 
        text-align: center; 
        color: #666;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      ">
        <div style="
          width: 40px; 
          height: 40px; 
          border: 3px solid #e5e7eb; 
          border-top: 3px solid #3b82f6; 
          border-radius: 50%; 
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        "></div>
        <p>Loading gallery...</p>
        <style>
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      </div>
    `;

    // Fetch stream configuration and load widget
    loadStreamAndCreateWidget(embedDiv, streamId, baseUrl);
  }

  // Fetch stream data and create widget
  async function loadStreamAndCreateWidget(embedDiv, streamId, baseUrl) {
    try {
      console.log("Fetching stream configuration...");

      // Fetch stream configuration
      const streamResponse = await fetch(`${baseUrl}/api/streams/${streamId}`);

      if (!streamResponse.ok) {
        throw new Error(`Failed to load stream: ${streamResponse.status}`);
      }

      const streamData = await streamResponse.json();
      console.log("Stream data:", streamData);

      if (!streamData.success) {
        throw new Error("Invalid stream");
      }

      // Build the widget URL with stream configuration
      const widgetUrl = `${baseUrl}/widget?streamId=${encodeURIComponent(
        streamId
      )}`;

      console.log("Loading widget from URL:", widgetUrl);

      // Create iframe with the widget
      const iframe = document.createElement("iframe");
      iframe.src = widgetUrl;
      iframe.width = "100%";
      iframe.height = "600px";
      iframe.style.border = "none";
      iframe.style.borderRadius = "12px";
      iframe.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.1)";
      iframe.style.overflow = "hidden";

      // Clear loading state and add iframe
      embedDiv.innerHTML = "";
      embedDiv.appendChild(iframe);

      // Handle iframe load events
      iframe.onload = function () {
        console.log("Widget iframe loaded successfully");
      };

      iframe.onerror = function () {
        embedDiv.innerHTML = `
          <div style="
            padding: 20px; 
            text-align: center; 
            color: #666;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          ">
            <p>Failed to load widget. Please check your stream configuration.</p>
          </div>
        `;
      };
    } catch (error) {
      console.error("Widget loading error:", error);
      embedDiv.innerHTML = `
        <div style="
          padding: 20px; 
          text-align: center; 
          color: #666;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        ">
          <p>Failed to load gallery: ${error.message}</p>
          <p style="font-size: 12px; margin-top: 8px;">Check console for details</p>
        </div>
      `;
    }
  }

  // Start the process when the script loads
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", waitForElement);
  } else {
    // If DOM is already loaded, start immediately
    waitForElement();
  }

  // Export for global access
  window.GalleryWidget = {
    init: function (containerId) {
      const container = document.getElementById(
        containerId || "gallery-widget"
      );
      if (container) {
        initWidget(container);
      }
    },
  };
})();
