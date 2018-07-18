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
	katable.finishedlist.push(document.getElementById("divContentVideo").children[0].src);
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
}