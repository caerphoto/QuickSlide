/*globals window */
(function () {
	var QuickSlideConfig,
		popupVisible = false,
		loadingSpinner = new Image(),
		popupImg = new Image(),
		popupBox = document.createElement("div"),
		popupNext, popupPrev,

		// Functions:
		normalizeEvent, addListener, triggerEvent,
		setupGalleryLinks, setPopup, getLinkNodes;

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

		if (typeof node.attachEvent === "function") {
			// Attach handler for IE.
			node.attachEvent("on" + type, wrapHandler);
		} else {
			// Attach handler for standards-compliant browsers.
			node.addEventListener(type, wrapHandler);
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

		galleryLinks = document.querySelectorAll(".quickslide a");

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
		var links, i, len;

		links = fromNode.parentNode.querySelectorAll("a");
		popupImg.src = fromNode.href;

		popupBox.style.width = loadingSpinner.width + "px";
		popupBox.style.height = loadingSpinner.height + "px";

		document.body.appendChild(popupBox);
		popupVisible = true;
	};

	QuickSlideConfig = QuickSlideConfig || {};

	// Preload 'loading' spinner image.
	loadingSpinner.src = QuickSlideConfig.loading_spinner_url ||
		"images/loading-spinner.gif";

	popupBox.appendChild(loadingSpinner);
	popupBox.className = "quickslide-popup-box";

	addListener(popupBox, "click", function (e) {
		// Close popup and put the spinner back in place ready for next popup.
		popupBox.removeChild(popupImg);
		popupBox.appendChild(loadingSpinner);
		document.body.removeChild(popupBox);
		popupVisible = false;
	});

	addListener(popupImg, "load", function (e) {
		// Handler for when the full-sized image finishes loading.
		var s = popupBox.style, cw, ch;

		// Remove spinner and show actual image, then recenter the popup.
		popupBox.removeChild(loadingSpinner);
		popupBox.appendChild(popupImg);

		// Get size of browser window.
		if (document.documentElement && document.documentElement.offsetWidth) {
			cw = document.documentElement.offsetWidth;
			ch = document.documentElement.offsetHeight;
		} else {
			cw = window.innerWidth;
			ch = window.innerHeight;
		}

		// If the position style of the box is 'fixed', this won't be
		// necessary.
		ch -= document.body.scrollTop;

		s.width = popupImg.width + "px";
		s.height = popupImg.height + "px";
		s.top = (Math.round((ch - popupImg.height - 40) / 2) +
			document.body.scrollTop) + "px";
		s.left = Math.round((cw - popupImg.width) / 2) + "px";
	});

	addListener(window, "load", function () {
		setupGalleryLinks();
	});
}());
