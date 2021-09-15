const videoFrames = document.querySelectorAll('iframe[data-media-type="video"]');
console.log(`Replacing ${videoFrames.length} video players...`);

for (const frame of videoFrames) {
	frame.src = `https://migushthe2nd.github.io/UTwente-Dark/styles/canvas.utwente.nl/player.html?url=${encodeURIComponent(
		frame.src
	)}`;
}

const videoPreviews = document.querySelectorAll("#media_preview[data-download_url]");
console.log(`Replacing ${videoFrames.length} preview players...`);

for (const preview of videoPreviews) {
	const frame = document.createElement("iframe");
	frame.src = `https://migushthe2nd.github.io/UTwente-Dark/styles/canvas.utwente.nl/player.html?directurl=${encodeURIComponent(
		preview.getAttribute("data-download_url")
	)}&type=${preview.getAttribute("data-type")}`;
	frame.allowFullscreen = "allowfullscreen";
	frame.allow = "fullscreen";
	frame.classList.add("mejs-container");
	preview.replaceWith(frame);
}
