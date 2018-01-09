var projectInfo = require("./project_info");
var projectSnapshot = require("./project_snapshot");

var $$ = document.querySelectorAll.bind(document);
var $ = document.querySelector.bind(document);
var urlRegex = /((github\.com\/orgs\/)([^\/]+)\/projects\/([\d])+)/g;
var COLUMN_NAME = ".js-project-column-name";
var CARD_COUNT = ".js-column-card-count";
var COLUMN_CARD = ".project-card";
var COLUMN_CARDS = ".js-project-column-cards";
var PROJECT_COLUMN = ".project-column";
var COLUMNS_CONTAINER = ".project-columns-container";
var PROJECT_DESCRIPTION = ".project-body-markdown";
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

function fetchAllProjects() {
  var desc = $(PROJECT_DESCRIPTION).innerText;
  var urls = findOrgProjectUrls(desc);
  if (urls.length > 1) {
    $(COLUMNS_CONTAINER).innerHTML = "";
    urls.forEach((url) => fetchProjectPage("https://" + url));
    projectInfo.setProjectTitle(projectInfo.getProjectTitle() + ` (merged ${urls.length} projects)`);
    addCustomStyles();
  }
}

function main() {
  fetchAllProjects();
  projectSnapshot.addSnapshotButton();
}

main();