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