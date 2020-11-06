const hostsplit = window.location.hostname.split('.');
const host = hostsplit.slice(Math.max(hostsplit.length - 3, 0)).join('.');
const path = window.location.pathname;

const shouldTheme = () => {
	if (host === 'signon.utwente.nl' && path !== '/utsso/login.jsp') {
		return false;
	} else if (host.includes('blindsidenetworks.com') && !path.includes('html5client')) {
		return false;
	} else return true;
};

// Set a temporary black background, to reduce flashes
if (shouldTheme()) {
	// This list is optional. It should only be used on the domains known to work.
	const domains = [
		'rooster.utwente.nl',
		'canvas.utwente.nl',
		'printquota.utwente.nl',
		'osiris.utwente.nl',
		'printportal.utwente.nl',
		'signon.utwente.nl',
		'horusapp.nl',
	];

	if (domains.includes(host)) {
		const e = document.createElement('style');
		e.setAttribute('type', 'text/css');
		e.setAttribute('service', 'UTwenteDark');
		e.innerHTML = `
			${host === 'signon.utwente.nl' ? 'body' : 'html'} {
				background-color: #202020 !important;
			}
		`;
		e.async = false;
		document.documentElement.appendChild(e);
	}
}

const enable = () => {
	if (shouldTheme()) {
		const waitForElm = (selector) => {
			return new Promise((resolve) => {
				if (document.querySelector(selector)) {
					return resolve(document.querySelector(selector));
				}

				const observer = new MutationObserver((mutations) => {
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
	}
};

const disable = () => {
	[...document.querySelectorAll("*[service='UTwenteDark']")].map((e) => e && e.remove());
};

// Manage status of the extention on this specific domain
chrome.storage.sync.onChanged.addListener((changes, _namespace) => {
	if (changes.disabled.newValue[host]) {
		disable();
	} else {
		enable();
	}
});

chrome.storage.sync.get({ disabled: {} }, (result) => {
	if (!result.disabled[host]) {
		enable();
	} else {
		disable();
		chrome.runtime.sendMessage({ setImage: false });
	}
});
