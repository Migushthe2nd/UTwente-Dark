const getDate = (dayNumber) => {
	const firstDayOfWeek = document.querySelector(".GC02KLKBEP > .GC02KLKBOO");
	console.log(firstDayOfWeek);

	if (firstDayOfWeek) {
		const f = firstDayOfWeek[0].text;
		// const year = "";
		// return new Date(`${dateNode} ${year}`);
	}
};

getDate(1);

const updateCurrentTime = () => {};

const insertCurrentTime = () => {
	const targets = document.querySelector('.wc-time-slots td[class^="wc-day-column day-"]');

	for (const target of targets) {
		// If there is no first child of type <hr> yet
		if (target.firstChild && target.firstChild.nodeName !== "HR") {
			target.prepend(document.createElement("hr", { class: "current-time" }), target.firstChild);
		}
	}

	updateCurrentTime();
};

insertCurrentTime();

setInterval(function () {
	updateCurrentTime();
}, 60 * 1000); // check every minute
