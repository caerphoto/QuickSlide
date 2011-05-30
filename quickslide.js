/*globals window */
(function () {
	var normalizeEvent, addListener, setupGalleryLinks, createPopup,
		getLinkNodes;

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
			node.attachEvent("on" + type, wrapHandler);
		} else {
			node.addEventListener(type, wrapHandler);
		}

		return { node: node, type: type, handler: wrapHandler };
	};

	setupGalleryLinks = function () {
		var galleryLinks, i, len;

		galleryLinks = document.querySelectorAll(".quickslide a");

		// Assign a separate click handler for each gallery, so that the
		// handler will loop through only the links in its gallery.
		for (i = 0, len = galleryLinks.length; i < len; i += 1) {
			addListener(galleryLinks[i], "click", function (e) {
				e.preventDefault();
				createPopup(this);
			});
		}
	};

	createPopup = function (fromNode) {
		var links, i, len;

		links = fromNode.parentNode.querySelectorAll("a");

	};

	addListener(window, "load", function () {
		setupGalleryLinks();
	});
}());
