////////////////////////////////////////////////
// Edit these Variables to customize the site //
////////////////////////////////////////////////
var defaultDisplayStyle = "Small"; // The starting size of the image results.  Can be "Small", "Medium", or "Large"
var xmlDirectory = "xml/"; // Directory where the XML files are located
var fileListName = "list.xml"; // The XML file that contains the list of the book XML files, their titles, and their DRS IDs
var categoryListName = "categories.xml"; // The XML file that contains the menu categories

// This is the help message that will appear when the user clicks help.  This is formatted using HTML.
var helpMessage = "<p>Click on any category to the left or enter a keyword in the search box and press the &lt;Enter&gt; key.  A gallery of images from the Books of Hours will appear that match that category or keyword.  Below the search box, you can set the size of the images (Small, Medium, or Large) that will display in the gallery.  If your search turns up too many results to fit on one page, a menu will appear above the gallery that will allow you to move forward and backward through the results.</p>\n\n<p>Above each image is the name of the book and the label (if any) that the library has assigned to that page.  Clicking on an image will take you to that item in Harvard Library's Digital Page Delivery Service.  From there, you will be able to see a higher quality version of that image as well as page forward and backward in that book. <\p>";

////////////////////////////////////////////////////////////////////////
// Do not edit below this line, unless you know what you are doing :) // 
////////////////////////////////////////////////////////////////////////

var database = new Array();
var displayStyle = defaultDisplayStyle; // Small, Medium, Large
var activeMenuId = null;
var categoryNames;
var fileCount; // Total number of files loaded
var percentIncrease;
var pb;
var loaded = false;
var resultsArray = null;  // Array where search results will be stored as resultObjects

document.observe('dom:loaded', initialize, false);

// Load the files, initialize the page
function initialize() {
	if (!loaded) {
		pb = new JS_BRAMUS.jsProgressBar($('progressBar'),0, {animate:false});
		pb._setBgPosition('0');
		loadMenuCategories();
		blurSearch();
		loaded = true;
	}
}

// Gets the width of the browser 
function getBrowserWidth(){
	if (window.innerWidth) {
		return window.innerWidth;
	} else if (document.documentElement && document.documentElement.clientWidth != 0) {
		return document.documentElement.clientWidth;
	} else if (document.body) {
		return document.body.clientWidth;
	}		
	return 0;
}

// A book
function bookObject() {
	
	this.bookName;
	this.fileName;
	this.drsid;
	this.pictures = new Array();
	this.categoryLinks = new Array();
}

// A picture
function pictureObject() {
	this.url;
	this.pageNumber = null;
	this.labels = new Array();
}

// A category
function categoryObject() {
	this.value;
	this.subCategories = new Array();
}

// A search result
function resultObject() {
	this.databaseIndex;
	this.pictureObject;
	this.labelIndex;
}

function showHelp() {

	$('results').innerHTML = "<div style='margin:10px;font-size:20px'>" + helpMessage + "</div>";
	
}

function loadMenuCategories() {
	
	new Ajax.Request(xmlDirectory + categoryListName,
		{
			method:'get',
			contentType: 'application/xml',
			onException: function(request, error) {alert("Exception1: " + error.message); },
			onFailure: function(){ alert("Something went wrong..."); },
			onSuccess: function(transport) {
				$('statusText').innerHTML = "Loading categories...";
				var rootNode = transport.responseXML.documentElement;
				categoryNames = loadCategoryXMLToArray(rootNode);
				loadData();
				displayCategories();				
			}
		}
	);
}

