// Create the overlay
var mainDiv = document.createElement("div");
mainDiv.className = "overlay";
var containerDiv = document.createElement("div");
containerDiv.className = "progressContainer";

mainDiv.appendChild(containerDiv);
document.body.appendChild(mainDiv);

var progress = new ProgressBar.Circle(containerDiv, {
	color: "#ffffff",
	strokeWidth: 2,
	trailColor: "#f4f4f4",
	trailWidth: 0.8
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	progress.animate(request.current / request.max);
	progress.setText(request.current + "/" + request.max);
});
