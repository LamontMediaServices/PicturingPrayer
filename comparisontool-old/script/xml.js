// XML Crossbrowser Functions
function getFirstChild (node) {

	var x = node.firstChild;
	while (x != null && x.nodeType!=1) {
	  x = x.nextSibling;
  	}
	return x;
}

function getLastChild (node) {
	
	var x = node.lastChild;
	while (x != null && x.nodeType!=1) {
  		x = x.previousSibling;
  	}
	return x;
}

function getNextSibling (node) {

	var x = node.nextSibling;
	while (x != null && x.nodeType != 1) {
		x = x.nextSibling;
	}
	return x;
}

function getPreviousSibling (node) {

	var x = node.previousSibling;
	while (x != null && x.nodeType!=1) {
		x = x.previousSibling;
  	}
	return x;
}