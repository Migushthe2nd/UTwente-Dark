// Clear storage in dev environment
// chrome.storage.sync.clear(function () {
// 	var error = chrome.runtime.lastError;
// 	if (error) {
// 		console.error(error);
// 	}
// });

chrome.runtime.onInstalled.addListener(() => {
	chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
		chrome.declarativeContent.onPageChanged.addRules([
			{
				conditions: [
					new chrome.declarativeContent.PageStateMatcher({
						pageUrl: {
							hostSuffix: 'utwente.nl',
						},
					}),
					new chrome.declarativeContent.PageStateMatcher({
						pageUrl: {
							hostSuffix: 'reu1.blindsidenetworks.com',
						},
					}),
					new chrome.declarativeContent.PageStateMatcher({
						pageUrl: {
							hostSuffix: 'horusapp.nl',
						},
					}),
				],
				actions: [new chrome.declarativeContent.ShowPageAction()],
			},
		]);
	});
});

chrome.pageAction.onClicked.addListener((tab) => {
	const host = getHost(tab);
	chrome.storage.sync.get({ disabled: {} }, (data) => {
		data.disabled[host] = !Boolean(data.disabled[host]);

		if (data.disabled[host]) {
			setIcon(tab.id, false);
		} else {
			setIcon(tab.id, true);
		}

		// Persistant pageAction state: https://stackoverflow.com/a/31807498/12314121
		chrome.storage.sync.set({ disabled: data.disabled });
	});
});

chrome.storage.sync.get({ disabled: {} }, (result) => {
	chrome.tabs.query(
		{
			active: true,
			currentWindow: true,
			windowType: 'normal',
		},
		(tabs) => {
			const tab = tabs[0];
			const host = getHost(tab);

			if (result.disabled[host]) {
				setIcon(tab.id, false);
			} else {
				setIcon(tab.id, true);
			}
		}
	);
});

//The content script sends a message when the page has loaded. This function below restores the icon state.
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
	if (message.setImage === undefined) return;
	setIcon(sender.tab.id, message.setImage);
});

const getHost = (tab) => {
	const url = new URL(tab.url);
	const hostsplit = url.hostname.split('.');
	return hostsplit.slice(Math.max(hostsplit.length - 3, 0)).join('.');
};

const setIcon = (tabId, status) => {
	if (status) {
		chrome.pageAction.setIcon({ tabId, path: 'icons/128.png' });
	} else {
		chrome.pageAction.setIcon({ tabId, path: 'icons/128.disabled.png' });
	}
};

const isCSPHeader = (headerName) => {
	return headerName === 'CONTENT-SECURITY-POLICY' || headerName === 'X-WEBKIT-CSP';
};

chrome.webRequest.onHeadersReceived.addListener(
	(details) => {
		for (let i = 0; i < details.responseHeaders.length; i += 1) {
			if (isCSPHeader(details.responseHeaders[i].name.toUpperCase())) {
				let csp = details.responseHeaders[i].value;

				const url = 'https://migushthe2nd.github.io/ https://haverkae.home.xs4all.nl/';
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
		urls: ['https://signon.utwente.nl/*'],
		types: ['main_frame'],
	},
	['blocking', 'responseHeaders']
);
