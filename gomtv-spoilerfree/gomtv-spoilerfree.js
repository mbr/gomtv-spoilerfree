// TODO: load options here

var options = {
	"hide-recent-videos": true,
	"hide-social-networks": true,
	"hide-comments": true,
	"hide-schedule": true,
	"hide-flash-video-player": true,
}

chrome.extension.onRequest.addListener(
	function(request, sender, sendResponse) {
		//	console.log('got request from',request,sender);
		if (request.action == "get_options") {
			sendResponse(options);
		}
	}
)
