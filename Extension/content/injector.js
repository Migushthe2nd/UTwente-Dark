const hostsplit = window.location.hostname.split('.');
const host = hostsplit.slice(Math.max(hostsplit.length - 3, 0)).join('.');
const path = window.location.pathname;

if (host === 'signon.utwente.nl' && path !== '/utsso/login.jsp') {
} else if (host.includes('blindsidenetworks.com') && !path.includes('html5client')) {
} else {
	// This list is optional. It only tries to prevent white flashes, and should only be used on the domains known to work.
	const domains = ['rooster.utwente.nl', 'canvas.utwente.nl', 'printquota.utwente.nl', 'horusapp.nl'];
	if (domains.includes(host)) {
		const e = document.createElement('style');
		e.setAttribute('type', 'text/css');
		e.innerHTML = `
			body {
				background-color: #202020 !important;
			}
		`;
		e.async = false;
		document.documentElement.appendChild(e);
	}

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
