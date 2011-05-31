/*globals window */
// Global config object, which can be defined in a <script> tag in the HTML.
// Contains settings for max image dimensions, auto-scaling, etc.
var QuickSlideConfig;

(function (config) {
	var popupVisible = false,
		loadingSpinner = document.createElement("img"),
		popupImg,
		popupBox = document.createElement("div"),
		popupNext, popupPrev,

		// Functions:
		normalizeEvent, addListener, triggerEvent,
		setupGalleryLinks, setPopup, getLinkNodes, recenterBox, popupLoaded;

	// Couple of convenience functions for dealing with events.
	normalizeEvent = function (e) {
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
		var galleryLinks, i, len;

		galleryLinks = document.querySelectorAll("a[rel=quickslide]");

		// Assign a separate click handler for each gallery, so that the
		// handler will loop through only the links in its gallery.
		for (i = 0, len = galleryLinks.length; i < len; i += 1) {
			addListener(galleryLinks[i], "click", function (e) {
				e.preventDefault();
				if (popupVisible) {
					triggerEvent(popupBox, "click");
				}
				setPopup(this);
			});
		}
	};

	setPopup = function (fromNode) {
		document.body.appendChild(popupBox);
		popupBox.appendChild(loadingSpinner);
		recenterBox(popupBox, loadingSpinner);

		// Need to create a new image because if we just change the .src
		// property, IE9 doesn't update the width and height once the new image
		// loads, so all images display at the same size as the first one to be
		// opened.
		popupImg = new Image();
		addListener(popupImg, "load", popupLoaded);

		// Need to set .src after attaching event listener, otherwise IE8 fails
		// to trigger the "load" event when loading from the cache, since the
		// image gets loaded before the assigning of the event handler.
		popupImg.src = fromNode.href;
		popupVisible = true;
	};

	recenterBox = function (box, srcImg, log) {
		// Puts the popup box in the centre of the window, based on the size of
		// the given image. If the image is larger than the window it is scaled
		// down to fit.
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
			srcImg.style.maxWidth = mw + "px";
		}

		if (mh && h > mh) {
			w = Math.round(w * mh / h);
			h = mh;
			srcImg.style.maxHeight = mh + "px";
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
			}

			if (h + py > ch) {
				w = Math.round(w * (ch - py) / h);
				h = ch - py;
				srcImg.style.maxHeight = (ch - py) + "px";
			}
		}

		if (log) {
			console.log("Image height:", h);
			console.log("Scroll pos:", scrollTop);
			console.log("Window height:", ch);
		}

		if (config.fixed_position) {
			bs.top = (Math.round((ch - h) / 2) - (py / 2)) + "px";
		} else {
			bs.top = (Math.round((ch - h) / 2) + scrollTop - (py / 2)) + "px";
		}
		bs.left = (Math.round((cw - w) / 2) - px / 2) + "px";
	};

	config = config || {};

	// Preload 'loading' spinner image.
	loadingSpinner.src = config.loading_spinner_url ||
		"loading-spinner.gif";

	popupBox.appendChild(loadingSpinner);
	popupBox.className = "quickslide-popup-box";
	popupBox.style.position = config.absolute_position ? "absolute" : "fixed";

	addListener(popupBox, "click", function (e) {
		// Close popup and put the spinner back in place ready for next popup.

		// A DOM exception is raised if popupImg is not a child of popupBox. We
		// will just ignore it.
		try {
			popupBox.removeChild(popupImg);
		} catch (err) {}

		popupImg.src = "";

		popupBox.appendChild(loadingSpinner);
		document.body.removeChild(popupBox);
		popupVisible = false;
	});

	popupLoaded = function () {
		// Handler for when the full-sized image finishes loading.

		popupBox.removeChild(loadingSpinner);
		popupBox.appendChild(popupImg);

		recenterBox(popupBox, popupImg);
	};

	addListener(window, "load", function () {
		setupGalleryLinks();
	});
}(QuickSlideConfig));
