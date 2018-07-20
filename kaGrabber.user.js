// ==UserScript==
// @name					Kissanime Link Grabber
// @namespace			http://thorou.bitballoon.com/
// @version				1.2
// @description		gets openload links from kissanime.ru
// @author				Thorou
// @license				MIT
// @homepageURL		https://github.com/thorio/kaGrabber/
// @updateURL			https://github.com/thorio/kaGrabber/raw/master/kaGrabber.user.js
// @downloadURL		https://github.com/thorio/kaGrabber/raw/master/kaGrabber.user.js
// @match					http://kissanime.ru/*
// ==/UserScript==
//
//Copyright 2018 Leon Timm
//
//Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
//The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
//THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

(function() {
	'use strict';

	function inject() {
		//add UI elements
		if (window.location.href.substring(0, 26) == "http://kissanime.ru/Anime/" && document.getElementsByClassName("barTitle").length > 0) {
			//grabber widget
			var grabberUIBox = document.createElement("div");
			grabberUIBox.id = "grabberUIBox";
			grabberUIBox.innerHTML = optsHTML; //HTML below; grabber widget
			document.getElementById("rightside").insertBefore(grabberUIBox, rightside.children[2]); //insert grabber widget into rightside container
			var episodeCount = document.getElementsByClassName("listing")[0].children[0].children.length - 2;
			document.getElementById("grabberTo").value = episodeCount; //set min and max for the episode selectors
			document.getElementById("grabberTo").max = episodeCount;
			document.getElementById("grabberFrom").max = episodeCount;

			//link display
			var grabberList = document.createElement("div");
			grabberList.innerHTML = linkListHTML; //HTML below; link output
			document.getElementById("leftside").prepend(grabberList);

			//individual grab button for each individual episode
			var listingTable = document.getElementsByClassName("listing")[0].children[0];
			for (var i = 2; i < listingTable.children.length; i++) { //first two items aren't actually episodes
				var currentItem = listingTable.children[i].children[0];
				var currentEpisodeName = currentItem.children[0].innerText;
				//var addedHTML = '<a onclick="KAstart(' + (episodeCount - i + 2) + ',' + (episodeCount - i + 2) + ')" title="Download ' + currentEpisodeName + '">download</a> - '
				var addedHTML = '<input type="button" value="grab" style="background-color: #527701; color: #ffffff; border: none; cursor: pointer;" onclick="KAstart(' + (episodeCount - i + 2) + ',' + (episodeCount - i + 2) + ')">&nbsp;'
				currentItem.innerHTML = addedHTML + currentItem.innerHTML;
			}
		}
		var script = document.createElement('script');
		script.type = "text/javascript";
		script.innerHTML = grabberScript; //JS below; grabber script
		document.getElementsByTagName('head')[0].appendChild(script);
	}

	//HTML and JS pasted here because Tampermonkey apparently doesn't allow resources to be updated
	//if you have a solution for including extra files that are updated when the script is reinstalled please let me know through GitHub

	//the grabber widget injected into the page
	var optsHTML = `<!--thorou-->
<div class="rightBox">
	<div class="barTitle">
		Batch Grabber
	</div>
	<div class="barContent">
		<div class="arrow-general">
			&nbsp;
		</div>
		from <input type="number" id="grabberFrom" value=1 min=1 style="width: 40px; border: 1px solid #666666; background: #393939; padding: 3px; color: #ffffff;"> to <input type="number" id="grabberTo" value=1 min=1 style="width: 40px; border: 1px solid #666666; background: #393939; padding: 3px; color: #ffffff;">
		<br><br>
		<input type="button" value="Grab All" style="background-color: #527701; color: #ffffff; border: none; padding: 5px; padding-left: 12px; padding-right: 12px; font-size: 15px; float: left" onclick="KAstart()">
		<div style="width: 5px; float: left">&nbsp;</div>
		<input type="button" value="Grab Range" style="background-color: #527701; color: #ffffff; border: none; padding: 5px; padding-left: 12px; padding-right: 12px; font-size: 15px; float: left" onclick="KAstart(document.getElementById('grabberFrom').value,document.getElementById('grabberTo').value)">
	</div>
</div>
<div class="clear2">
</div>`

	//initially hidden HTML that is revealed and filled in by the grabber script
	var linkListHTML = `<div class="bigBarContainer" id="grabberLinkContainer" style="display: none;">
	<div class="barTitle">
		Extracted Links
	</div>
	<div class="barContent">
		<div class="arrow-general">
			&nbsp;</div>
		<div id="grabberLinkDisplay"></div>
	</div>
</div>`

	//js injected into the page, this gets the links
	var grabberScript = `//thorou
var katable = {};
var identifier = "kissanime.ru_DownloadData";

function KAsavetable() {
	window.name = JSON.stringify(katable);
}

function KAloadtable() {
	try { //check if string is valid JSON object
		JSON.parse(window.name);
	} catch (e) {
		return false;
	}
	katable = JSON.parse(window.name);
	if (katable.identifier === identifier) { //check if data is from this script (incase another script is using window.name)
		return true;
	}
	delete katable; //not a JSON, abort
	return false;
}

function KAstart(startnum, endnum) {
	if (window.location.hostname != "kissanime.ru") {
		return false;
	}
	katable = {};
	if (startnum === undefined) {
		katable.position = 0;
	} else {
		katable.position = startnum - 1;
	}
	if (endnum === undefined) {
		katable.endnum = 999;
	} else {
		katable.endnum = endnum;
	}
	katable.identifier = identifier; //not get confused with potential other data in window.name
	katable.episodeListObject = document.getElementsByClassName("listing")[0].children[0].children; //list all epiode list objects
	katable.linklist = []; //list for all episode links
	katable.originalpage = window.location.href; //page to return to when finished
	katable.status = "captcha"; //status string to indicate current task
	//katable.position = 0; //position in the episode selection
	katable.position2 = 0; //position in link selection for an episode
	//katable.endnum = 999; //array number to end at
	katable.finishedlist = []; //list of all extracted streams
	for (var i = 2; i < katable.episodeListObject.length; i++) {
		katable.linklist.push(katable.episodeListObject[i].children[0].children[1].href);
	}
	katable.linklist.reverse();
	KAsavetable();
	window.location.href = katable.linklist[katable.position]; //goto link selection
}

function KAwaitCaptcha() {
	var barTitle = document.getElementsByClassName("barTitle");
	if (barTitle.length == 0) {
		KAchangeSource();
	} else {
		if (barTitle[0].innerText != "Are you human?") {
			KAchangeSource();
		}
	}
}

function KAchangeSource() {
	var selectServerList = document.getElementById("selectServer").children;
	for (var i = 0; i < selectServerList.length; i++) {
		if (selectServerList[i].innerText == "Openload") {
			katable.status = "getlink";
			KAsavetable();
			window.location.href = selectServerList[i].value;
		}
	}
}

function KAgetLink() {
	var re = new RegExp('"https://openload.co/embed/(.*?)"');
	var currentLink = document.body.innerHTML.match(re)[0];
	katable.finishedlist.push(currentLink.split('"')[1]);
	katable.status = "captcha";
	katable.position += 1
	if (katable.position >= katable.linklist.length || katable.position >= katable.endnum) {
		katable.status = "finished"
		KAsavetable();
		window.location.href = katable.originalpage;
	} else {
		KAsavetable();
		window.location.href = katable.linklist[katable.position];
	}
}


function KAprintLinks() {
	var string = ""; 
	for (var i = 0; i<katable.finishedlist.length; i++) { //string together all the links, seperated by spaces
		string += katable.finishedlist[i] + " ";
	}
	console.log(string);
	var stringList = "";
	for (var i = 0; i<katable.finishedlist.length; i++) { //string together all the links, seperated by newlines
		stringList += katable.finishedlist[i] + String.fromCharCode(10);
	}
	document.getElementById("grabberLinkDisplay").innerText = stringList; //push the links to the display element
	document.getElementById("grabberLinkContainer").style.display = "block"; //make the display visible
	window.name = "";
}

function KAsiteload() {
	if (KAloadtable()) { //check which state the script is supposed to be in and call the appropriate function
		if (katable.status == "captcha") {
			KAwaitCaptcha();
		} else if (katable.status == "getlink") {
			KAgetLink();
		} else if (katable.status == "finished") {
			KAprintLinks();
		}
	}

}

if (window.name !== "") {
	KAsiteload();
}`

	inject();
})();