function displayCategories() {
	
	var htmlString = "";
		
	for (var i = 0; i < categoryNames.length; i++) {
		htmlString += 	"<div class='main'><a href='#' id='m" + i + "' onClick='menuActivate(\"" + i + "\"); return false;'>" +  
						categoryNames[i].value + "</a></div>\n";
		htmlString += getSubCategories(categoryNames[i].subCategories, i);
	}
	
	// Add help link at the bottom
	htmlString += "<hr />\n<div class='main'><a href='#' id='help' onClick='showHelp(); return false;'>Help</a></div>\n";
	
	$('menuLinks').innerHTML = htmlString;
	
	function getSubCategories(subArray, idPrefix) {
		if (!subArray) {
			return "";
		}
		var subString = "\t<div class='sub' id='menuGroup" + idPrefix + "'>\n";
		for (var i = 0; i < subArray.length; i++) {
			subString +=	"\t-<a href='#' id='m" + idPrefix + "-" + i + "' onClick='menuActivate(\"" + idPrefix + "-" + i + 
							"\"); return false;'>" + subArray[i].value + "</a><br />\n";
			subString += getSubCategories(subArray[i].subCategories, idPrefix + "-" + (i));
		}
		subString += "\t</div>\n";
		return subString;
	}
}

function menuActivate(path) {

	var count = 0;
	// Hide/Show Menu
	if($("menuGroup" + path) !== null) {
		if ($("menuGroup" + path).style.display == "none") {
			$("menuGroup" + path).style.display = "inline";
		} else if ($("menuGroup" + path).style.display == "inline") {
			$("menuGroup" + path).style.display = "none";
		} else { // Not activated yet
			$("menuGroup" + path).style.display = "inline";
		}
	}
	
	setActiveMenuItem("m" + path);
	resultsArray = new Array();
	
	// Display Pictures for menu item selected
	var array = path.split("-");
	var indexes = "";
	for (var i = 1; i < array.length; i++) {
		indexes += ".subCategories[" + array[i] + "]";
	}

	for (var x = 0; x < database.length; x++) {
		var string = "database[" + x + "].categoryLinks[" + array[0] + "]" + indexes;
		var pictureObject;
		try { 
			eval("pictureObject = database[" + x + "].categoryLinks[" + array[0] + "]" + indexes + ".value");
		} catch (err) {
			pictureObject = null;
		}
		if (pictureObject != null) {
			var result = new resultObject();
			result.databaseIndex = x;
			result.pictureObject = pictureObject;
			if (array.length - 1 < pictureObject.labels.length) {
				result.labelIndex = array.length-1;
			} else {
				result.labelIndex = pictureObject.labels.length-1;
			}
			resultsArray.push(result);
			count++;
		}
	}
	$('statusText').innerHTML = count + " pages found.";
	displayResults();
}

function setActiveMenuItem(id) {
	
	if (activeMenuId !== null) {
		$(activeMenuId).style.background = "transparent";
		$(activeMenuId).style.color = "black";
	}
	
	if (id === null) {
		// Don't activate anything
	} else {
		$(id).style.background = "#B3A36A";
	}

	activeMenuId = id;

}

function loadCategoryXMLToArray(rootNode) {
	var x = new Array();
	var currentNode = getFirstChild(rootNode);
	
	if (!currentNode) { // No children, don't need to process
		return null;
	}
	
	while (currentNode != null) {
		var category = new categoryObject();
		category.value = currentNode.getAttribute("name");
		category.subCategories = loadCategoryXMLToArray(currentNode);
		x.push(category);
		currentNode = getNextSibling(currentNode);
	}
	return x;
}
				

function loadData() {

	$('statusText').innerHTML = "Loading Book Data..."
	// Get list of Files, load them into the database
	new Ajax.Request(xmlDirectory + fileListName,
  		{
    		method:'get',
			contentType: 'application/xml',
			onException: function(request, error) {alert("Exception2: " + error.message); },
    		onSuccess: function(transport){
				var fileName, index, title ;
      			var response = transport.responseXML.getElementsByTagName("file");
				fileCount = response.length;
				percentIncrease = Math.floor((100 / fileCount));
				while (percentIncrease * fileCount < 100) {
					percentIncrease++;
				}
				percentIncrease = "+" + percentIncrease;
				for(var i = 0; i < response.length; i++) {
					database[i] = new bookObject();
					database[i].fileName = response[i].getAttribute("filename");
					database[i].bookName = response[i].getAttribute("title");
					database[i].drsid = response[i].getAttribute("drsid");
				}
				loadFiles();
    		},
    		onFailure: function(){ alert("Something went wrong..."); }
  		}
	);
}



