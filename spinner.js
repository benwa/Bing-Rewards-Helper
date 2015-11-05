// Create the overlay
var mainDiv = document.createElement("div");
mainDiv.className = "overlay";

// Create the spinner
var spinner = document.createElement("img");
spinner.src = chrome.extension.getURL("spinner.svg");
spinner.className = "spinner";

// Append the spinner to the overlay and the overlay to the page
mainDiv.appendChild(spinner);
document.body.appendChild(mainDiv);
