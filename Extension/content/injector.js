const getHost = (url) => {
	if (!url) return;
	const urlObj = new URL(url);
	const hostsplit = urlObj.hostname.split('.');
	return hostsplit.slice(Math.max(hostsplit.length - 3, 0)).join('.');
};

const shouldTheme = (host, path) => {
	if (host === 'signon.utwente.nl' && path !== '/utsso/login.jsp') {
		return false;
	} else if (host.includes('blindsidenetworks.com') && !path.includes('html5client')) {
		return false;
	} else return true;
};

const enable = (host) => {
	const waitForElm = (selector) => {
		return new Promise((resolve) => {
			if (document.querySelector(selector)) {
				return resolve(document.querySelector(selector));
			}

			const observer = new MutationObserver(() => {
				if (document.querySelector(selector)) {
					resolve(document.querySelector(selector));
					observer.disconnect();
				}
			});

			observer.observe(document, {
				childList: true,
				subtree: true,
			});
		});
	};

	const inject = async (path) => {
		const element = document.createElement('link');
		element.setAttribute('rel', 'stylesheet');
		element.setAttribute('type', 'text/css');
		element.setAttribute('service', 'UTwenteDark');
		// element.setAttribute('href', `https://migushthe2nd.github.io/UTwente-Dark/styles/${path}`);
		element.setAttribute('href', `https://haverkae.home.xs4all.nl/Files/UTwente_Dark/${path}`);
		element.async = false;

		document.documentElement.insertAdjacentElement('beforeend', element);

		const head = await waitForElm('head');

		head.parentNode.insertBefore(element, head.nextSibling);

		console.log(`'${path}' injected in frame!`);
	};

	inject('colors.css');
	inject(`${host}/style.css`);
};

const disable = () => {
	[...document.querySelectorAll("*[service='UTwenteDark']")].map((e) => e && e.remove());
};

// On start, disable or enable if the host matches, then set the icon
if (window.location.hostname !== '') {
	const host = getHost(window.location);
	let referrer = undefined;
	try {
		referrer = getHost(window.parent.location);
	} catch (e) {
		// CORS is active and we cannot read the parent, so we know that the origin is different.
		// Becase the domain is different, we can (for now) use the referrer.
		// In the future this should be changed so that the iframe sends the url of the current page, and the background.js crease a single string using both the tab window url and the message url and use it as key
		// Then the background.js should initialize the content script, by responsing to a request on start and returning the value of the joined string.
		referrer = getHost(document.referrer);
	}
	const path = window.location.pathname;

	// Set a temporary black background, to reduce flashes
	if (shouldTheme(host, path)) {
		// This list is optional. It should only be used on the domains known to work properly.
		const html = [
			'rooster.utwente.nl',
			'canvas.utwente.nl',
			'printquota.utwente.nl',
			'printportal.utwente.nl',
			'horusapp.nl',
		];

		const body = ['osiris.utwente.nl', 'signon.utwente.nl'];

		const e = document.createElement('style');
		e.setAttribute('type', 'text/css');
		e.setAttribute('service', 'UTwenteDark');
		e.async = false;

		if (html.includes(host)) {
			e.innerHTML = `
				html {
					background-color: #202020 !important;
				}

			`;
			document.documentElement.appendChild(e);
		} else if (body.includes(host)) {
			e.innerHTML = `
				body {
					background-color: #202020 !important;
				}

				.ut-background {
					background-image: unset !important;
				}
			`;
			document.documentElement.appendChild(e);
		}

		// On status change, disable or enable if the host matches
		chrome.storage.sync.onChanged.addListener((changes, _namespace) => {
			console.log(changes.disabledDomains);
			console.log(referrer || host);
			if (!changes.disabledDomains.newValue[referrer || host]) {
				enable(host);
				chrome.runtime.sendMessage({ site: { domain: referrer || host, enabled: true } });
			} else {
				disable();
				chrome.runtime.sendMessage({ site: { domain: referrer || host, enabled: false } });
			}
		});

		chrome.storage.sync.get({ disabledDomains: {} }, (result) => {
			if (!result.disabledDomains[referrer || host]) {
				enable(host);
				chrome.runtime.sendMessage({ site: { domain: referrer || host, enabled: true } });
			} else {
				disable();
				chrome.runtime.sendMessage({ site: { domain: referrer || host, enabled: false } });
			}
		});
	}
}
