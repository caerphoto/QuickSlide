/*globals localStorage, window */

/* Intermediate file that translates Chrome localStorage options into the
 * QuickSlideConfig object used by QuickSlide. Also contains code to handle
 * Chrome extension options page saving/loading of config. */

var QuickSlideConfig,
	setConfigObject, loadOptions, saveOptions,
	statusBox,
	txtMaxWidth, txtMaxHeight,
	chkUseDimmer, chkAbsolutePosition, chkShowCaption, chkAutoFit,
	btnSave;

setConfigObject = function () {
	QuickSlideConfig = {
		max_width: localStorage.max_width,
		max_height: localStorage.max_height,
		// localStorage apparently doesn't store booleans, just strings
		use_dimmer: localStorage.use_dimmer === "true",
		absolute_position: localStorage.absolute_position === "true",
		show_caption: localStorage.show_caption === "true",
		auto_fit: localStorage.auto_fit === "true",
		auto_detect: true // otherwise it won't work on any page
	};
};

setConfigObject();

if (document.body.className === "quickslide-options-page") {
	statusBox = document.getElementById("status_box");
	txtMaxWidth = document.getElementById("max_width");
	txtMaxHeight = document.getElementById("max_height");
	chkUseDimmer = document.getElementById("use_dimmer");
	chkAbsolutePosition = document.getElementById("absolute_position");
	chkShowCaption = document.getElementById("show_caption");
	chkAutoFit = document.getElementById("auto_fit");
	btnSave = document.getElementById("save");


	loadOptions = function () {
		var c = QuickSlideConfig;
		txtMaxWidth.value = c.max_width || "0";
		txtMaxHeight.value = c.max_height || "0";
		chkUseDimmer.checked = c.use_dimmer;
		chkAbsolutePosition.checked = c.absolute_position;
		chkShowCaption.checked = c.show_caption;
		chkAutoFit.checked = c.auto_fit;
	};

	saveOptions = function () {
		// Store options then read them back to ensure current state matches
		// saved state.
		localStorage.max_width = txtMaxWidth.value;
		localStorage.max_height = txtMaxHeight.value;
		localStorage.use_dimmer = chkUseDimmer.checked;
		localStorage.absolute_position = chkAbsolutePosition.checked;
		localStorage.show_caption = chkShowCaption.checked;
		localStorage.auto_fit = chkAutoFit.checked;

		setConfigObject();
	};

	window.addEventListener("load", loadOptions);
	btnSave.addEventListener("click", function () {
		saveOptions();

		statusBox.className = "show";
		window.setTimeout(function () {
			statusBox.className = "";
		}, 1000);
	});
}
