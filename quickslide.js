(function (root, factory) {
    // Asynchronous module definition, as per
    // https://github.com/umdjs/umd/blob/master/amdWeb.js

    if (typeof define === "function" && define.amd) {
        define(factory);
    } else {
        root.QuickSlide = factory();
    }
}(this, function () {
    "use strict";

    var popupImg;
    var popupBox;
    var dimmer;
    var popupCaption;

    // Interval timer used when polling an Image object for size info.
    var sizeTimer;

    var config = {
        //max_width: 800,
        //max_height: 600,
        use_dimmer: false,
        absolute_position: false,
        show_caption: true,
        auto_fit: true,
        auto_detect: false,
        no_wait: false,
        navigation: true
    };

    var imageLinks = [];
    var currentLink = null;


    // Bail out immediately if there's already a QuickSlide box on the page.
    if (document.getElementById("quickslide-popup-box") ||
        document.getElementById("lightbox")) {
        return;
    }

    function nonWhitespace(text) {
        return !(/^\s+$/).test(text);
    }

    function addClassTo(element, className) {
        var elementClasses = element.className.split(" ").filter(nonWhitespace);
        var newClasses = className.split(" ").filter(nonWhitespace);

        newClasses.forEach(function (c) {
            if (elementClasses.indexOf(c) === -1) {
                elementClasses.push(c);
            }
        });

        element.className = elementClasses.join(" ");
    }

    function removeClassFrom(element, className) {
        var elementClasses = element.className.split(" ").filter(nonWhitespace);
        var classesToRemove = className.split(" ").filter(nonWhitespace);
        var index = elementClasses.length - 1;

        while (index >= 0) {
            if (classesToRemove.indexOf(elementClasses[index]) !== -1) {
                elementClasses.splice(index, 1);
            }

            index -= 1;
        }

        element.className = elementClasses.join(" ");
    }

    function isImageLink(link) {
        // Checks whether the given link's "href" attribute ends in an
        // image-related extension, and the link doesn't contain '=http',
        // which usually indicates a redirect to another domain, not an
        // actual image URL.
        // Also returns false if the link already has a click handler,
        // albeit only the old-style assignation, since browser support for
        // element.eventListenerList is limited as of April 2012.
        var href = link.getAttribute("href");
        var imgExt = /\.(jp(e?)g|png|gif|svg)$/i;
        var redirect = /=http/;

        return imgExt.test(href) && !redirect.test(href) && !link.onclick;
    }

    function shouldHandle(testEl) {
        // Returns true if the given element is a valid link to an image.
        var nodeName = testEl.nodeName.toUpperCase();
        var rel = (testEl.getAttribute("rel") || "").toUpperCase();

        return nodeName === "A" && (
            rel === "QUICKSLIDE" || (
                config.auto_detect && isImageLink(testEl)
            )
        );
    }

    function collectLinks() {
        var allLinks = document.querySelectorAll("a");
        return Array.prototype.filter.call(allLinks, function (link) {
            return shouldHandle(link);
        });
    }

    function setEventHandlers() {
        /* Attach a click handler to the document body that listens for clicks,
        *  then if the clicked element is not one we're interested in, traverse
        *  up the DOM tree until we reach either an element we're interested
        *  in, or the document body.
        *
        *  This replaces the need to set click handlers on each individual link
        *  element, so it still works even on elements that are added
        *  dynamically after page load.
        */

        // Function similar to jQuery's .live() or .delegate().
        document.body.addEventListener("click", function (e) {
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
            while (el && !shouldHandle(el) && el !== this) {
                el = el.parentNode;
            }

            if (el && shouldHandle(el)) {
                e.preventDefault();
                setPopupFromNode(el);
            }
        }, false);
    }

    function recenterBox(box, srcImg) {
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
    }

    function setPopupFromNode(node) {
        if (config.use_dimmer) {
            dimmer.style.display = "";
            //document.body.appendChild(dimmer);
        }

        //document.body.appendChild(popupBox);
        addClassTo(popupBox, "loading");
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
        popupImg.className = "quickslide-image";
        popupImg.style.display = "none";

        popupImg.addEventListener("error", function () {
            if (!popupImg.width && !popupImg.height) {
                //alert("There was a problem loading the image.\n\nThe server might have taken too long to respond, or the image might have been deleted.");
                hidePopup();
                window.location = popupImg.src;
            }
        }, false);

        if (config.show_caption) {
            popupCaption.style.display = "none";
            popupCaption.innerHTML = node.getAttribute("title");
        }

        popupImg.addEventListener("load", function () {
            removeClassFrom(popupBox, "loading");
            addClassTo(popupBox, "loaded");
        }, false);

        // Start loading image.
        popupImg.src = node.getAttribute("href");

        sizeTimer = setInterval(function () {
            if (popupImg.width || popupImg.height) {
                clearInterval(sizeTimer);
                showImage();
            }
        }, 100);

        currentLink = node;
    }

    function showImage() {
        // Handler for when the full-sized image is ready to be shown in the
        // popup.
        removeClassFrom(popupBox, "loading loaded");
        popupImg.style.display = "";

        if (config.show_caption) {
            popupBox.insertBefore(popupImg, popupCaption);
            popupCaption.style.display = "";
        } else {
            popupBox.appendChild(popupImg);
        }

        recenterBox(popupBox, popupImg);
    }

    function hidePopup() {
        clearInterval(sizeTimer);

        if (popupBox.parentNode === document.body) {
            popupBox.style.display = "none";
            if (config.use_dimmer) {
                dimmer.style.display = "none";
            }
        }
    }

    function changePopupSourceBy(delta) {
        var index = imageLinks.indexOf(currentLink);
        if (index === -1) {
            return;
        }

        index += delta;

        if (index === -1) {
            index = imageLinks.length - 1;
        } else if (index >= imageLinks.length - 1) {
            index = 0;
        }

        setPopupFromNode(imageLinks[index]);
    }

    function applyConfig(newConfig) {
        var key;

        if (!newConfig || typeof newConfig !== "object") {
            return;
        }

        for (key in config) {
            if (!config.hasOwnProperty(key)){
                continue;
            }

            if (newConfig.hasOwnProperty(key)) {
                config[key] = newConfig[key];
            }
        }
    }

    /* Initialisation stuff *
     * -------------------- */

    function init() {
        var s;
        var navPrev, navNext;

        popupBox = document.createElement("div");
        popupBox.className = "quickslide-popup-box";

        s = popupBox.style;
        s.position = config.absolute_position ? "absolute" : "fixed";
        s.zIndex = "9999";
        s.display = "none";

        popupBox.addEventListener("click", function (evt) {
            var delta = parseInt(evt.target.getAttribute("data-delta"), 10);
            if (evt.target.nodeName.toUpperCase() === "A" && delta) {
                changePopupSourceBy(delta);
                evt.stopPropagation();
                evt.preventDefault();
                return false;
            }

            hidePopup();
        }, false);

        document.body.appendChild(popupBox);

        if (config.use_dimmer) {
            dimmer = document.createElement("div");
            dimmer.className = "quickslide-dimmer";

            s = dimmer.style;
            s.position = "fixed";
            s.zIndex = "9998"; // Note: one less than popupBox's zIndex
            s.top = "0";
            s.right = "0";
            s.bottom = "0";
            s.left = "0";
            s.display = "none";

            dimmer.addEventListener("click", function () {
                hidePopup();
            }, false);

            document.body.appendChild(dimmer);
        }

        if (config.navigation) {
            navPrev = document.createElement("a");
            navNext = document.createElement("a");
            navPrev.href = navNext.href = "#";
            navPrev.setAttribute("data-delta", -1);
            navNext.setAttribute("data-delta", 1);
            navPrev.className = "quickslide-nav quickslide-nav-prev";
            navNext.className = "quickslide-nav quickslide-nav-next";
            navPrev.appendChild(document.createTextNode("Previous"));
            navNext.appendChild(document.createTextNode("Next"));

            popupBox.appendChild(navPrev);
            popupBox.appendChild(navNext);
        }

        document.body.addEventListener("keydown", function (e) {
            // Hide popup is [esc] is pressed.
            if (e.keyCode === 27) {
                hidePopup();
            }

            if (e.keyCode === 37) { // left arrow
                changePopupSourceBy(-1);
            }

            if (e.keyCode === 39) { // right arrow
                changePopupSourceBy(1);
            }
        }, false);


        if (config.show_caption) {
            popupCaption = document.createElement("div");
            popupCaption.className = "quickslide-caption";
            popupBox.appendChild(popupCaption);
        }

        setEventHandlers();
        imageLinks = collectLinks();
    }

    return function (userConfig) {
        applyConfig(userConfig);

        if (config.no_wait && document.body) {
            init();
        } else {
            window.addEventListener("load", function () {
                init();
            }, false);
        }
    };

}));
