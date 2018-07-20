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
}