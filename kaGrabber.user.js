// ==UserScript==
// @name         Kissanime Link Grabber dev
// @namespace    http://tampermonkey.net/
// @version      0.1.2.14
// @description  nothin yet
// @author       Thorou
// @homepageURL  https://github.com/thorio/kaGrabber/
// @updateURL  http://localhost:8080/kaGrabber.user.js
// @downloadURL  http://localhost:8080/kaGrabber.user.js
// @match        http://kissanime.ru/*
// ==/UserScript==

(function() {
	'use strict';
	function inject() {
		//add UI elements
		if (window.location.href.substring(0, 26) == "http://kissanime.ru/Anime/" && document.getElementsByClassName("barTitle").length>0) {
			var rightside = document.getElementById("rightside");
			var grabberUIBoxElement = document.createElement("div");
			grabberUIBoxElement.id = "grabberUIBoxElement";
			grabberUIBoxElement.innerHTML = optsHTML; //injected HTML can be found below
			rightside.insertBefore(grabberUIBoxElement, rightside.children[2]);
			var episodeCount = document.getElementsByClassName("listing")[0].children[0].children.length-2;
			document.getElementById("grabberTo").value = episodeCount; //set min and max for the episode selectors
			document.getElementById("grabberTo").max = episodeCount;
			document.getElementById("grabberFrom").max = episodeCount;
		}
		var script = document.createElement('script');
		script.type = "text/javascript";
		script.innerHTML = grabberScript; //injected js can be found below
		document.getElementsByTagName('head')[0].appendChild(script);
	}

	//HTML and JS pasted here because Tampermonkey apparently doesn't allow resources to be updated

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
</div>`;

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
	if (katable.identifier === identifier) { //is the JSON from this script? 
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
		katable.linklist.push(katable.episodeListObject[i].children[0].children[0].href)
	}
	katable.linklist.reverse();
	KAsavetable();
	window.location.href = katable.linklist[katable.position]; //goto link selection
}

function KAwaitCaptcha() {
	var barTitle = document.getElementsByClassName("barTitle");
	if (barTitle.length == 0) {
		KAchangeServer();
	} else {
		if (barTitle[0].innerText != "Are you human?") {
			KAchangeServer();
		}
	}
}

function KAchangeServer() {
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


function KAprintlinks() {
	var string = ""; 
	for (var i = 0; i<katable.finishedlist.length; i++) { //string together all the links, seperated by spaces.
		string += katable.finishedlist[i] + " ";
	}
	alert(string);
	console.log(string)
	window.name = "";
}

function KAsiteload() {
	if (KAloadtable()) {
		if (katable.status == "captcha") {
			KAwaitCaptcha();
		} else if (katable.status == "getlink") {
			KAgetLink();
		} else if (katable.status == "finished") {
			KAprintlinks();
		}
	}

}

if (window.name !== "") {
	KAsiteload();
}`;
	inject(); //run the injection code after the above has been defined
})();