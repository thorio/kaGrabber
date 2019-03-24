//thorou
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
		katable.startnum = katable.position = 0;
	} else {
		katable.startnum = katable.position = startnum - 1;
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
	//if (katable.streamlinklist) {
	//	string = "<div id='grabberStreamLinks'>";
	//	for (var i = 0; i < katable.streamlinklist.length; i++) { //string together all stream links, also wrap them in anchor tags
	//		if (katable.streamlinklist[i] == "file not found") { // if there was an error getting the link
	//			string += "<a>file not found</a><br>";
	//		} else {
	//			string += "<a href='" + katable.streamlinklist[i] + "' download>" + katable.streamlinklist[i] + "</a><br>";
	//		}
	//	}
	//	grabberLinkDisplay.innerHTML += "<hr><p style='font-size: 16px'>Stream Links</p>" + string + "</div><br>";
	//	document.getElementById("grabberDownloadAll").hidden = false;
	//}
	$("#grabberShortenLinks").hide();
	$("#grabberGetStreamLinks").hide();
	if (window.location.href == katable.originalpage) {
		$("#grabberExportJSON").show();
	}
	document.getElementById("grabberLinkContainer").style.display = "block"; //make the display visible
}

function KAexportJSON() {
	var list = $(".listing").get(0).children[0].children;
	var data = {
		title: katable.showTitle,
		server: katable.server,
		episodes: []
	};
	for (var i = katable.startnum; i < katable.endnum; i++) {
		data.episodes.push({
			number: i+1,
			name: list[list.length-i-1].children[1].innerText,
			link: katable.finishedlist[i]
		});
	}
	$("#grabberLinkDisplay")[0].innerHTML += '<textarea id="grabberJSONdisplay" rows=4 style="width: 100%;background-color: #252525;color: #DADADA;border: none;"></textarea>';
	$("#grabberJSONdisplay")[0].innerText = JSON.stringify(data);
	$("#grabberExportJSON").hide();
}

//unused
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
