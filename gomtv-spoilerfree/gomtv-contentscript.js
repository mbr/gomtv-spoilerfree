function dictToQueryString(d) {
	var params = new Array();
	for(prop in d) {
		params.push(prop + '=' + d[prop]);
	}
	return params.join('&');
}

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
	console.log('running. options:',options)
	$(".box_vod").showOrSpoiler("Recent video/photo list", options['hide-recent-videos']);
	$("#ch_vod").showOrSpoiler("Video list", options['hide-recent-videos']);
	$("#sugShowArea").showOrSpoiler("Suggested video list", options['hide-recent-videos']);
	$("#SNS_Update").showOrSpoiler("Social networks", options['hide-social-networks']);
	$("#replyFrame").showOrSpoiler("Comments", options['hide-comments']);
	$(".slist_off").showOrSpoiler("Match", options['hide-schedule']);
}

function perform_video_voodoo(options) {
	console.log('Doing VOoDoo')
	// "normal" operation:
	// http://www.gomtv.net/gox/gox.gom?tmp=2&?title=Ro8%20match3%20-%20Old%20Generations%20vs%20Slayers&leagueid=21592&target=vod&vjoinid=55215&strLevel=SQ&ref=&tmpstamp=1301322184248
	//
	// what we really need:
	// leagueid
	// target (= vod)
	// vjoinid
	// strLevel (= HQ)
	// tmpstamp (= Date.now())
	var vod_params = {
		target: 'vod',
		strLevel: 'HQ',
		tmpstamp: Date.now()
	};

	// we can't steal everything from GslPlayer,
	// it'll probably be broken by GOM.
	// also, chrome security policy does not allow this,
	// if i'm not mistaken
	
	// do things the hard way
	$('embed').each(function() {
		var src = $(this).attr('src');
		var parsed = parseUri(src);

		// save important options
		vod_params['leagueid'] = parsed.queryKey['leagueid']
		vod_params['title'] = parsed.queryKey['title']
		//vod_params['vjoinid'] = parsed.queryKey['vjoinid']

		// replace embeds
		var newSrc = parsed.path + '?';
		var params = new Array();
		parsed.queryKey['autoplay'] = 0;
		newSrc += dictToQueryString(parsed.queryKey);

		// replace src - does not work, fix later (FIXME)
		//$(this).attr('src', newSrc);

	});

	var vjoinids = new Array();
	// collect sets vjoinids
	$('[id^="setBtn"]').each(function () {
		var code = $(this).attr('onclick').toString();
		var vjoinid = code.match(/'vjoinid'\s*:\s*(\d+)/)[1];
		var setnum = code.match(/mbSetSet\('(\d+)/)[1];
		vjoinids[parseInt(setnum)] = vjoinid;
	});

	console.log('parsed set vjoinids',vjoinids);
	console.log('final vod_params',vod_params);

	// remove player if desired
	if ('remove' == options['vod-box']) {
		$('#league_flvplayer_container').remove();
	} else if ('links' == options['vod-box']) {
		var loadingMsg = $('<div>Loading links...<br><br>Please wait.</div>');
		var cont = $('#league_flvplayer_container');
		cont.empty();
		cont.append(loadingMsg);

		var links_ul = $('<ul>');
		var links = new Array();

		// load stuff (sets start at 1)
		for(var i = 1; i < vjoinids.length; ++i) {
			var params = $.extend({}, vod_params);
			params['vjoinid'] = vjoinids[i];
			console.log('loading set',i,vjoinids[i]);

			get_video_url(params, function(val) {
				return function(url) {
					links[val] = url;

					links_ul.empty();
					for(var i = 0; i < links.length; ++i) {
						if (links[i]) {
							var a = $('<a>');
							a.attr('href', links[i]);
							a.text('Set ' + i)
							var li = $('<li>');
							links_ul.append($('<li>').append(a));
							
							// FIXME: regenerate links on click
							a.click(function() {
								$(this).replaceWith('link used up');
							});
						}
					}
				}
			}(i));

		}

		loadingMsg.replaceWith(links_ul);
	}

}

function get_video_url(params, on_finish) {
	var goxBase = 'http://www.gomtv.net/gox/gox.gom?';

	var loginProxyBase = 'http://localhost:5000/gomlogin/';

	var goxURL = goxBase + dictToQueryString(params);

	var opts = {};
	$.get(goxURL, function(xml) {
		var toRetrieve = ['UNO', 'NODEID', 'NODEIP', 'USERIP'];
		for(var i = 0; i < toRetrieve.length; ++i) {
			opts[toRetrieve[i].toLowerCase()] = $(xml).find(toRetrieve[i]).text();
		}
		opts['ref'] = $(xml).find('REF').attr('href');

		console.log('retrieved options',opts,'from',goxURL);

		var ref_uri = parseUri(opts['ref']);

		console.log('video server is',ref_uri.host);

		// now we need the key
		var loginProxyURL = loginProxyBase + ref_uri.host + '/?' + dictToQueryString({
				uno: opts['uno'],
				nodeid: opts['nodeid'],
				userip: opts['userip']
			});
		console.log('trying to get login from',loginProxyURL);

		$.get(loginProxyURL, function(answer) {
			var parts = answer.split(',');
			console.log('got key',parts[5]);

			var finalURL = opts['ref'] + '&key=' + parts[5];
			console.log('final URL',finalURL);
			on_finish(finalURL);
		});
	});
}

$(document).ready(function() {
	chrome.extension.sendRequest({action: 'get_options'}, function(response) {
		options = response;
		apply_to_page(response);
		perform_video_voodoo(response);
	})

});
