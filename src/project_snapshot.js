const copyIconSvg = `<svg aria-hidden="true" class="octicon octicon-clippy" height="16" version="1.1" viewBox="0 0 14 16" width="14"><path fill-rule="evenodd" d="M2 13h4v1H2v-1zm5-6H2v1h5V7zm2 3V8l-3 3 3 3v-2h5v-2H9zM4.5 9H2v1h2.5V9zM2 12h2.5v-1H2v1zm9 1h1v2c-.02.28-.11.52-.3.7-.19.18-.42.28-.7.3H1c-.55 0-1-.45-1-1V4c0-.55.45-1 1-1h3c0-1.11.89-2 2-2 1.11 0 2 .89 2 2h3c.55 0 1 .45 1 1v5h-1V6H1v9h10v-2zM2 5h8c0-.55-.45-1-1-1H8c-.55 0-1-.45-1-1s-.45-1-1-1-1 .45-1 1-.45 1-1 1H3c-.55 0-1 .45-1 1z"></path></svg>`;

const copy = require('clipboard-copy');

const URI_IN_MARKDOWN = /\]\((http[^\)]*)\)/i;

const NEWLY_ADDED_ITEMS_HEADING = `## Newly added items`;

function escapeSpecialMarkdownChars(str) {
	str = str.replace(/\s+/g, " ");
	str = str.replace(/</g, "&lt;");
	str = str.replace(/>/g, "&gt;");
	str = str.replace(/_/g, "\\_");
	str = str.replace(/\[/g, "\\[");
	str = str.replace(/\]/g, "\\]");
	return str;
}

exports.applyNewIssuesToSnapshot = function(issues, oldSnapshot, returnUnmatched) {
	let sb = [];
	const newLine = "\n";

	oldSnapshot = oldSnapshot || "";
	oldSnapshot = oldSnapshot.trim();
	oldSnapshot = oldSnapshot.replace(/\r\n/g, "\n");
	oldSnapshot = oldSnapshot.split("\n");

	var urlHits = new Set();
	oldSnapshot.forEach((row, index) => {
		var res = row.match(URI_IN_MARKDOWN);
		if (res != null) {
			var url = res[1];
			if(urlHits.has(url)) {
				oldSnapshot[index] = "remove this line";
			}
			else {
				urlHits.add(url);
			}
		}
	});
	oldSnapshot = oldSnapshot.filter((row) => {
		return row !== "remove this line";
	});

	let hasNewlyAddedItems = !!findInArray(oldSnapshot, NEWLY_ADDED_ITEMS_HEADING);

	for (let j = 0; j < issues.length; j++) {
		const issue = issues[j];

		const isClosed = issue.state == "CLOSED" || issue.state == "MERGED";
		const isPR = issue.url.indexOf("pull") > -1;

		let title = escapeSpecialMarkdownChars(issue.title);
		title = title.trim();

		let md;
		if (isClosed) {
			md = `- ~~${issue.repository.name} [${title}](${issue.url})~~`;
		} else if(isPR) {
			md = `- ${issue.repository.name} [🔀 ${title}](${issue.url})`;
		} else {
			md = `- ${issue.repository.name} [🔅 ${title}](${issue.url})`;
		}

		let found = findInArray(oldSnapshot, `(${issue.url})`);
		if (found == null) {
			found = findInArray(oldSnapshot, `(${issue.url.replace("/pull/", "/issues/")})`);
		}
		if (found == null) {
			if (!isClosed) {
				if (!hasNewlyAddedItems) {
					sb.push(newLine, newLine, NEWLY_ADDED_ITEMS_HEADING, newLine);
					hasNewlyAddedItems = true;
				}
				sb.push(md, newLine);
			}
		} else {
			oldSnapshot[found] = md;

			var indexInHits
			if(urlHits.has(issue.url)) {
				urlHits.delete(issue.url)
			}
		}
	}

 	let out;
	if (returnUnmatched) {
		return Array.from(urlHits).join(newLine);
	}
	else {
		out = oldSnapshot.join(newLine) + sb.join("");
	}
	
	return out.trim();
};

function makeProjectSnapshot(oldSnapshot) {
	const title = document.querySelector("h3.d-flex.flex-items-center.f5");
	const cols = document.querySelectorAll("div.project-column");
	const allIssues = [];

	for (let i = 0; i < cols.length; i++) {
		const col = cols[i];

		const issues = col.querySelectorAll("a.h5.d-block");

		for (let j = 0; j < issues.length; j++) {
			const issue = issues[j];
			const url = issue.href;
			let name = issue.innerText;

			const cardState = issue.parentNode.parentNode.dataset.cardState;
			const isClosed = cardState ? cardState.indexOf("closed") > -1 : false;

			allIssues.push({
				title: name,
				url: url,
				state: isClosed ? "CLOSED" : "OPEN"
			});
		}
	}

	return exports.applyNewIssuesToSnapshot(allIssues, oldSnapshot);
}

function findMenuButton() {
	return document.querySelector(".js-show-project-menu").parentNode;
}

const localStorageKey = "OctoProject_SnapshotUri";

function getSnapshotSourceUrl() {
	return window.localStorage.getItem(localStorageKey) || "";
}

function setSnapshotSourceUrl(url) {
	window.localStorage.setItem(localStorageKey, url || "");
}

function fetchSnapshotSource(url) {
	var req = new Request(url, {
		method: "GET",
		headers: {
			Accept: "text/html",
		},
		credentials: "same-origin",
	});
	return fetch(req);
}

function findInArray(arr, str) {
	for (var i = 0; i < arr.length; i++) {
		if (arr[i].indexOf(str) > -1) {
			return i;
		}
	}
	return null;
}

