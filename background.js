"use strict";

// Only load for bing.com domain
chrome.runtime.onInstalled.addListener(function(details) {
	chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
		chrome.declarativeContent.onPageChanged.addRules([{
			conditions: [
			new chrome.declarativeContent.PageStateMatcher({
				pageUrl: {
					hostEquals: "www.bing.com",
					schemes: [ "http", "https" ]
				}
			})
			],
			actions: [ new chrome.declarativeContent.ShowPageAction() ]
		}]);
	});
});

chrome.pageAction.onClicked.addListener(function(tab) {
	// Insert spinner stylesheet
	chrome.tabs.insertCSS({"file": "spinner.css"});

	// Insert spinner javascript
	chrome.tabs.executeScript({"file": "spinner.js"});

	fetch("https://www.bing.com/rewardsapp/getoffers", {credentials: "include"})
	.then(function(response) {
		return response.json()
		.then(function(json) {
			if (json.ErrorDetail.ErrorCode == 0) {
				for (var i in json.Communications) {
					switch (json.Communications[i].ActivityType) {
						case "search":
							var searchParams = json.Communications[i].Message.description.match(/\d+/g);
							var totalSearches = searchParams[1] * searchParams[2];
							var terms = [];
							for (var j = 1; j <= Math.ceil(totalSearches / 10); j++) {
								// Get a list of search terms
								fetch("https://en.wikipedia.org/w/api.php?format=json&action=query&list=random&rnlimit=10&rnnamespace=0", {
									headers: {
										"Api-User-Agent": chrome.app.getDetails().name + "/" + chrome.app.getDetails().version
									}
								})
								.then(function(wikiResponse) {
									return wikiResponse.json()
									.then(function(wikiJson) {
										var queries = wikiJson.query.random;
										for (var k in queries)
											terms.push(queries[k].title);

										while (terms.length > 0) {
											// Search away
											fetch("https://www.bing.com/search?q=" + terms.shift(), {credentials: "include"})
											.catch(function(error) {
												console.error(error);
											});
										}
									})
								})
								.catch(function(error) {
									console.error(error);
								});
							}
						break;
						case "urlreward":
							// Activate the other offer links
							try {
								fetch("https://www.bing.com" + json.Communications[i].Message.destinationurl, {method: "HEAD"})
								.catch(function(error) {
									console.error(error);
								});
							} catch(e){}
						break;
						default:
							if (json.Communications[i].CommunicationId == "captcha_1")
								chrome.tabs.update(tab.id, {url: "https://www.bing.com" + json.Communications[i].Message.destinationurl})
						break;
					}
				}
			}
		})
	})
	// Refresh the page to see the new status
	chrome.tabs.update(tab.id, {"url": tab.url});
});