function loadFiles() {
	
	var fileNum = 0;
	// For each file, load the metadata
	for (var i = 0, len = database.length; i < len; i++) {

		new Ajax.Request(xmlDirectory + database[i].fileName,
  			{
    			method:'get',
				contentType: 'application/xml',
				onException: function(request, error) {alert("Exception3: " + error.message); },
    			onSuccess: mySuccess(i),
    			onFailure: function(){ alert('Something went wrong...'); }
  			}
		);
	}

	function mySuccess(x){
		return function (response) {

			var url;
			var temp;
			var fptrTag;
			var count = 0;
			var index;
			
			// Load Image URLS
			var array = response.responseXML.getElementsByTagName("file");

			for (var i = 0, len = array.length; i < len; i++) {
				url = "http://ids.lib.harvard.edu/ids/view/" + array[i].getElementsByTagName("FLocat")[0].getAttribute("xlink:href");
				database[x].pictures[parseInt(array[i].getAttribute("ID"), 10)] = new pictureObject();
				database[x].pictures[parseInt(array[i].getAttribute("ID"), 10)].url = url;
			}
			
			// Load Image Labels
			var labelNode = getFirstChild(response.responseXML.getElementsByTagName("structMap")[0]); // Returns Parent DIV node for labels
			loadLabels(x, labelNode, "");
			

			fileNum++;
			$('statusText').innerHTML = "File " + (fileNum) + " of " + fileCount + " loaded.";
			database[x].pictures = database[x].pictures.compact(); // Removes null values since IDs don't always start at 0
			if(x >= database.length - 1) {
				$('statusText').innerHTML = "Loading Complete";
			}	
			
			var count = 0;
			for (var i = 0, len = database[x].pictures.length; i < len; i++) {
				if (database[x].pictures[i].pageNumber !== null) {
					 count++;
				}
			}
			pb.setPercentage(percentIncrease);

    	};
	}
}

function loadLabels(databaseIndex, rootNode, categoryIndex) {
	
	var currentNode = getFirstChild(rootNode);
	var test = false;
	if (!currentNode.getAttribute("LABEL")) { // Skip nodes without lables
		return null;
	}

	while (currentNode != null) {
		var fptrTag = currentNode.getElementsByTagName("fptr")[0];
		var pictureIndex = parseInt(fptrTag.getAttribute("FILEID"), 10);

		// Add label and page number to the picture in the database
		database[databaseIndex].pictures[pictureIndex].labels.push(currentNode.getAttribute("LABEL"));
		database[databaseIndex].pictures[pictureIndex].pageNumber = parseInt(fptrTag.parentNode.getAttribute("ORDER"), 10);
		
		var thisCategoryIndex = categoryLookup(categoryIndex, currentNode.getAttribute("LABEL"));
		if (thisCategoryIndex != null) { // We've found a Category Heading!
			loadLabels(databaseIndex, currentNode, categoryIndex + "-" + thisCategoryIndex);
			addCategoryLink(databaseIndex, database[databaseIndex].pictures[pictureIndex], categoryIndex + "-" + thisCategoryIndex);
		} else {
			loadLabels(databaseIndex, currentNode, categoryIndex);
		}
		currentNode = getNextSibling(currentNode);
	}
}

function categoryLookup (indexString, label) {

	var array;
	
	if (indexString === "") {
		array = categoryNames;
	
	} else {
		var path = indexString.split("-");
		var indexes = "";
		for (var i = 2; i < path.length; i++) {
			indexes += ".subCategories[" + path[i] + "]";
		}
		if (indexes == "") {
			array = eval("categoryNames[" + path[1] + "].subCategories");
		} else {
			array = eval("categoryNames[" + path[1] + "]" + indexes);
		}
	}
	if (array == null) {
		return null; // This Category has no sub-categories to search
	}

	for(var i = 0, len = array.length; i < len; i++) {
		if (label.toLowerCase().indexOf(array[i].value.toLowerCase()) != -1) {
			return i;
		}
	}
	return null;
}

