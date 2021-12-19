const videoFrames = document.querySelectorAll(
	'iframe[data-media-type="video"], div[data-type="video"], div#media_preview, a[href*=media_objects_iframe]'
);
console.log(`Replacing ${videoFrames.length} video players...`);

for (const element of videoFrames) {
	let mediaId = element.getAttribute("data-media_entry_id") || element.getAttribute("data-media-id");
	if (mediaId === "maybe") {
		mediaId = null;
	}
	const dlUrl = element.getAttribute("data-download_url") || element.getAttribute("data-download-url");
	const mediaType = element.getAttribute("data-media-type") || element.getAttribute("data-type");

	const frameSrc = new URL("https://migushthe2nd.github.io/UTwente-Dark/styles/canvas.utwente.nl/player.html");
	if (mediaType) {
		frameSrc.searchParams.set("mediaType", mediaType);
	}
	if (mediaId) {
		frameSrc.searchParams.set("mediaId", mediaId);
	}
	if (dlUrl) {
		frameSrc.searchParams.set("dlUrl", dlUrl);
	}
	if (element.tagName === "IFRAME") {
		frameSrc.searchParams.set("originalUrl", element.src);
	} else if (element.tagName === "A") {
		frameSrc.searchParams.set("originalUrl", element.href);
	}

	const frame = document.createElement("iframe");
	frame.src = frameSrc.href;
	frame.allowFullscreen = "allowfullscreen";
	frame.allow = "fullscreen";
	frame.classList.add("mejs-container");

	element.replaceWith(frame);
}
