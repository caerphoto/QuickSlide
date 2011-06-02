/*globals window */
// Global config object, which can be defined in a <script> tag in the HTML.
// Contains settings for max image dimensions, auto-scaling, etc.
var QuickSlideConfig;

(function (config) {
	var popupVisible = false,
		loadingSpinner = document.createElement("img"),
		popupImg,
		popupBox = document.createElement("div"),
		dimmer, ds,
		// Not used yet:
		popupNext, popupPrev,

		// Functions:
		normalizeEvent, addListener, triggerEvent,
		setupGalleryLinks, setPopup, recenterBox, imageLoaded, hidePopup;

	normalizeEvent = function (e) {
		// Make the event object standard within event handlers.
		if (!e.stopPropagation) {
			e.stopPropagation = function () {
				this.cancelBubble = true;
			};

			e.preventDefault = function () {
				this.returnValue = false;
			};
		}

		if (e.srcElement && !e.target) {
			e.target = e.srcElement;
		}

		return e;
	};

	addListener = function (node, type, handler) {
		// Cross-browser event handler binding.
		var wrapHandler = function (e) {
			// Make 'this' inside the handler refer to the 'node' parameter.
			handler.apply(node, [normalizeEvent(e || window.event)]);
		};

		if (node.attachEvent) {
			// Attach handler for IE.
			node.attachEvent("on" + type, wrapHandler);
		} else {
			// Attach handler for standards-compliant browsers.
			node.addEventListener(type, wrapHandler, false);
		}

		return { node: node, type: type, handler: wrapHandler };
	};

	triggerEvent = function (node, type) {
		// Cross-browser event triggering.
		var evt;

		if (document.createEventObject) {
			// Dispatch for IE.
			evt = document.createEventObject();
			return node.fireEvent("on" + type, evt);
		} else {
			// Dispatch for standards-compliant browsers.
			evt = document.createEvent("HTMLEvents");
			evt.initEvent(type, true, true); // event type, bubbling, cancelable
			return !node.dispatchEvent(evt);
		}
	};

	setupGalleryLinks = function () {
		// Assign click event handlers to each link with the appropriate rel
		// attribute.
		var galleryLinks, i, len;

		galleryLinks = document.querySelectorAll("a[rel=quickslide]");

		for (i = 0, len = galleryLinks.length; i < len; i += 1) {
			addListener(galleryLinks[i], "click", function (e) {
				e.preventDefault();
				setPopup(this);
			});
		}
	};

	recenterBox = function (box, srcImg, log) {
		// Puts the popup box in the centre of the window, based on the size of
		// the given image. If the image is larger than the window it is scaled
		// down to fit, if that option is specified in config.
		var bs = box.style, cw, ch, scrollTop = document.body.scrollTop ||
				(document.documentElement && document.documentElement.scrollTop),
			px, py, w, h, s, mw = config.max_width, mh = config.max_height;

		// Get size of browser window.
		cw = window.innerWidth || document.documentElement.clientWidth;
		ch = window.innerHeight || document.documentElement.clientHeight;

		w = srcImg.width;
		h = srcImg.height;

		// Similar to calculations for fitting to window, but these don't need
		// to take box padding/borders into account.
		if (mw && w > mw) {
			h = Math.round(h * mw / w);
			w = mw;
			// Need to specify max in both dimensions otherwise IE8 doesn't
			// scale the image proportionally.
			srcImg.style.maxWidth = mw + "px";
			srcImg.style.maxHeight = h + "px";
		}

		if (mh && h > mh) {
			w = Math.round(w * mh / h);
			h = mh;
			srcImg.style.maxHeight = mh + "px";
			srcImg.style.maxWidth = w + "px";
		}

		// Calculate how much space the box's padding and borders take up.
		px = box.offsetWidth - w;
		py = box.offsetHeight - h;

		// Scale image to fit in window, taking its container box's borders and
		// padding into account.
		if (config.auto_fit) {
			if (w + px > cw) {
				h = Math.round(h * (cw - px) / w);
				w = cw - px;
				srcImg.style.maxWidth = w + "px";
				srcImg.style.maxHeight = h + "px";
			}

			if (h + py > ch) {
				w = Math.round(w * (ch - py) / h);
				h = ch - py;
				srcImg.style.maxHeight = h + "px";
				srcImg.style.maxWidth = w + "px";
			}
		}

		if (log) {
			console.log("Image height:   ", h);
			console.log("Scroll position:", scrollTop);
			console.log("Window height:  ", ch);
		}

		if (config.absolute_position) {
			bs.top = (Math.round((ch - h) / 2) + scrollTop - (py / 2)) + "px";
		} else {
			bs.top = (Math.round((ch - h) / 2) - (py / 2)) + "px";
		}
		bs.left = (Math.round((cw - w) / 2) - px / 2) + "px";
	};

	setPopup = function (fromNode) {
		// Prepare the image popup by first showing the loading spinner, then
		// setting up an onload event handler, then loading the appropriate
		// image.
		try {
			popupBox.replaceChild(loadingSpinner, popupImg);
		} catch (err) {}

		document.body.appendChild(popupBox);
		recenterBox(popupBox, loadingSpinner);

		// Need to create a new image because if we just change the .src
		// property, IE9 doesn't update the width and height once the new image
		// loads, so all images display at the same size as the first one to be
		// opened.
		popupImg = new Image();
		addListener(popupImg, "load", imageLoaded);

		// Need to set .src after attaching event listener, otherwise IE8 fails
		// to trigger the "load" event when loading from the cache, since the
		// image gets loaded before the assigning of the event handler.
		popupImg.src = fromNode.href;
	};

	imageLoaded = function () {
		// Handler for when the full-sized image finishes loading.
		popupBox.replaceChild(popupImg, loadingSpinner);

		if (config.use_dimmer) {
			document.body.appendChild(dimmer);
		}

		recenterBox(popupBox, popupImg);
		popupVisible = true;
	};

	hidePopup = function () {
		// Close popup and put the spinner back in place ready for next popup.
		popupImg.src = "";

		// Image may not have finished loading when hidePopup() is called.
		try {
			popupBox.replaceChild(loadingSpinner, popupImg);
		} catch (err) {}

		document.body.removeChild(popupBox);
		if (config.use_dimmer && popupVisible) {
			document.body.removeChild(dimmer);
		}

		popupVisible = false;
	};

	/* Initialisation stuff *
	 * -------------------- */

	config = config || {};

	// Preload 'loading' spinner image.
	loadingSpinner.src = config.loading_spinner_url ||
		"loading-spinner.gif";

	popupBox.className = "quickslide-popup-box";
	popupBox.appendChild(loadingSpinner);

	if (config.use_dimmer) {
		dimmer = document.createElement("div");
		ds = dimmer.style;
		ds.position = "fixed";
		ds.zIndex = "9998";
		ds.top = "0";
		ds.right = "0";
		ds.bottom = "0";
		ds.left = "0";
		dimmer.id = "quickslide-dimmer";

		addListener(dimmer, "click", function (e) {
			hidePopup();
		});
	}

	popupBox.style.position = config.absolute_position ? "absolute" : "fixed";
	popupBox.style.zIndex = "9999";

	addListener(popupBox, "click", function (e) {
		hidePopup();
	});

	addListener(window, "load", function () {
		setupGalleryLinks();
	});
}(QuickSlideConfig));
