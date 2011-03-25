$.fn.showOrSpoiler = function(msg, hide) {
	return $(this).each(function() {
		if (! hide) {
			// do nothing, element will appear
			console.log('showing',msg,$(this));
		} else {
			// insert spoilerific placeholder!
			console.log('spoiler-protecting',msg,$(this));
			// create new element to replace this one with
			var placeholder = $('<div class="gomtv-spoilerfree-placeholder">' + msg + ' hidden to avoid spoilers. Click to reveal.</div>');
			placeholder.data('replacedElement', $(this));
			$(this).replaceWith(placeholder);

			placeholder.replacedElement = $(this);
			$(placeholder).click(function() {
				console.log('replacing with',$(this).data('replacedElement'));
				$(this).replaceWith($(this).data('replacedElement'));
			})
		}

		// make visible
		return $(this).css('visibility', 'visible');
	});
}

function apply_to_page(options) {
	console.log('running...')
	$(".box_vod").showOrSpoiler("Recent video/photo list", options['hide-recent-videos']);
	$("#ch_vod").showOrSpoiler("Video list", options['hide-recent-videos']);
	$("#sugShowArea").showOrSpoiler("Suggested video list", options['hide-recent-videos']);
	$("#SNS_Update").showOrSpoiler("Social networks", options['hide-social-networks']);
	$("#replyFrame").showOrSpoiler("Comments", options['hide-comments']);
	$(".slist_off").showOrSpoiler("Match", options['hide-schedule']);
}

$(document).ready(function() {
	chrome.extension.sendRequest({action: 'get_options'}, function(response) {
		options = response;
		apply_to_page(response);
	})
});