//https://github.com/Starcounter/CompanyTrack/blob/master/WebPlatform/roadmap-2018q1.md
//https://github.com/Starcounter/CompanyTrack/blob/master/WebPlatform/roadmap-2018q1.md
//https://api.github.com/repos/Starcounter/CompanyTrack/contents/WebPlatform/roadmap-2018q1.md

//https://github.com/Starcounter/CompanyTrack/edit/master/WebPlatform/roadmap-2018q1.md

var blobUrlRegex = /(https\:\/\/github\.com\/([^\/]+)\/([^\/]+)\/blob\/(.+))/g; //https://github.com/MyOrg/MyRepo/blob/master/Path/To/File.md

function createModal() {
	var modalHtml = `<div class="Overlay js-box-overlay-container transition-in-out" aria-modal="true" role="dialog" style="display: none">
  <div class="Overlay-table-full bg-transparent-dark">
    <div class="Overlay-cell-middle">
      <div class="Box Box--overlay js-box-overlay-content">
        <div class="Box-header">
          <button type="button" class="Box-btn-octicon btn-octicon float-right js-box-overlay-close">
            <svg aria-label="Close" class="octicon octicon-x" height="16" role="img" version="1.1" viewBox="0 0 12 16" width="12"><path fill-rule="evenodd" d="M7.48 8l3.75 3.75-1.48 1.48L6 9.48l-3.75 3.75-1.48-1.48L4.52 8 .77 4.25l1.48-1.48L6 6.52l3.75-3.75 1.48 1.48z"></path></svg>
          </button>
          <h3 class="Box-title">
            Make a Markdown snapshot of this project
          </h3>
        </div>
        <div class="Box-body">
          
    <p>
      Provide a GitHub URL to the previous snapshot to make an incremental update with the new links at the bottom.
    </p>
          
    <p>
      If an empty value is provided, a clean snapshot will be made.
    </p>

      <p>
        <input type="text" class="form-control input-block">
      </p>

	<p class="flash flash-warn flash-full ml-n3 mr-n3">

    </p>

      <button class="btn btn-block js-copy">Copy snapshot</button>
</form>

        </div>
      </div>
    </div>
  </div>
</div>`;
	var modalContainer = document.createElement("div");
	modalContainer.innerHTML = modalHtml;

	var modal = modalContainer.querySelector(".Overlay");

	modal.querySelector("button.js-box-overlay-close").addEventListener("click", () => {
		modal.style.display = "none";
	});

	var button = modal.querySelector("button.js-copy");
	button.addEventListener("click", () => {
		copy(modal.snapshot);
		modal.style.display = "none";
	});

	modal.querySelector("input").addEventListener("input", () => {
		modal.prepareSnapshotIfUrlProvided(modal);
	});

	function fetchUrl(url) {
		button.setAttribute("disabled", "");
	}

	modal.openModal = function() {
		const url = getSnapshotSourceUrl();
		modal.querySelector("input").value = url;
		modal.style.display = "block";
		modal.prepareSnapshotIfUrlProvided(modal);
	};

	modal.closeModal = function() {
		modal.style.display = "none";
	};

	const result = modal.querySelector(".flash");
	modal.renderResult = function(msg, type) {
		result.classList.remove("flash-warn", "flash-error", "flash-success");
		result.classList.add(type);
		result.innerHTML = msg;
	};

	modal.prepareSnapshotIfUrlProvided = function(modal) {
		button.removeAttribute("disabled");

		const url = modal.querySelector("input").value;
		modal.snapshot = "";

		if (url == "") {
			modal.snapshot = makeProjectSnapshot();
			modal.renderResult("A clean snapshot will be made", "flash-success");
		} else if (url.match(blobUrlRegex)) {
			setSnapshotSourceUrl(url);
			modal.renderResult("Loading...", "flash-warn");
			button.setAttribute("disabled", "");

			const editableUrl = url.replace(blobUrlRegex, "https://github.com/$2/$3/edit/$4");
			fetchSnapshotSource(editableUrl).catch((err) => {
				modal.renderResult("URL cannot be resolved", "flash-error");
				return Promise.reject(err);
			}).then((res) => {
				return res.text();
			}).then((html) => {
				const frag = document.createRange().createContextualFragment(html);
				const textarea = frag.querySelector("textarea");
				if (textarea) {
					const oldSnapshot = textarea.innerText;
					modal.snapshot = makeProjectSnapshot(oldSnapshot);
					modal.renderResult("Previous snapshot preloaded", "flash-success");
					button.removeAttribute("disabled");
				} else {
					modal.renderResult("Snapshot not found in the provided URL", "flash-error");
				}
			});
		} else {
			modal.renderResult("URL format not recognized. The expected format: <code>https://github.com/MyOrg/MyRepo/blob/master/Path/To/File.md</code>", "flash-warn");
		}
	}

	return modal;
}

exports.addSnapshotButton = function(str) {
	var menuButton = findMenuButton();

	var modal = createModal();
	menuButton.parentNode.insertBefore(modal, menuButton.parentNode.firstElementChild);

	var snapshotButton = menuButton.cloneNode(true);

	snapshotButton.className = "pr-3 pl-4";

	var snapshotButtonButton = snapshotButton.querySelector("button");
	snapshotButtonButton.className = "btn-link muted-link v-align-middle no-underline project-header-link";
	snapshotButtonButton.innerHTML = copyIconSvg + " Snapshot";
	snapshotButtonButton.addEventListener("click", modal.openModal);

	menuButton.parentNode.insertBefore(snapshotButton, menuButton.parentNode.firstElementChild);
};