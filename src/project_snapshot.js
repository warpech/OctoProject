const copyIconSvg = `<svg aria-hidden="true" class="octicon octicon-clippy" height="16" version="1.1" viewBox="0 0 14 16" width="14"><path fill-rule="evenodd" d="M2 13h4v1H2v-1zm5-6H2v1h5V7zm2 3V8l-3 3 3 3v-2h5v-2H9zM4.5 9H2v1h2.5V9zM2 12h2.5v-1H2v1zm9 1h1v2c-.02.28-.11.52-.3.7-.19.18-.42.28-.7.3H1c-.55 0-1-.45-1-1V4c0-.55.45-1 1-1h3c0-1.11.89-2 2-2 1.11 0 2 .89 2 2h3c.55 0 1 .45 1 1v5h-1V6H1v9h10v-2zM2 5h8c0-.55-.45-1-1-1H8c-.55 0-1-.45-1-1s-.45-1-1-1-1 .45-1 1-.45 1-1 1H3c-.55 0-1 .45-1 1z"></path></svg>`;

const copy = require('clipboard-copy')

function makeProjectSnapshot() {
	let sb = [];
	const newLine = "\r\n";
	const title = document.querySelector("h3.d-flex.flex-items-center.f5");
	const cols = document.querySelectorAll("div.project-column");
	const date = new Date();

	sb.push("# ", title.innerText, " - ", date.getFullYear(), ".", (date.getMonth() + 1), ".", date.getDate(), newLine, newLine);

	for (let i = 0; i < cols.length; i++) {
		const col = cols[i];
		const title = col.querySelector("span.js-project-column-name").innerText;

		sb.push("### ", title);

		const issues = col.querySelectorAll("a.h5.d-block");

		sb.push(" (", issues.length, ")");
		sb.push(newLine, newLine);

		for (let j = 0; j < issues.length; j++) {
			const issue = issues[j];
			const url = issue.href;
			const name = issue.innerText;

			sb.push("- [", name, "](", url, ")", newLine);
		}

		sb.push(newLine)
	}

	return sb.join("");
}

function findMenuButton() {
	return document.querySelector(".js-show-project-menu").parentNode;
}

function copyText() {
	var copyText = document.querySelector("#input");
	copyText.select();
	document.execCommand("Copy");
}

exports.addSnapshotButton = function(str) {
	var menuButton = findMenuButton();
	var snapshotButton = menuButton.cloneNode(true);

	snapshotButton.className = "pr-3 pl-4";

	var snapshotButtonButton = snapshotButton.querySelector("button");
	snapshotButtonButton.className = "btn-link muted-link v-align-middle no-underline project-header-link";
	snapshotButtonButton.innerHTML = copyIconSvg + " Snapshot";

	snapshotButtonButton.addEventListener("click", () => {
		copy(makeProjectSnapshot());
	});

	menuButton.parentNode.insertBefore(snapshotButton, menuButton.parentNode.firstElementChild);
};