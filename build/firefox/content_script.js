/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

function getTextNode(node) {
	return Array.from(node.childNodes).filter(f => f.nodeType === Node.TEXT_NODE && f.textContent.trim() != "")[0];
}

function findTitleElement() {
	return document.querySelector(".project-header h3");
}

exports.getProjectTitle = function() {
	return getTextNode(findTitleElement()).textContent;
};

exports.setProjectTitle = function(str) {
	getTextNode(findTitleElement()).textContent = str;
};

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(2);
__webpack_require__(0);

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

var projectInfo = __webpack_require__(0);
var projectSnapshot = __webpack_require__(3);

var $$ = document.querySelectorAll.bind(document);
var $ = document.querySelector.bind(document);
var urlRegex = /((github\.com\/orgs\/)([^\/]+)\/projects\/([\d])+)/g;
var COLUMN_NAME = ".js-project-column-name";
var CARD_COUNT = ".js-column-card-count";
var COLUMN_CARD = ".project-card";
var COLUMN_CARDS = ".js-project-column-cards";
var PROJECT_COLUMN = ".project-column";
var COLUMNS_CONTAINER = ".project-columns-container";
var PROJECT_DESCRIPTION = ".project-body-markdown:last-of-type"; //multiline descriptions are divided into shown and hidden
var INCLUDE_FRAGMENT = "include-fragment";

function findOrgProjectUrls(text) {
  return text.match(urlRegex) || [];
}

function getColumnName(elem) {
  return elem.querySelector(COLUMN_NAME).innerText;
}

function getColumnByName(elem, name) {
  return Array.from(elem.querySelectorAll(COLUMN_NAME)).find((node) => node.innerText === name).closest(PROJECT_COLUMN);
}

function updateCardCount(elem) {
  var card = elem.querySelector(CARD_COUNT);
  var lastCount = elem.querySelectorAll(COLUMN_CARD).length;
  if (card.lastCount !== lastCount) {
    card.lastCount = lastCount;
    card.innerHTML = lastCount;
  }
}

function mergeColumns(container, column) {
  var name = getColumnName(column);
  var original = getColumnByName(container, name);
  if (original == column) {
    var observer = new MutationObserver(function(mutationsList) {
      updateCardCount(original);
    });
    observer.observe(original.querySelector(COLUMN_CARDS), {
      childList: true
    });
    return;
  }

  var cards = original.querySelector(COLUMN_CARDS);
  var cardsToMove = column.querySelectorAll(COLUMN_CARD);
  cardsToMove.forEach((card) => cards.appendChild(card));
  cardsToMove.forEach((card) => {
    card.classList.remove("js-updatable-content", "draggable", "js-keyboard-movable");
  });

  container.removeChild(column);
}

function addCustomStyles() {
  var ss = document.createElement("style");
  ss.innerHTML = `.project-card {
  pointer-events: none;
}

.project-card a,
.project-card button {
  pointer-events: all;
}`;
  document.head.appendChild(ss);
}

function fetchProjectPage(url) {
  var req = new Request(url, {
    method: "GET",
    headers: {
      Accept: "text/html",
    },
    credentials: "same-origin"
  });
  fetch(req).then((res) => {
    return res.text();
  }).then((html) => {
    let frag = document.createRange().createContextualFragment(html);
    let elems = frag.querySelectorAll(PROJECT_COLUMN);
    let container = $(COLUMNS_CONTAINER);
    elems.forEach((elem) => {
      container.appendChild(elem);
      elem.querySelector(INCLUDE_FRAGMENT).addEventListener("load", () => mergeColumns(container, elem)); //include-fragment element dispatches that event    
    });
  });
}

function fetchAllProjects(container) {
  var desc = $(PROJECT_DESCRIPTION).innerText;
  var urls = findOrgProjectUrls(desc);
  if (urls.length > 1) {
    container.innerHTML = "";
    urls.forEach((url) => fetchProjectPage("https://" + url));
    projectInfo.setProjectTitle(projectInfo.getProjectTitle() + ` (merged ${urls.length} projects)`);
    addCustomStyles();
  }
}

function main() {
  var container = $(COLUMNS_CONTAINER);
  if (container) {
    fetchAllProjects(container);
    projectSnapshot.addSnapshotButton();
  }
}

main();

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

const copyIconSvg = `<svg aria-hidden="true" class="octicon octicon-clippy" height="16" version="1.1" viewBox="0 0 14 16" width="14"><path fill-rule="evenodd" d="M2 13h4v1H2v-1zm5-6H2v1h5V7zm2 3V8l-3 3 3 3v-2h5v-2H9zM4.5 9H2v1h2.5V9zM2 12h2.5v-1H2v1zm9 1h1v2c-.02.28-.11.52-.3.7-.19.18-.42.28-.7.3H1c-.55 0-1-.45-1-1V4c0-.55.45-1 1-1h3c0-1.11.89-2 2-2 1.11 0 2 .89 2 2h3c.55 0 1 .45 1 1v5h-1V6H1v9h10v-2zM2 5h8c0-.55-.45-1-1-1H8c-.55 0-1-.45-1-1s-.45-1-1-1-1 .45-1 1-.45 1-1 1H3c-.55 0-1 .45-1 1z"></path></svg>`;

const copy = __webpack_require__(4)

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

/***/ }),
/* 4 */
/***/ (function(module, exports) {

module.exports = clipboardCopy

function clipboardCopy (text) {
  // A <span> contains the text to copy
  var span = document.createElement('span')
  span.textContent = text
  span.style.whiteSpace = 'pre' // Preserve consecutive spaces and newlines

  // An <iframe> isolates the <span> from the page's styles
  var iframe = document.createElement('iframe')
  iframe.sandbox = 'allow-same-origin'
  document.body.appendChild(iframe)

  var win = iframe.contentWindow
  win.document.body.appendChild(span)

  var selection = win.getSelection()

  // Firefox fails to get a selection from <iframe> window, so fallback
  if (!selection) {
    win = window
    selection = win.getSelection()
    document.body.appendChild(span)
  }

  var range = win.document.createRange()
  selection.removeAllRanges()
  range.selectNode(span)
  selection.addRange(range)

  var success = false
  try {
    success = win.document.execCommand('copy')
  } catch (err) {}

  selection.removeAllRanges()
  span.remove()
  iframe.remove()

  return success
}


/***/ })
/******/ ]);