function apply_to_page(options) {
	console.log('running...')
	if (! options['hide-recent-videos']) {
		$(".box_vod").each(function(n) {
			$(this).css('visibility', 'visible'); });
		$("#ch_vod").css('visibility', 'visible');
		$("#sugShowArea").css('visibility', 'visible');
	}
	if (! options['hide-social-networks']) {
		$("#SNS_Update").css('visibility', 'visible');
	}
	if (! options['hide-comments']) {
		$("#replyFrame").css('visibility', 'visible');
	}
}

$(document).ready(function() {
	chrome.extension.sendRequest({action: 'get_options'}, function(response) {
		options = response;
		apply_to_page(response);
	})
});
