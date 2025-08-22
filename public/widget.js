(function () {
  const embedDiv = document.getElementById("gallery-widget");
  if (!embedDiv) {
    console.error(
      "Embed container not found. Please add a div with id 'gallery-widget' to your page."
    );
    return;
  }

  // Get all the data attributes
  const displayMode = embedDiv.getAttribute("data-display-mode") || "slideshow";
  const streamId = embedDiv.getAttribute("data-stream-id") || "";
  const color = embedDiv.getAttribute("data-color") || "#3B82F6";
  const logo = embedDiv.getAttribute("data-logo") || "";

  // Build the URL with all parameters
  let widgetUrl = `http://localhost:3001/widget?displayMode=${encodeURIComponent(displayMode)}`;
  
  if (streamId) {
    widgetUrl += `&streamId=${encodeURIComponent(streamId)}`;
  }
  
  if (color) {
    widgetUrl += `&color=${encodeURIComponent(color)}`;
  }
  
  if (logo) {
    widgetUrl += `&logo=${encodeURIComponent(logo)}`;
  }

  const iframe = document.createElement("iframe");
  iframe.src = widgetUrl;
  iframe.width = "100%";
  iframe.height = "500px";
  iframe.style.border = "none";
  iframe.style.borderRadius = "8px";
  iframe.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1)";

  embedDiv.appendChild(iframe);
})();