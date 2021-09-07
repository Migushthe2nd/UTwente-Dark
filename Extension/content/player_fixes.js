const videoFrames = document.querySelectorAll('iframe[data-media-type="video"]');
console.log(`Replacing ${videoFrames.length} video players...`);

for (const frame of videoFrames) {
	frame.src = `https://migushthe2nd.github.io/UTwente-Dark/styles/canvas.utwente.nl/player.html?url=${encodeURIComponent(
		frame.src
	)}`;
}
