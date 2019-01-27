//thorou
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
	katable = {}; //not a JSON, abort
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
	katable.showTitle = $(".bigChar").get(0).text;
	katable.identifier = identifier; //not get confused with potential other data in window.name
	katable.episodeListObject = $(".listing").get(0).children[0].children; //html collection of all episode list objects
	katable.linklist = []; //list for all episode links
	katable.originalpage = window.location.href; //page to return to when finished
	katable.status = "captcha"; //status string to indicate current task
	//katable.position = 0; //position in the episode selection
	//katable.endnum = 999; //array number to end at
	katable.finishedlist = []; //list of all extracted links
	for (var i = 2; i < katable.episodeListObject.length; i++) {
		katable.linklist.push(katable.episodeListObject[i].children[1].children[1].href + "&s=openload");
	}
	katable.linklist.reverse(); //kissanime lists episodes newest first, this reverses the list
	KAsavetable();
	window.location.href = katable.linklist[katable.position]; //goto link selection
}

function KAwaitCaptcha() {
	var barTitle = document.getElementsByClassName("barTitle");
	if (barTitle.length == 0) {
		KAgetLink();
	} else {
		if (barTitle[0].innerText != "Are you human?") {
			KAgetLink();
		}
	}
}

function KAgetLink() {
	var re = new RegExp('"https://openload.co/embed/(.*?)"');
	var currentLink = document.body.innerHTML.match(re)[0];
	katable.finishedlist.push(currentLink.split('"')[1]);
	katable.status = "captcha";
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
	var string = "";
	for (var i = 0; i < katable.finishedlist.length; i++) { //string together all the links, seperated by spaces
		string += katable.finishedlist[i] + " ";
	}
	console.log(string);
	string = "";
	for (var i = 0; i < katable.finishedlist.length; i++) { //string together all the links, seperated by newlines
		string += katable.finishedlist[i] + String.fromCharCode(10);
	}
	var grabberLinkDisplay = document.getElementById("grabberLinkDisplay");
	grabberLinkDisplay.innerText = string; //push the links to the display element
	$("#grabberLinkDisplayTitle").get(0).innerText = "Extracted Links | " + katable.showTitle;
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
		katable.status = "streamlinkworkaround"; //idk why openload reacts the way it does. *sigh*
	}
	KAsavetable();
	window.location.href = katable.originalpage;
}

function KAstartStreamLinks() {
	katable.streamlinklist = [];
	katable.position = 0;
	katable.status = "getstreamlink";
	KAsavetable();
	window.location.href = katable.finishedlist[katable.position].replace("openload.co", "oload.club");
}

function KAnextStreamLink() {
	katable.status = "getstreamlink";
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
		if (katable.status == "captcha") { //check which state the script is supposed to be in and call the appropriate function
			KAwaitCaptcha();
		} else if (katable.status == "getstreamlink") {
			KAgetStreamLink();
		} else if (katable.status == "finished") {
			KAprintLinks();
		} else if (katable.status == "streamlinkworkaround") {
			KAnextStreamLink();
		}
	}
}

function KAclose() {
	window.name = "";
	$("#grabberLinkContainer").get(0).style.display = "none";
}

if (window.name !== "") {
	KAsiteload();
}