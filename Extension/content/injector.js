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
	chrome.runtime.sendMessage({ site: { enabled: true } });

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
		element.setAttribute('href', `https://migushthe2nd.github.io/UTwente-Dark/styles/${path}`);
		// element.setAttribute('href', `https://haverkae.home.xs4all.nl/Files/UTwente_Dark/${path}`); // Haha you found the same secret url
		element.async = true;

		document.documentElement.insertAdjacentElement('beforeend', element);

		const head = await waitForElm('head');

		head.parentNode.insertBefore(element, head.nextSibling);

		// // This is another option to load the styles
		// const element = document.createElement('style');
		// element.setAttribute('service', 'UTwenteDark');
		// var xmlHttp = new XMLHttpRequest();
		// xmlHttp.open('GET', `https://migushthe2nd.github.io/UTwente-Dark/styles/${path}`, false); // false for synchronous request
		// xmlHttp.send(null);
		// element.innerHTML = xmlHttp.responseText;
		// console.log(element.innerHTML);
		// document.documentElement.insertAdjacentElement('beforeend', element);

		console.log(`'${path}' injected in frame!`);
	};

	inject('colors.css');
	inject(`${host}/style.css`);
};

const disable = () => {
	chrome.runtime.sendMessage({ site: { enabled: false } });
	[...document.querySelectorAll("*[service='UTwenteDark']")].map((e) => e && e.remove());
};

// On start, disable or enable if the host matches, then set the icon
if (window.location.hostname !== '') {
	const host = getHost(window.location);
	const path = window.location.pathname;

	if (shouldTheme(host, path)) {
		// Set a temporary black background, to reduce white flashes by a tiny bit because of resources still loading
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
		e.async = true;

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
			chrome.runtime.sendMessage({ getKey: true }, (response) => {
				// Now we check whether the value for this tab host was changed. If so, we know the change applies to this tab
				// Else the change was made on another tab host
				if (changes.disabledDomains.oldValue[response.key] === changes.disabledDomains.newValue[response.key])
					return;

				if (!changes.disabledDomains.newValue[response.key]) {
					enable(host);
				} else {
					disable();
				}
			});
		});

		chrome.storage.sync.get({ disabledDomains: {} }, (result) => {
			chrome.runtime.sendMessage({ getKey: true }, (response) => {
				if (!result.disabledDomains[response.key]) {
					enable(host);
				} else {
					disable();
				}
			});
		});
	}
}
