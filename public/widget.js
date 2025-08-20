(function () {
  const embedDiv = document.getElementById("gallery-widget");
  if (!embedDiv) {
    console.error(
      "Embed container not found. Please add a div with id 'gallery-widget' to your page."
    );
    return;
  }

  const displayMode = embedDiv.getAttribute("data-display-mode") || "slideshow";

  const iframe = document.createElement("iframe");
  iframe.src = `http://localhost:3001/widget?displayMode=${displayMode}&color=${
    embedDiv.getAttribute("data-color") || ""
  }`;
  iframe.width = "100%";
  iframe.height = "500px";
  iframe.style.border = "none";

  embedDiv.appendChild(iframe);
})();
