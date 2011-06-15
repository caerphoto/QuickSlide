/*globals window */
// Global config object, which can be defined in a <script> tag in the HTML.
// Contains settings for max image dimensions, auto-scaling, etc.
var QuickSlideConfig;

(function (config) {
	var loadingSpinner = document.createElement("img"),
		popupImg,
		popupBox = document.createElement("div"),
		dimmer,
		sizeTimer,
		// Not used yet:
		popupNext, popupPrev, popupCaption,

		// These three are event normalisation functions based on examples in
		// 'Eloquent JavaScript', by Marijn Haverbeke:
		// http://eloquentjavascript.net/chapter13.html
		normalizeEvent, addListener, triggerEvent,

		// Other functions:
		setupGalleryLinks, setPopup, recenterBox, showImage, hidePopup;

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

	recenterBox = function (box, srcImg) {
		// Puts the popup box in the centre of the window, based on the size of
		// the given image. If the image is larger than the window it is scaled
		// down to fit, if that option is specified in config.
		// If no image is given, position is based on the size of the empty box
		// (including padding and border).
		var bs = box.style, cw, ch, scrollTop = document.body.scrollTop ||
				(document.documentElement && document.documentElement.scrollTop),
			px = 0, py = 0, w, h, cr,
			mw = config.max_width, mh = config.max_height;

		// Get size of browser window.
		cw = window.innerWidth || document.documentElement.clientWidth;
		ch = window.innerHeight || document.documentElement.clientHeight;

		if (srcImg) {
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

			// Prevent caption being wider than image, as it looks wrong. May still
			// look odd if auto_fit is enabled and the caption is really long
			// (wider than the whole browser window).
			if (config.show_caption) {
				popupCaption.style.maxWidth = w + "px";
			}

			// Calculate how much space the box's padding, borders and caption take
			// up.
			px = box.offsetWidth - w;
			py = box.offsetHeight - h;

			// Scale image to fit in window, taking its container box's borders and
			// padding into account.
			if (config.auto_fit !== false) {
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
		} else { // no image given
			cr = box.getBoundingClientRect();
			w = cr.right - cr.left;
			h = cr.bottom - cr.top;
		}

		bs.top = (Math.round((ch - h) / 2) +
			(config.absolute_position ?  scrollTop : 0) -
			(py / 2)) + "px";
		bs.left = (Math.round((cw - w) / 2) - px / 2) + "px";
	};

	setPopup = function (fromNode) {
		if (config.use_dimmer) {
			document.body.appendChild(dimmer);
		}

		document.body.appendChild(popupBox);
		popupBox.className = "loading";
		recenterBox(popupBox);

		// Throws an exception if popupImg is not a child of popupBox. This is
		// much easier (and possibly quicker) than trying to determine if it's
		// a child or not.
		try {
			popupBox.removeChild(popupImg);
		} catch (err) {}

		// Need to create a new image because if we just change the .src
		// property, IE9 doesn't update the width and height once the new image
		// loads, so all images display at the same size as the first one to be
		// opened.
		popupImg = new Image();
		popupImg.id = "quickslide-image";
		popupImg.style.display = "none";

		addListener(popupImg, "error", function (e) {
			if (!popupImg.width && !popupImg.height) {
				alert("There was a problem loading the image.\n\nThe server might have taken too long to respond, or the image might have been deleted.");
				hidePopup();
			}
		});

		if (config.show_caption) {
			popupCaption.style.display = "none";
			popupCaption.innerHTML = fromNode.getAttribute("title");
		}

		popupImg.src = fromNode.getAttribute("href");

		sizeTimer = setInterval(function () {
			if (popupImg.width || popupImg.height) {
				clearInterval(sizeTimer);
				showImage();
			}
		}, 100);
	};

	showImage = function () {
		// Handler for when the full-sized image is ready to be shown in the
		// popup.
		popupBox.className = "";
		popupImg.style.display = "";

		if (config.show_caption) {
			popupBox.insertBefore(popupImg, popupCaption);
			popupCaption.style.display = "";
		} else {
			popupBox.appendChild(popupImg);
		}

		recenterBox(popupBox, popupImg);
	};

	hidePopup = function () {
		clearInterval(sizeTimer);

		document.body.removeChild(popupBox);
		if (config.use_dimmer) {
			document.body.removeChild(dimmer);
		}
	};

	/* Initialisation stuff *
	 * -------------------- */

	config = config || {};

	popupBox.id = "quickslide-popup-box";
	popupBox.style.position = config.absolute_position ? "absolute" : "fixed";
	popupBox.style.zIndex = "9999";

	addListener(popupBox, "click", function (e) {
		hidePopup();
	});

	if (config.use_dimmer) {
		(function () {
			var ds;
			dimmer = document.createElement("div");
			ds = dimmer.style;
			ds.position = "fixed";
			ds.zIndex = "9998"; // Note: one less than popupBox's zIndex
			ds.top = "0";
			ds.right = "0";
			ds.bottom = "0";
			ds.left = "0";
			dimmer.id = "quickslide-dimmer";

			addListener(dimmer, "click", function (e) {
				hidePopup();
			});
		}());
	}

	if (config.show_caption) {
		popupCaption = document.createElement("div");
		popupCaption.id = "quickslide-caption";
		popupBox.appendChild(popupCaption);
	}

	addListener(window, "load", function () {
		setupGalleryLinks();
	});
}(QuickSlideConfig));
