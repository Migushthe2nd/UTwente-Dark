function isCSPHeader(headerName) {
	return headerName === 'CONTENT-SECURITY-POLICY' || headerName === 'X-WEBKIT-CSP';
}

chrome.webRequest.onHeadersReceived.addListener(
	(details) => {
		for (let i = 0; i < details.responseHeaders.length; i += 1) {
			if (isCSPHeader(details.responseHeaders[i].name.toUpperCase())) {
				let csp = details.responseHeaders[i].value;

				const url = 'https://haverkae.home.xs4all.nl/';
				csp = csp.replace('script-src', `script-src ${url}`);
				csp = csp.replace('style-src', `style-src ${url}`);
				csp = csp.replace('connect-src', `connect-src ${url}`);
				csp = csp.replace('img-src', `img-src ${url}`);
				csp = csp.replace('font-src', `font-src ${url}`);
				csp = csp.replace('media-src', `media-src ${url}`);
				csp = csp.replace('default-src', `media-src ${url}`);

				details.responseHeaders[i].value = csp;
			}
		}

		return {
			responseHeaders: details.responseHeaders,
		};
	},
	{
		urls: ['https://*.utwente.nl/*'],
		types: ['main_frame'],
	},
	['blocking', 'responseHeaders']
);