function addCategoryLink(databaseIndex, pictureObject, indexString) {
	
	var path = indexString.split("-");

	var indexes = "";
	if (eval("database[" + databaseIndex + "].categoryLinks[" + path[1] + "]") == null) {
		eval("database[" + databaseIndex + "].categoryLinks[" + path[1] + "] = new categoryObject()");
	}
	for (var i = 2; i < path.length; i++) {
		indexes += ".subCategories[" + path[i] + "]";
		if (eval("database[" + databaseIndex + "].categoryLinks[" + path[1] + "]" + indexes) == null) {
			eval("database[" + databaseIndex + "].categoryLinks[" + path[1] + "]" + indexes + " = new categoryObject()");
		}
	}
	if (eval("database[" + databaseIndex + "].categoryLinks[" + path[1] + "]" + indexes + ".value") == null) {
		eval("database[" + databaseIndex + "].categoryLinks[" + path[1] + "]" + indexes + ".value = pictureObject;");
	}
}

function blurSearch() {
	
	if($('searchTerm').value == $('searchTerm').defaultValue || $('searchTerm').value == "") {
		$('searchTerm').value = $('searchTerm').defaultValue;
		$('searchTerm').style.color = 'grey';
		$('searchTerm').style.fontStyle = 'italic';
	}
}

function focusSearch() {
	
	$('searchTerm').style.color = 'black';
	$('searchTerm').style.fontStyle = 'normal';
	
	if($('searchTerm').value == $('searchTerm').defaultValue) {
		$('searchTerm').value = "";	
	} else {
		$('searchTerm').select();
	}
}

// Set the display style and then change the links accordingly
function setDisplayStyle(style) {
	
	displayStyle = style;
	displayResults();
	
	switch(style) {
		case "Small":
			$('displayStyle').innerHTML =	
				"<span style='background:#B3A36A'>Small</span> | <a href='#' onclick='setDisplayStyle(\"Medium\"); " +
				"return false;'>Medium</a> | <a href='#' onclick='setDisplayStyle(\"Large\"); return false;'>Large</a>";	
			break;
		case "Medium":
			$('displayStyle').innerHTML =	
				"<a href='#' onclick='setDisplayStyle(\"Small\"); return false;'>Small</a> | <span style='background:#B3A36A'>" + 
				"Medium</span> | <a href='#' onclick='setDisplayStyle(\"Large\"); return false;'>Large</a>";	
			break;
		case "Large":
			$('displayStyle').innerHTML =
				"<a href='#' onclick='setDisplayStyle(\"Small\"); return false;'>Small</a> | <a href='#' onclick='setDisplayStyle(\"Medium\"); " +
				"return false;'>Medium</a> | <span style='background:#B3A36A'>Large</span>";	
	}	
}

