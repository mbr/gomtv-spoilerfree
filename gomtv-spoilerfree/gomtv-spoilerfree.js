chrome.extension.onRequest.addListener(
	function(request, sender, sendResponse) {
		//	console.log('got request from',request,sender);
		if (request.action == "get_options") {
			sendResponse(load_options());
		}
	}
)
