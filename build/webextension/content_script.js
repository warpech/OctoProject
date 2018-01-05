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

/***/ })
/******/ ]);