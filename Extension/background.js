const isDev = false;

if (isDev) {
	// Clear storage in dev environment
	chrome.storage.sync.clear(function () {
		var error = chrome.runtime.lastError;
		if (error) {
			console.error(error);
		}
	});
}

chrome.runtime.onInstalled.addListener(() => {
	chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
		chrome.declarativeContent.onPageChanged.addRules([
			{
				conditions: [
					new chrome.declarativeContent.PageStateMatcher({
						pageUrl: {
							hostSuffix: "utwente.nl",
						},
					}),
					new chrome.declarativeContent.PageStateMatcher({
						pageUrl: {
							hostSuffix: "reu1.blindsidenetworks.com",
						},
					}),
					new chrome.declarativeContent.PageStateMatcher({
						pageUrl: {
							hostSuffix: "horusapp.nl",
						},
					}),
				],
				actions: [new chrome.declarativeContent.ShowPageAction()],
			},
		]);
	});
});

// Persistant pageAction state: https://stackoverflow.com/a/31807498/12314121
chrome.pageAction.onClicked.addListener((tab) => {
	const host = getHost(tab);
	chrome.storage.sync.get({ disabledDomains: {} }, (data) => {
		// Set one global key for the domain, because it's safer I guess?
		data.disabledDomains[host] = !Boolean(data.disabledDomains[host]);

		chrome.storage.sync.set({ disabledDomains: data.disabledDomains });
	});
});

// Requesting the main tab host key. Increases load time, but idk how else make it work properly for iframes.
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
	if (message.getKey === undefined) return;
	const key = getHost(sender.tab);
	sendResponse({ key });
});

// Listen for status changes requested by a the content script
chrome.runtime.onMessage.addListener(function (message, sender, _sendResponse) {
	if (message.site === undefined || sender.frameId !== 0) return;
	setIcon(sender.tab.id, message.site.enabled);
});

const getHost = (tab) => {
	const urlObj = new URL(tab.url);
	const hostsplit = urlObj.hostname.split(".");
	return hostsplit.slice(Math.max(hostsplit.length - 3, 0)).join(".");
};

const setIcon = (tabId, status) => {
	if (status) {
		chrome.pageAction.setTitle({ tabId, title: "Dark mode enabled!" });
		chrome.pageAction.setIcon({
			tabId,
			path: {
				32: "icons/dark_32.png",
				64: "icons/dark_64.png",
				128: "icons/dark_128.png",
			},
		});
	} else {
		chrome.pageAction.setTitle({ tabId, title: "Dark mode disabled" });
		chrome.pageAction.setIcon({
			tabId,
			path: {
				32: "icons/light_32.png",
				64: "icons/light_64.png",
				128: "icons/light_128.png",
			},
		});
	}
};

const isCSPHeader = (headerName) => {
	return headerName === "CONTENT-SECURITY-POLICY" || headerName === "X-WEBKIT-CSP";
};

chrome.webRequest.onHeadersReceived.addListener(
	(details) => {
		for (let i = 0; i < details.responseHeaders.length; i += 1) {
			if (isCSPHeader(details.responseHeaders[i].name.toUpperCase())) {
				let csp = details.responseHeaders[i].value;

				const url = "https://migushthe2nd.github.io/";
				csp = csp.replace("style-src", `style-src ${url}`);
				csp = csp.replace("img-src", `img-src ${url}`);

				details.responseHeaders[i].value = csp;
			}
		}

		return {
			responseHeaders: details.responseHeaders,
		};
	},
	{
		urls: ["https://signon.utwente.nl/*"],
		types: ["main_frame"],
	},
	["blocking", "responseHeaders"]
);

chrome.webRequest.onHeadersReceived.addListener(
	function (details) {
		details.responseHeaders.push({
			name: "Access-Control-Allow-Origin",
			value: "*",
		});

		return {
			responseHeaders: details.responseHeaders,
		};
	},
	{
		urls: ["https://canvas.utwente.nl/media_objects*"],
		types: ["xmlhttprequest", "sub_frame"],
	},
	["responseHeaders", "blocking", "extraHeaders"]
);
