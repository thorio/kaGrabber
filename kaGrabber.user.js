// ==UserScript==
// @name					Kissanime Link Grabber
// @namespace			http://thorou.bitballoon.com/
// @version				1.4
// @description		gets openload links from kissanime.ru
// @author				Thorou
// @homepageURL		https://github.com/thorio/kaGrabber/
// @updateURL			https://github.com/thorio/kaGrabber/raw/master/kaGrabber.user.js
// @downloadURL		https://github.com/thorio/kaGrabber/raw/master/kaGrabber.user.js
// @match					https://kissanime.ru/*
// @match					https://oload.club/embed/*
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
		if ( (window.location.href.substring(8, 27) == "kissanime.ru/Anime/" || window.location.href.substring(7, 26) == "kissanime.ru/Anime/") && $(".barTitle").length > 0) {
			//grabber widget
			var grabberUIBox = document.createElement("div");
			grabberUIBox.id = "grabberUIBox";
			grabberUIBox.innerHTML = optsHTML; //HTML below; grabber widget
			var rightside = $("#rightside").get(0);
			rightside.insertBefore(grabberUIBox, rightside.children[2]); //insert grabber widget into rightside container
			var episodeCount = $(".listing").children(0).children().length - 2;
			$("#grabberTo").val(episodeCount); //set min and max for the episode selectors
			$("#grabberTo").attr("max", episodeCount);
			$("grabberFrom").attr("max", episodeCount);

			//link display
			var grabberList = document.createElement("div");
			grabberList.innerHTML = linkListHTML; //HTML below; link output
			$("#leftside").prepend(grabberList);

			//individual grab button for each individual episode
			var listingTable = $(".listing").children(0).get(0);
			var tableNum = document.createElement("th");
			tableNum.width = "3%";
			tableNum.innerText = "#";
			listingTable.children[0].prepend(tableNum);
			for (var i = 2; i < listingTable.children.length; i++) { //first two items aren't actually episodes
				var tableNum2 = document.createElement("td");
				tableNum2.innerHTML = (episodeCount - i + 2) + "&nbsp;";
				tableNum2.style.textAlign = "right";
				listingTable.children[i].prepend(tableNum2);
				var currentItem = listingTable.children[i].children[1];
				var currentEpisodeName = currentItem.children[0].innerText;
				var addedHTML = '<input type="button" value="grab" style="background-color: #527701; color: #ffffff; border: none; cursor: pointer;" onclick="KAstart(' + (episodeCount - i + 2) + ',' + (episodeCount - i + 2) + ', $(\'#grabberServer\')[0].value' + ')">&nbsp;'
				currentItem.innerHTML = addedHTML + currentItem.innerHTML;
			}
		}
		var script = document.createElement("script");
		script.type = "text/javascript";
		script.innerHTML = grabberScript; //JS below; grabber script
		document.head.appendChild(script);
	}

	//HTML and JS pasted here because Tampermonkey apparently doesn't allow resources to be updated
	//if you have a solution for including extra files that are updated when the script is reinstalled please let me know: thorio.git@gmail.com

	//the grabber widget injected into the page
	var optsHTML = `<div class="rightBox">
	<div class="barTitle">
		Batch Grabber
	</div>
	<div class="barContent">
		<div class="arrow-general">
			&nbsp;
		</div>
		<p style="margin-top: 0px;">
			<select id="grabberServer" onchange="KAsavePreferredServer()" style="width: 100%; font-size: 14.5px;">
				<option value="openload" selected>Openload</option>
				<option value="rapidvideo">RapidVideo (no captcha)</option>
				<option value="beta2">Beta2 Server</option>
				<option value="p2p">P2P Server</option>
				<option value="mp4upload">Mp4Upload</option>
				<option value="streamango">Streamango</option>
				<option value="nova">Nova Server</option>
				<option value="beta">Beta Server</option>
			</select>
		</p>
		<p>
			from
			<input type="number" id="grabberFrom" value=1 min=1 style="width: 40px; border: 1px solid #666666; background: #393939; padding: 3px; color: #ffffff;"> to
			<input type="number" id="grabberTo" value=1 min=1 style="width: 40px; border: 1px solid #666666; background: #393939; padding: 3px; color: #ffffff;">
		</p>
		<p>
			<div style="height: 28px;">
				<input type="button" value="Extract Links" style="background-color: #548602; color: #ffffff; border: none; padding: 5px; padding-left: 12px; padding-right: 12px; margin: 3px; font-size: 15px;" onclick="KAstart($('#grabberFrom')[0].value, $('#grabberTo')[0].value, $('#grabberServer')[0].value)">
			</div>
		</p>
	</div>
</div>
<div class="clear2">
</div>
`

	//initially hidden HTML that is revealed and filled in by the grabber script
	var linkListHTML = `<div class="bigBarContainer" id="grabberLinkContainer" style="display: none;">
	<div class="barTitle">
		<div id="grabberLinkDisplayTitle" style="width: 80%; float: left;">
		Extracted Links
		</div>
		<a style="float: right; cursor: pointer;" onclick="KAclose()">
			close &nbsp;
		</a>
	</div>
	<div class="barContent">
		<div class="arrow-general">
			&nbsp;</div>
		<div id="grabberLinkDisplay" style="word-break: break-all;"></div>
		<div style="height: 28px;">
			<input id="grabberGetStreamLinks" type="button" value="Get Stream Links" style="background-color: #548602; color: #ffffff; border: none; padding: 5px; padding-left: 12px; padding-right: 12px; margin: 3px; font-size: 15px; float: left" onclick="KAstartStreamLinks()">
			<input id="grabberShortenLinks" type="button" value="Shorten Links" style="background-color: #548602; color: #ffffff; border: none; padding: 5px; padding-left: 12px; padding-right: 12px; font-size: 15px; margin: 3px; float: left" onclick="KAshortenLinks()">
			<input id="grabberDownloadAll" type="button" value="Download All" style="background-color: #548602; color: #ffffff; border: none; padding: 5px; padding-left: 12px; padding-right: 12px; font-size: 15px; margin: 3px; float: left" onclick="KAdownloadAll(1000)" hidden>
		</div>
	</div>
</div>
`

	//js injected into the page, this gets the links
	var grabberScript = `//thorou
var katable = {};
var identifier = "kissanime.ru_DownloadData";

var regexStrings = {
	openload: '"https://openload.co/embed/(.*?)"',
	beta: '"https://lh3.googleusercontent.com/(.*?)"',
	beta2: '"https://lh3.googleusercontent.com/(.*?)"',
	p2p: '"https://p2p2.replay.watch/public/dist/index.html\\\\?id=(.*?)"',
	rapidvideo: '"https://www.rapidvideo.com/e/(.*?)"',
	mp4upload: '"https://www.mp4upload.com/embed-(.*?)"',
	streamango: '"https://streamango.com/embed/(.*?)"',
	nova: '"https://www.novelplanet.me/v/(.*?)"',
}

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
	katable = {}; //not a JSON, abort
	return false;
}

function KAstart(startnum, endnum, server) {
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
	katable.showTitle = $(".bigChar").get(0).text;
	katable.identifier = identifier; //not get confused with potential other data in window.name
	katable.episodeListObject = $(".listing").get(0).children[0].children; //html collection of all episode list objects
	katable.linklist = []; //list for all episode links
	katable.originalpage = window.location.href; //page to return to when finished
	katable.status = "getLink"; //status string to indicate current task
	katable.server = server || "openload";
	//katable.position = 0; //position in the episode selection
	//katable.endnum = 999; //array number to end at
	katable.finishedlist = []; //list of all extracted links
	for (var i = 2; i < katable.episodeListObject.length; i++) {
		katable.linklist.push(katable.episodeListObject[i].children[1].children[1].href + "&s=" + katable.server);
	}
	katable.linklist.reverse(); //kissanime lists episodes newest first, this reverses the list
	KAsavetable();
	window.location.href = katable.linklist[katable.position]; //goto link selection
}

function KAgetLink() {
	if (window.location.pathname.substr(0, 7) != "/Anime/" || window.location.href == katable.originalpage) {
		return;
	}
	var re = new RegExp(regexStrings[katable.server]);
	var results = document.body.innerHTML.match(re);
	if (results) {
		var currentLink = document.body.innerHTML.match(re)[0];
		katable.finishedlist.push(currentLink.split('"')[1]);
	} else {
		katable.finishedlist.push("error (selected server may not be available)")
	}
	katable.status = "getLink";
	katable.position++;
	if (katable.position >= katable.linklist.length || katable.position >= katable.endnum) {
		katable.status = "finished";
		KAsavetable();
		window.location.href = katable.originalpage;
	} else {
		KAsavetable();
		window.location.href = katable.linklist[katable.position];
	}
}

function KAprintLinks() {
	if (!(window.location.href.substring(8, 27) == "kissanime.ru/Anime/" || window.location.href.substring(7, 26) == "kissanime.ru/Anime/")) {
		return;
	}
	string = "";
	for (var i = 0; i < katable.finishedlist.length; i++) {
		string += '<a href="' + katable.finishedlist[i] + '" target="_blank">' + katable.finishedlist[i] + "</a><br>"
	}
	var grabberLinkDisplay = document.getElementById("grabberLinkDisplay");
	grabberLinkDisplay.innerHTML = string; //push the links to the display element

	$("#grabberLinkDisplayTitle")[0].innerText = "Extracted Links | " + katable.showTitle;
	if (katable.streamlinklist) {
		string = "<div id='grabberStreamLinks'>";
		for (var i = 0; i < katable.streamlinklist.length; i++) { //string together all stream links, also wrap them in anchor tags
			if (katable.streamlinklist[i] == "file not found") { // if there was an error getting the link
				string += "<a>file not found</a><br>";
			} else {
				string += "<a href='" + katable.streamlinklist[i] + "' download>" + katable.streamlinklist[i] + "</a><br>";
			}
		}
		grabberLinkDisplay.innerHTML += "<hr><p style='font-size: 16px'>Stream Links</p>" + string + "</div><br>";
		document.getElementById("grabberGetStreamLinks").hidden = true;
		document.getElementById("grabberDownloadAll").hidden = false;
	}
	if (katable.server != "openload") {
		$("#grabberShortenLinks").hide();
		$("#grabberGetStreamLinks").hide();
	}
	document.getElementById("grabberLinkContainer").style.display = "block"; //make the display visible
}

function KAgetStreamLink() {
	var ev = new MouseEvent("click");
	var el = document.elementFromPoint(20, 20);
	el.dispatchEvent(ev); //simulate click
	var re = new RegExp('"/stream/(.*?)"');
	var result = document.body.innerHTML.match(re); //get stream link
	if (result) {
		streamLink = result[0];
		streamLink = streamLink.split('"')[1]; //remove quotes
		streamLink = "https://openload.co" + streamLink;
		if (streamLink.slice(-10) == "?mime=true") {
			streamLink = streamLink.substr(0, streamLink.length - 10);
		}
	} else {
		streamLink = "file not found"
	}

	katable.streamlinklist.push(streamLink);
	katable.position++;

	if (katable.position >= katable.finishedlist.length) {
		katable.status = "finished";
	} else {
		katable.status = "streamLinkWorkaround"; //idk why openload reacts the way it does. *sigh*
	}
	KAsavetable();
	window.location.href = katable.originalpage;
}

function KAstartStreamLinks() {
	katable.streamlinklist = [];
	katable.position = 0;
	katable.status = "getStreamLink";
	KAsavetable();
	window.location.href = katable.finishedlist[katable.position].replace("openload.co", "oload.club");
}

function KAnextStreamLink() {
	katable.status = "getStreamLink";
	KAsavetable();
	window.location.href = katable.finishedlist[katable.position].replace("openload.co", "oload.club");
}

function KAshortenLinks() {
	katable.finishedlistbackup = katable.finishedlist.slice(0);
	for (var i in katable.finishedlist) {
		katable.finishedlist[i] = katable.finishedlist[i].substr(0, 38);
	}
	KAprintLinks();
	KAsavetable();
}

function KAdownloadAll(delay) {
	links = document.getElementById("grabberStreamLinks");
	for (var i = 0; i < links.children.length; i++) {
		if (links.children[i].click) {
			setTimeout(i => document.getElementById("grabberStreamLinks").children[i].click(), i * delay, i);
		}
	}
}

function KAsiteload() {
	if (KAloadtable()) { //check if data can be retrieved from window.name
		if (katable.status == "getLink") { //check which state the script is supposed to be in and call the appropriate function
			KAgetLink();
		} else if (katable.status == "getStreamLink") {
			KAgetStreamLink();
		} else if (katable.status == "finished") {
			KAprintLinks();
		} else if (katable.status == "streamLinkWorkaround") {
			KAnextStreamLink();
		}
	}
}

function KAclose() {
	window.name = "";
	$("#grabberLinkContainer").get(0).style.display = "none";
}

function KAloadPreferredServer() {
	if (localStorage.grabberPreferredServer && document.getElementById("grabberServer")) {
		$("#grabberServer")[0].value = localStorage.grabberPreferredServer;
	}
}

function KAsavePreferredServer() {
	localStorage.grabberPreferredServer = $("#grabberServer")[0].value;
}

if (window.name !== "") {
	KAsiteload();
}

KAloadPreferredServer()
`

	inject();
})();
