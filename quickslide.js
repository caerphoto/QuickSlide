/*globals window, chrome */
// Global config object, which can be defined in a <script> tag in the HTML.
// Contains settings for max image dimensions, auto-scaling, etc.
var QuickSlideConfig;

(function (config) {
    "use strict";
    var popupImg,
        popupBox,
        dimmer, popupCaption,

        // Interval timer used when polling an Image object for size info.
        sizeTimer,

        // These three are event normalisation functions based on examples in
        // 'Eloquent JavaScript', by Marijn Haverbeke:
        // http://eloquentjavascript.net/chapter13.html
        normalizeEvent, addListener, triggerEvent,

        // Other functions:
        init, setupGalleryLinks, setPopup, recenterBox, showImage, hidePopup;


    // Bail out immediately if there's already a QuickSlide box on the page.
    if (document.getElementById("quickslide-popup-box") ||
        document.getElementById("lightbox")) {
        return;
    }

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
        /* Attach a click handler to the document body that listens for clicks,
        *  then if the clicked element is not one we're interested in, traverse
        *  up the DOM tree until we reach either an element we're interested
        *  in, or the document body.
        *
        *  This replaces the need to set click handlers on each individual link
        *  element, so it still works even on elements that are added
        *  dynamically after page load.
        */
        var isImageLink, isQ;

        isImageLink = function (link) {
            // Checks whether the given link's "href" attribute ends in an
            // image-related extension, and the link doesn't contain '=http',
            // which usually indicates a redirect to another domain, not an
            // actual image URL.
            // Also returns false if the link already has a click handler,
            // albeit only the old-style assignation, since browser support for
            // element.eventListenerList is limited as of April 2012.
            var href = link.getAttribute("href"),
                imgExt = /\.(jp(e?)g|png|gif)$/i,
                redirect = /=http/;
            return imgExt.test(href) && !redirect.test(href) && !link.onclick;
        };

        isQ = function (testEl) {
            // Returns true if the given element is a valid link to an
            // image.
            var nodeName = testEl.nodeName.toUpperCase(),
                rel = (testEl.getAttribute("rel") || "").toUpperCase();

            return nodeName === "A" && (rel === "QUICKSLIDE" ||
                (config.auto_detect && isImageLink(testEl)));
        };

        // Function similar to jQuery's .live() or .delegate().
        addListener(document.body, "click", function (e) {
            var el = e.target;

            // Ignore clicks if shift is held.
            if (e.shiftKey) {
                e.shiftKey = false;
                return false;
            }

            // Ignore middle-clicks.
            if (e.button && e.button === 1) {
                return true;
            }

            // Traverse up the tree.
            while (el && !isQ(el) && el !== this) {
                el = el.parentNode;
            }

            if (el && isQ(el)) {
                e.preventDefault();
                setPopup(el);
            }
        });
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

            // Prevent caption being wider than image, as it looks wrong. May
            // still look odd if auto_fit is enabled and the caption is really
            // long (wider than the whole browser window).
            if (config.show_caption) {
                popupCaption.style.maxWidth = w + "px";
            }

            // Calculate how much space the box's padding, borders and caption
            // take up.
            px = box.offsetWidth - w;
            py = box.offsetHeight - h;

            // Scale image to fit in window, taking its container box's borders
            // and padding into account.
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
            dimmer.style.display = "";
            //document.body.appendChild(dimmer);
        }

        //document.body.appendChild(popupBox);
        popupBox.className = "loading";
        popupBox.style.display = "";
        recenterBox(popupBox);

        if (popupImg && popupImg.parentNode === popupBox) {
            popupBox.removeChild(popupImg);
        }

        // Need to create a new image because if we just change the .src
        // property, IE9 doesn't update the width and height once the new image
        // loads, so all images display at the same size as the first one to be
        // opened.
        popupImg = document.createElement("img");
        popupImg.id = "quickslide-image";
        popupImg.style.display = "none";

        addListener(popupImg, "error", function () {
            if (!popupImg.width && !popupImg.height) {
                //alert("There was a problem loading the image.\n\nThe server might have taken too long to respond, or the image might have been deleted.");
                hidePopup();
                window.location = popupImg.src;
            }
        });

        if (config.show_caption) {
            popupCaption.style.display = "none";
            popupCaption.innerHTML = fromNode.getAttribute("title");
        }

        addListener(popupImg, "load", function () {
            popupBox.className = "loaded";
        });

        // Start loading image.
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

        if (popupBox.parentNode === document.body) {
            popupBox.style.display = "none";
            //document.body.removeChild(popupBox);
            if (config.use_dimmer) {
                dimmer.style.display = "none";
                //document.body.removeChild(dimmer);
            }
        }
    };

    /* Initialisation stuff *
     * -------------------- */

    init = function () {
        var s;

        popupBox = document.createElement("div");
        popupBox.id = "quickslide-popup-box";

        s = popupBox.style;
        s.position = config.absolute_position ? "absolute" : "fixed";
        s.zIndex = "9999";
        s.display = "none";

        if (config.chrome_extension) {
            s = chrome.extension.getURL("loading-spinner.gif");
            popupBox.style.backgroundImage = ["url(", s, ")"].join("'");
        }

        addListener(popupBox, "click", function () {
            hidePopup();
        });

        document.body.appendChild(popupBox);

        if (config.use_dimmer) {
            dimmer = document.createElement("div");
            dimmer.id = "quickslide-dimmer";

            s = dimmer.style;
            s.position = "fixed";
            s.zIndex = "9998"; // Note: one less than popupBox's zIndex
            s.top = "0";
            s.right = "0";
            s.bottom = "0";
            s.left = "0";
            s.display = "none";

            addListener(dimmer, "click", function () {
                hidePopup();
            });

            addListener(document.body, "keydown", function (e) {
                // Hide popup is [esc] is pressed.
                if (e.keyCode === 27) {
                    hidePopup();
                }
            });

            document.body.appendChild(dimmer);
        }

        if (config.show_caption) {
            popupCaption = document.createElement("div");
            popupCaption.id = "quickslide-caption";
            popupBox.appendChild(popupCaption);
        }

        setupGalleryLinks();
    };

    if (config.chrome_extension) {
        // Wait for the background page to reply with config info before
        // initialising, otherwise config will be blank.
        chrome.extension.sendRequest({ func: "getConfig" }, function (response) {
            var c = response.config;

            config.max_width = c.max_width;
            config.max_height = c.max_height;
            config.use_dimmer = c.use_dimmer;
            config.absolute_position = c.absolute_position;
            config.show_caption = c.show_caption;
            config.auto_fit = c.auto_fit;
            config.auto_detect = true;
            config.no_wait = true;

            init();
        });
    } else {
        // If script is loaded from the document <head> with the no_wait
        // option, problems will arise as the init() function will try to
        // append elements to the document body, which doesn't exist yet.
        if (config.no_wait && document.body) {
            init();
        } else {
            addListener(window, "load", function () {
                init();
            });
        }
    }

}(QuickSlideConfig || {}));
