<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<meta name="keywords" content="book of hours, harvard, houghton, library, religion, medieval" />

<!-- Style Sheet -->
<link rel="stylesheet" type="text/css" href="comparison.css" />

<!-- Javascript Prototype - http://www.prototypejs.org/ -->
<script language="javascript" type="text/javascript" src="script/prototype.js"></script>

<!-- Crossbrowser XML Functions -->
<script language="javascript" type="text/javascript" src="script/xml.js"></script>

<!-- Book of Hours Search Functions -->
<script language="javascript" type="text/javascript" src="script/search.js"></script>

<!-- Progress Bar - http://www.bram.us/ -->
<script language="javascript" type="text/javascript" src="script/jsProgressBarHandler.js"></script>

<title>Book of Hours: Comparison</title>
</head>

<body onload="initialize();">
<div id="container">

<div id="menu">
<form action="javascript:searchBooks();"><input type="text" id="searchTerm" value="Search Books of Hours" onblur="blurSearch();" onfocus="focusSearch();"/>
<img src="images/search.gif" onclick="searchBooks()" id="searchIcon"/>
</form>
<div id="progressBar">0%</div>
<div id="statusText">Loading...</div>
<div id="displayStyle"><span style="background:#B3A36A">Small</span> | <a href="#" onclick="setDisplayStyle('Medium'); return false;">Medium</a> | <a href="#" onclick="setDisplayStyle('Large'); return false;">Large</a></div>
<hr />
<div id="menuLinks">Loading Menu...</div>
<!-- id="menu" -->
</div>

<div id="content">
<div id="pageList"></div>
<div id="results"><div style="margin:10px;font-size:20px">Welcome to the Book of Hours Comparison Tool.  This page will allow you to search the Books of Hours, by keyword or by category, and compare pages of different books side by side.  Clicking on any image will take you directly to Harvard Library's Digital Page Delivery System where you can view higher quality images and page through the rest of the book.  To get started, try looking at the "Calendar" in each book or search for "child."</div></div>
<!-- id="content" -->
</div>
<!-- id="container" -->
</div>
</body>
</html>