// Display the results - if more than one page of results, display the results for the given page.
function displayResults(page) {
	
	var screenType;
	if (page == null) {
		page = 1;
	}

	var output = "";
	if (resultsArray === null) {
		return;
	}
	
	var maxImagesPerPage;
	var imageWidth;
	var imageHeight;
	var contentWidth = getBrowserWidth() - 245 /* Menu */;
	$('pageList').style.width = contentWidth + "px";
	
	switch (displayStyle) {
		case "Small":
			imageWidth = Math.max(200, Math.floor((contentWidth / 6) - 10));
			imageHeight = 200;
			break;
		case "Medium":
			imageWidth = Math.max(300, Math.floor((contentWidth / 4) - 10));
			imageHeight = 225;
			break;
		case "Large":
			imageWidth = Math.max(375, Math.floor((contentWidth / 2) - 10)); // In this case, I want to fit 2 next to each other as big as possible
			imageHeight = 500;
			break;
	}

	switch (displayStyle) {
		case "Small":
			maxImagesPerPage = Math.floor(contentWidth / (imageWidth + 10)) * 2;
			break;
		case "Medium":
			maxImagesPerPage = Math.floor(contentWidth / (imageWidth + 10)) * 2;
			break;
		case "Large":
			maxImagesPerPage = Math.floor(contentWidth / (imageWidth + 10)) * 1;
			break;
	}
	
	var pages = Math.ceil(resultsArray.length / maxImagesPerPage);
	var start = 1;
	var end = pages;
	var pageHTML = "";
	if(page > 1) {
		pageHTML += "<a href='#' onclick='displayResults(" + (page - 1) + "); return false'>< Previous</a> ";
	} else {
		pageHTML += "< Previous ";
	}
	
	if (pages > 10) {
		var count = 0;
		start = page;
		end = page;
		while (count < 10) {
			if (start > 1) {
				start--;
				count++;
			}
			if (end < pages) {
				end++;
				count++
			}
		}
	}
	
	for (var i = start; i <= end; i++) {
		if (i == page) {
			pageHTML += page + " ";
		} else {
			pageHTML += "<a href='#' onclick='displayResults(" + i + "); return false'>" + i + "</a> ";
		}
	}
	if (page < pages) {
		pageHTML += "<a href='#' onclick='displayResults(" + (page + 1) + "); return false'>Next ></a> ";
	} else {
		pageHTML += "Next >";
	}
	
	if (pages > 1) {
		$('pageList').innerHTML = pageHTML;
	} else {
		$('pageList').innerHTML = " ";
	}
	
	for(var i = (page - 1) * maxImagesPerPage, j = 0; i < resultsArray.length && j < maxImagesPerPage; i++, j++) {
		var d = resultsArray[i].databaseIndex;
		var pictureObject = resultsArray[i].pictureObject;
		var l = resultsArray[i].labelIndex;
		output += 	"<div class='bookIcon' style='width:" + imageWidth + "px;height:" + (imageHeight + 40) + "px'>" + 
					"<a href='http://nrs.harvard.edu/urn-3:FHCL.HOUGH:" + database[d].drsid +
					"?n=" + pictureObject.pageNumber + "' target='_new'>";
		
		output += 	"<div class='bookIconText' style='width:" + imageWidth + "px'>" + 
					database[d].bookName + "<br />" + pictureObject.labels[l] + "</div>";
					
		output += 	"<img src='" + pictureObject.url;
		
		output += "?width=" + imageWidth + "&height=" + imageHeight + "' ";
		
		output += "border='0' alt='" + pictureObject.labels[l] + "' /></a></div>";
	}
	if (output === "") {
		$('results').innerHTML = "No Results Found<br />";
	} else {
		$('results').innerHTML = output;
	}			    
}

function searchBooks(key, maxResultsPerBook) {

	$('searchTerm').blur();
	if (!key) {
		if($('searchTerm').value === "" || $('searchTerm').value == $('searchTerm').defaultValue) {
			alert("Please enter a search term.");
			return;
		}
		key = $('searchTerm').value;
		setActiveMenuItem(null);
	}
	$('statusText').innerHTML = "Searching...";
	pb._setBgPosition('0');
	
	var resultCount = 0;
	var output = "";
	var bookNum = 0;
	var result;
	resultsArray = new Array();
	
	var id = setInterval(searchBook, 1);
	
	function searchBook() {
		var recordCount = 0;
		var i = bookNum;
		for(var j = 0, picLen = database[i].pictures.length; j < picLen; j++) {
			for(var k = 0, labLen = database[i].pictures[j].labels.length; k < labLen; k++) {
				if (database[i].pictures[j].labels[k].toLowerCase().indexOf(key.toLowerCase()) != -1) { // Found key in Label
					result = new resultObject();
					result.databaseIndex = i;
					result.pictureObject = database[i].pictures[j];
					result.labelIndex = k;
					resultsArray.push(result);
					recordCount++;
					resultCount++;
				}
				if (recordCount >= maxResultsPerBook) {
					return;
				}
			}
		}
		bookNum++;
		$('statusText').innerHTML = resultCount + " pages found.";
		pb.setPercentage(percentIncrease);
		if (bookNum >= database.length) {
			clearInterval(id);
			displayResults();
		}
	}
}

