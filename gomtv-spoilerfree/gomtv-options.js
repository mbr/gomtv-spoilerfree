available_options = [
	{name: "hide-recent-videos",
	 desc: "Hide recent videos, most viewed videos on main and league pages",
	 opttype: "boolean",
	 def: true},
	{name: "hide-social-networks",
	 desc: "Hide Facebook, Twitter, other social message.",
	 opttype: "boolean",
	 def: true},
	{name: "hide-comments",
	 desc: "Hide user comments on match pages.",
	 opttype: "boolean",
	 def: true},
	{name: "hide-schedule",
	 desc: "Hide schedule entries.",
	 opttype: "boolean",
	 def: true},
	{name: "vod-box",
	 desc: "Remove VOD box (this has been tested for premium accounts only)",
	 opttype: "choice",
	 def: 'on',
	 choices: ['on', 'Do nothing', 'remove', 'Remove VOD box', 'links', 'Replace with external media player links']
	}
]//	"hide-flash-video-player": true,


function load_options() {
	var options = {};

	for(var i = 0; i < available_options.length; ++i) {
		var opt = available_options[i];
		// first, try default
		options[opt.name] = opt.def;
	}

	$.extend(true, options, JSON.parse(localStorage.getItem('options')));

	console.log('loaded options',options);
	return options;
}

function save_options(options) {
	console.log('storing options',options);

	localStorage.setItem('options',JSON.stringify(options));

}

_createOptionWidget = function(option, value, on_change) {
	var widgets = {
		boolean: function() {
			var chkbox = $('<input type="checkbox">');
			chkbox.attr('checked', value);
			chkbox.change(function() {
				on_change(option.name, chkbox.attr('checked'));
			});
			return chkbox;
		},

		choice: function() {
			var select = $('<select>');
			for(var i = 0; i < option.choices.length; i += 2) {
				var select_option = $('<option>');
				select_option.attr('value', option.choices[i]);
				select_option.text(option.choices[i+1]);
				if (option.choices[i] == value) select_option.attr('selected', true);
				select.append(select_option);
			}
			select.change(function() {
				on_change(option.name, select.val());
			});
			return select;
		}
	};
	if (! widgets.hasOwnProperty(option.opttype))
		return $('<strong>unknown option type ' + option.opttype + '</strong>');
	
	return widgets[option.opttype]();
}

$.fn.showOptionUI = function(options, current, on_change) {
	// remove everything
	return $(this).each(function() {
		$(this).empty();	

		var tbl = $('<table class="optionTable">');
		tbl.append('<tr><th>Option</th><th>Value</th></tr>');

		for(var i = 0; i < options.length; ++i) {
			var opt = options[i];

			var tr = $('<tr>');
			tr.append($('<th>' + opt.name + '</th>'));
			var option_widget_td = $('<td>');
			option_widget_td.append(_createOptionWidget(opt, current[opt.name], function(name, value) {
				current[name] = value;
				on_change(current);
			}));
			tr.append(option_widget_td);
			tbl.append(tr);

			var tr = $('<tr>');
			tr.append($('<td>'));
			var desc_td = $('<td>');
			desc_td.text(opt.desc);
			tr.append(desc_td);
			tbl.append(tr);
		}

		$(this).append(tbl);

		return $(this);
	});
}
