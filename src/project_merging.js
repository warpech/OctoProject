var projectInfo = require("./project_info");

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
  return text.match(urlRegex);
}

function getColumnName(elem) {
  return elem.querySelector(COLUMN_NAME).innerText;
}

function getColumnByName(elem, name) {
  return Array.from(elem.querySelectorAll(COLUMN_NAME)).find((node) => node.innerText === name);
}

function updateCardCount(elem) {
  elem.querySelector(CARD_COUNT).innerHTML = elem.querySelectorAll(COLUMN_CARD).length;
}

function mergeColumns(elem) {
  var keepers = {};
  var removeList = [];
  elem.querySelectorAll(PROJECT_COLUMN).forEach((column) => {
    var name = getColumnName(column);
    if (keepers[name]) {
      //merge
      var cards = keepers[name].querySelector(COLUMN_CARDS);
      var cardsToMove = column.querySelectorAll(COLUMN_CARD);
      if (cardsToMove.length) {
        cardsToMove.forEach((card) => cards.appendChild(card));
        updateCardCount(keepers[name]);
        removeList.push(column);
      }
    } else {
      keepers[name] = column;
    }
  });
  removeList.forEach((elem) => elem.parentNode.removeChild(elem));
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
      elem.querySelector(INCLUDE_FRAGMENT).addEventListener("load", () => mergeColumns(container)); //include-fragment element dispatches that event    
    });
  });
}

function fetchAllProjects() {
  var desc = $(PROJECT_DESCRIPTION).innerText;
  var urls = findOrgProjectUrls(desc);
  $(COLUMNS_CONTAINER).innerHTML = "";
  urls.forEach((url) => fetchProjectPage("https://" + url));
  projectInfo.setProjectTitle(projectInfo.getProjectTitle() + ` (merged ${urls.length} projects)`);
}

function main() {
  fetchAllProjects();
}

main();