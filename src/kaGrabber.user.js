// ==UserScript==
// @name					Kissanime Link Grabber
// @namespace			http://thorou.bitballoon.com/
// @version				1.3.5
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
				var addedHTML = '<input type="button" value="grab" style="background-color: #527701; color: #ffffff; border: none; cursor: pointer;" onclick="KAstart(' + (episodeCount - i + 2) + ',' + (episodeCount - i + 2) + ')">&nbsp;'
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
	var optsHTML = `[[[[grabberOpts.html]]]]`

	//initially hidden HTML that is revealed and filled in by the grabber script
	var linkListHTML = `[[[[linkList.html]]]]`

	//js injected into the page, this gets the links
	var grabberScript = `[[[[kaGrabber.js]]]]`

	inject();
})();