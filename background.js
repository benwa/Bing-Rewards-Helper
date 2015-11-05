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

	// Get current reward offers
	var offersXHR = new XMLHttpRequest();
	offersXHR.open("GET", "https://www.bing.com/rewardsapp/getoffers", false);
	offersXHR.onload = function() {
		var json = JSON.parse(offersXHR.responseText);
		if (json.ErrorDetail.ErrorCode == 0) {
			for (var i in json.Communications) {
				switch (json.Communications[i].ActivityType) {
					case "search":
						var searchParams = json.Communications[i].Message.description.match(/\d+/g);
						var totalSearches = searchParams[1] * searchParams[2];
						var terms = [];
						for (var j = 1; j <= Math.ceil(totalSearches / 10); j++) {
							// Get a list of search terms
							var xhr = new XMLHttpRequest();
							xhr.open("GET", "https://en.wikipedia.org/w/api.php?format=json&action=query&list=random&rnlimit=10&rnnamespace=0", false);
							xhr.setRequestHeader("Api-User-Agent", chrome.app.getDetails().name + "/" + chrome.app.getDetails().version);
							xhr.onload = function() {
								var queries = JSON.parse(xhr.responseText).query.random;
								for (var k in queries)
									terms.push(queries[k].title);
							}
							xhr.send();
						}

						while (terms.length > 0) {
							// Search away
							var xhr = new XMLHttpRequest();
							xhr.open("GET", "https://www.bing.com/search?q=" + terms.shift(), false);
							try{xhr.send(null);} catch(e){}
						}

					break;
					case "urlreward":
						// Active the other offer links
						var xhr = new XMLHttpRequest();
						xhr.open("HEAD", "https://www.bing.com" + json.Communications[i].Message.destinationurl, false);
						try{xhr.send(null);} catch(e){}
					break;
					default:
					break;
				}
			}
		}
	}
	try{offersXHR.send(null);} catch(e){}

	// Refresh the page to see the new status
	chrome.tabs.update(tab.id, {"url": tab.url});
});
