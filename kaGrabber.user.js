// ==UserScript==
// @name         Kissanime Link Grabber
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  nothin yet
// @author       Thorou
// @homepageURL  http://thorou.bitballoon.com
// @downloadURL  http://localhost:8080/kaGrabber.user.js
// @resource optsHTML http://localhost:8080/grabberOpts.html
// @resource grabberScript http://localhost:8080/kaGrabber.js
// @match        http://kissanime.ru/*
// @grant        GM_getResourceText
// ==/UserScript==

(function() {
	'use strict';
	//add UI elements
	if (window.location.href.substring(0, 26) == "http://kissanime.ru/Anime/" && document.getElementsByClassName("barTitle").length>0) {
		var rightside = document.getElementById("rightside");
		var grabberUIBoxElement = document.createElement("div");
		grabberUIBoxElement.id = "grabberUIBoxElement";
		grabberUIBoxElement.innerHTML = GM_getResourceText("optsHTML", "text");
		rightside.insertBefore(grabberUIBoxElement, rightside.children[2]);
		var episodeCount = document.getElementsByClassName("listing")[0].children[0].children.length-2;
		document.getElementById("grabberTo").value = episodeCount; //set min and max for the episode selectors
		document.getElementById("grabberTo").max = episodeCount;
		document.getElementById("grabberFrom").max = episodeCount;
	}
	var grabberScript = GM_getResourceText("grabberScript", "text"); //this is the script that actually does the grabbing
	//now inject the script into the page
	var script = document.createElement('script');
	script.type = "text/javascript";
	script.innerHTML = grabberScript;
	document.getElementsByTagName('head')[0].appendChild(script);
})();