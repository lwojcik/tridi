/*
  Tridi v1.1.2 - JavaScript 360 3D Product Viewer
  Author: Lukasz Wojcik
  License: MIT
  Homepage: https://tridi.lukem.net
  GitHub: http://github.com/lukemnet/tridi
*/
var Tridi = /** @class */ (function () {
    function Tridi(options) {
        var _this = this;
        this.trigger = function (eventName) {
            var ev = _this[eventName];
            if (ev)
                ev();
        };
        this.validate = function (options) {
            if (!options.element) {
                console.error("'element' property is missing or invalid. Container element must be specified.");
            }
            if (typeof options.images === "undefined" &&
                typeof options.format === "undefined") {
                console.error("'format' property is missing or invalid. Image format must be provided for 'numbered' property.");
            }
            if (options.images === "numbered" && !options.location) {
                console.error("'location' property is missing or invalid. Image location must be provided for 'numbered' property.");
            }
        };
        this.validate(options);
        this.element = options.element;
        this.images = options.images || "numbered";
        this.format = options.format || undefined;
        this.location = options.location || "./images";
        this.count = Array.isArray(this.images)
            ? this.images.length
            : options.count;
        this.draggable =
            typeof options.draggable !== "undefined" ? options.draggable : true;
        this.keys = options.keys || false;
        this.hintOnStartup = options.hintOnStartup || false;
        this.hintText = options.hintText || null;
        this.focusOnHintClose = options.focusOnHintClose || false;
        this.lazy = options.lazy || false;
        this.autoplay = options.autoplay || false;
        this.autoplaySpeed =
            typeof options.autoplaySpeed !== "undefined" ? options.autoplaySpeed : 50;
        this.stopAutoplayOnClick = options.stopAutoplayOnClick || false;
        this.stopAutoplayOnMouseenter = options.stopAutoplayOnMouseenter || false;
        this.resumeAutoplayOnMouseleave =
            options.resumeAutoplayOnMouseleave || false;
        this.resumeAutoplayDelay = options.resumeAutoplayDelay || 0;
        this.passive =
            typeof options.passive !== "undefined" ? options.passive : true;
        this.spinner = options.spinner || false;
        this.touch = typeof options.touch !== "undefined" ? options.touch : true;
        this.mousewheel = options.mousewheel || false;
        this.inverse = options.inverse || false;
        this.dragInterval = options.dragInterval || 1;
        this.touchDragInterval = options.touchDragInterval || 2;
        this.mouseleaveDetect = options.mouseleaveDetect || false;
        this.onViewerGenerate = options.onViewerGenerate || undefined;
        this.onViewerImageGenerate = options.onViewerImageGenerate || undefined;
        this.onViewerImageUpdate = options.onViewerImageUpdate || undefined;
        this.onHintShow = options.onHintShow || undefined;
        this.onHintHide = options.onHintHide || undefined;
        this.onLoadingScreenShow = options.onLoadingScreenShow || undefined;
        this.onLoadingScreenHide = options.onLoadingScreenHide || undefined;
        this.onImagesPreload = options.onImagesPreload || undefined;
        this.onAutoplayStart = options.onAutoplayStart || undefined;
        this.onAutoplayStop = options.onAutoplayStop || undefined;
        this.onNextMove = options.onNextMove || undefined;
        this.onPrevMove = options.onPrevMove || undefined;
        this.onNextFrame = options.onNextFrame || undefined;
        this.onPrevFrame = options.onPrevFrame || undefined;
        this.onDragStart = options.onDragStart || undefined;
        this.onDragEnd = options.onDragEnd || undefined;
        this.onLoad = options.onLoad || undefined;
        this.onUpdate = options.onUpdate || undefined;
        this.elementName = this.setElementName();
        this.imageIndex = 1;
        this.moveBuffer = [];
        this.dragActive = false;
        this.intervals = [];
        this.timeouts = [];
        this.stashedImgs = 0;
    }
    Tridi.prototype.setElementName = function () {
        var el = this.element;
        if (typeof el === "string")
            return el.substr(1);
        if (el.getAttribute("id"))
            return el.getAttribute("id");
        if (el.getAttribute("class"))
            return el.getAttribute("class").split(" ")[0];
        return "unnamedTridi-" + (Math.floor(Math.random() * 90000) + 10000);
    };
    Tridi.prototype.validateUpdate = function (options) {
        if (!options.images &&
            !options.format &&
            !options.count &&
            !options.location) {
            console.error("UpdatableOptions object doesn't contain options that can be updated.");
            return false;
        }
        return true;
    };
    Tridi.prototype.updateOptions = function (options) {
        var _this = this;
        Object.keys(options).map(function (key) {
            _this[key] = options[key];
            if (key === 'images' && options[key].constructor === Array)
                _this.count = options.images.length;
        });
    };
    Tridi.prototype.getElem = function (cssClass) {
        if (typeof this.element === "string") {
            return cssClass
                ? (document.querySelector(this.element + " " + cssClass))
                : document.querySelector(this.element);
        }
        return this.element;
    };
    Tridi.prototype.viewer = function () {
        return this.getElem();
    };
    Tridi.prototype.stash = function () {
        return this.getElem(".tridi-stash");
    };
    Tridi.prototype.getHintOverlay = function () {
        return this.getElem(".tridi-hint-overlay");
    };
    Tridi.prototype.getLoadingScreen = function () {
        return this.getElem(".tridi-loading");
    };
    Tridi.prototype.image = function (whichImage) {
        return this.imgs()[whichImage - 1];
    };
    Tridi.prototype.viewerImage = function () {
        return this.getElem(".tridi-viewer-image");
    };
    Tridi.prototype.lazyLoad = function (callback, skip) {
        if (this.lazy && !skip) {
            this.viewerImage().addEventListener("click", callback);
            if (this.touch) {
                this.viewerImage().addEventListener("touchstart", callback, { passive: this.passive });
            }
        }
        else {
            callback();
        }
    };
    Tridi.prototype.imgs = function () {
        var _this = this;
        if (this.images === "numbered") {
            return (Array.apply(null, { length: this.count }).map(function (_a, index) {
                return _this.location + "/" + (index + 1) + "." + _this.format.toLowerCase();
            }));
        }
        return this.images;
    };
    Tridi.prototype.generateViewer = function () {
        this.viewer().className +=
            " tridi-viewer" +
                (" tridi-" + this.elementName + "-viewer") +
                (" tridi-draggable-" + this.draggable) +
                (" tridi-touch-" + this.touch) +
                (" tridi-mousewheel-" + this.mousewheel) +
                (" tridi-hintOnStartup-" + this.hintOnStartup) +
                (" tridi-lazy-" + this.lazy);
        this.trigger('onViewerGenerate');
    };
    Tridi.prototype.generateLoadingScreen = function () {
        var loadingScreen = document.createElement("div");
        loadingScreen.className += "tridi-loading tridi-" + this.elementName + "-loading";
        loadingScreen.style.display = "none";
        var loadingSpinner = document.createElement("div");
        loadingSpinner.className += "tridi-spinner tridi-" + this.elementName + "-spinner";
        loadingScreen.appendChild(loadingSpinner);
        this.viewer().appendChild(loadingScreen);
    };
    Tridi.prototype.setLoadingState = function (enable, noEvent) {
        this.getLoadingScreen().style.display = enable ? "block" : "none";
        (!noEvent) && this.trigger(enable ? 'onLoadingScreenShow' : 'onLoadingScreenHide');
    };
    Tridi.prototype.generateStash = function () {
        if (!this.stash()) {
            this.stashedImgs = 0;
            var stash = document.createElement("div");
            stash.style.display = "none";
            stash.classList.add("tridi-stash");
            this.viewer().appendChild(stash);
        }
    };
    Tridi.prototype.destroyStash = function () {
        this.stashedImgs = 0;
        this.stash().parentNode.removeChild(this.stash());
    };
    Tridi.prototype.displayHintOnStartup = function (callback) {
        var _this = this;
        if (this.hintOnStartup) {
            var hintOverlayClassName_1 = "tridi-" + this.elementName + "-hint-overlay";
            var hintOverlay = document.createElement("div");
            hintOverlay.className += "tridi-hint-overlay " + hintOverlayClassName_1;
            hintOverlay.tabIndex = 0;
            var hintClassName_1 = "tridi-" + this.elementName + "-hint";
            var hint = document.createElement("div");
            hint.className += "tridi-hint " + hintClassName_1;
            if (this.hintText) {
                hint.innerHTML = "<span class=\"tridi-hint-text tridi-" + this.elementName + "-hint-text\">" + this.hintText + "</span>";
            }
            hintOverlay.appendChild(hint);
            this.viewer().appendChild(hintOverlay);
            this.trigger('onHintShow');
            var hintClickHandler_1 = function (e) {
                var isItHintOverlay = e.target.classList.contains(hintOverlayClassName_1);
                var isItHint = e.target.classList.contains(hintClassName_1);
                if (isItHintOverlay || isItHint) {
                    _this.getHintOverlay().style.display = "none";
                    callback();
                    /* istanbul ignore next */
                    if (_this.focusOnHintClose)
                        _this.viewerImage().focus();
                    _this.trigger('onHintHide');
                }
            };
            document.addEventListener("click", hintClickHandler_1);
            if (this.touch)
                document.addEventListener("touchstart", hintClickHandler_1);
            document.addEventListener("keydown", function (e) {
                /* istanbul ignore next */
                if (e.key === "Enter")
                    hintClickHandler_1(e);
            });
        }
        else {
            callback();
        }
    };
    Tridi.prototype.stashImage = function (stash, imageSrc, index, callback) {
        var img = new Image();
        img.onload = callback.bind(this);
        img.className += "tridi-image tridi-image-" + (index + 1);
        img.src = imageSrc;
        stash.innerHTML += img.outerHTML;
    };
    Tridi.prototype.populateStash = function () {
        var _this = this;
        var stash = this.stash();
        var images = this.imgs();
        (stash && images) && images.map(function (image, index) {
            /* istanbul ignore next */
            _this.stashImage(stash, image, index, function () {
                _this.stashedImgs += 1;
                if (_this.stashedImgs === images.length) {
                    _this.setLoadingState(false, true);
                    _this.trigger('onImagesPreload');
                }
            });
        });
    };
    Tridi.prototype.generateViewerImage = function () {
        var _this = this;
        var viewer = this.viewer();
        var viewerImage = new Image();
        /* istanbul ignore next */
        viewerImage.onload = function () { return _this.trigger('onViewerImageGenerate'); };
        viewerImage.className += "tridi-viewer-image tridi-" + this.elementName + "-viewer-image";
        viewerImage.setAttribute("draggable", "false");
        viewerImage.setAttribute("alt", "");
        viewerImage.src = this.image(1);
        viewer.innerHTML = "" + viewerImage.outerHTML + viewer.innerHTML;
    };
    Tridi.prototype.updateViewerImage = function (whichImage) {
        var _this = this;
        /* istanbul ignore next */
        this.viewerImage().onload = function () { return _this.trigger('onViewerImageUpdate'); };
        this.viewerImage().src = this.image(whichImage);
    };
    Tridi.prototype.nextFrame = function () {
        this.imageIndex = this.imageIndex <= 1 ? this.count : this.imageIndex - 1;
        this.viewerImage().src = this.image(this.imageIndex);
        this.trigger('onNextFrame');
    };
    Tridi.prototype.prevFrame = function () {
        this.imageIndex = this.imageIndex >= this.count ? 1 : this.imageIndex + 1;
        this.viewerImage().src = this.image(this.imageIndex);
        this.trigger('onPrevFrame');
    };
    Tridi.prototype.nextMove = function () {
        this.trigger('onNextMove');
        return this.inverse ? this.prevFrame() : this.nextFrame();
    };
    Tridi.prototype.prevMove = function () {
        this.trigger('onPrevMove');
        return this.inverse ? this.nextFrame() : this.prevFrame();
    };
    Tridi.prototype.rotateViewerImage = function (e) {
        var touch = e.touches;
        var interval = (touch ? this.touchDragInterval : this.dragInterval);
        var eventX = e.touches
            ? e.touches[0].clientX
            : e.clientX;
        var coord = eventX - this.viewerImage().offsetLeft;
        if (this.moveBuffer.length < 2) {
            this.moveBuffer.push(coord);
        }
        else {
            var tmp = this.moveBuffer[1];
            this.moveBuffer[1] = coord;
            this.moveBuffer[0] = tmp;
        }
        var threshold = !(coord % interval);
        var oldMove = this.moveBuffer[0];
        var newMove = this.moveBuffer[1];
        if (threshold && (newMove < oldMove)) {
            this.nextMove();
        }
        else if (threshold && (newMove > oldMove)) {
            this.prevMove();
        }
    };
    Tridi.prototype.startDragging = function () {
        this.dragActive = true;
        this.viewer().classList.add("tridi-dragging");
        this.trigger('onDragStart');
    };
    Tridi.prototype.stopDragging = function () {
        this.dragActive = false;
        this.viewer().classList.remove("tridi-dragging");
        this.trigger('onDragEnd');
    };
    Tridi.prototype.resetMoveBuffer = function () {
        this.moveBuffer.length = 0;
    };
    Tridi.prototype.attachCosmeticEvents = function () {
        var viewer = this.viewer();
        viewer.addEventListener("mouseenter", function () {
            return viewer.classList.add("tridi-viewer-hovered");
        });
        viewer.addEventListener("mouseleave", function () {
            return viewer.classList.remove("tridi-viewer-hovered");
        });
    };
    Tridi.prototype.attachDragEvents = function () {
        var _this = this;
        if (this.draggable) {
            var viewerImage = this.viewerImage();
            viewerImage.addEventListener("mousedown", function (e) {
                /* istanbul ignore next */
                if (e.preventDefault)
                    e.preventDefault();
                _this.startDragging();
                _this.rotateViewerImage(e);
            });
            viewerImage.addEventListener("mouseup", function (e) {
                /* istanbul ignore next */
                if (e.preventDefault)
                    e.preventDefault();
                _this.stopDragging();
                _this.resetMoveBuffer();
            });
            viewerImage.addEventListener("mousemove", function (e) {
                if (_this.dragActive)
                    _this.rotateViewerImage(e);
            });
            viewerImage.addEventListener("mouseleave", function () {
                _this.resetMoveBuffer();
            });
        }
    };
    Tridi.prototype.attachMouseLeaveDetection = function () {
        var _this = this;
        if (this.mouseleaveDetect) {
            this.viewer().addEventListener("mouseleave", function () {
                _this.stopDragging();
                _this.resetMoveBuffer();
            });
        }
    };
    Tridi.prototype.attachTouchEvents = function () {
        var _this = this;
        if (this.touch) {
            var viewerImage = this.viewerImage();
            viewerImage.addEventListener("touchstart", function (e) {
                _this.startDragging();
                _this.rotateViewerImage(e);
            }, { passive: true });
            viewerImage.addEventListener("touchmove", function (e) {
                _this.rotateViewerImage(e);
            }, { passive: true });
            viewerImage.addEventListener("touchend", function () {
                _this.stopDragging();
                _this.resetMoveBuffer();
            });
        }
    };
    Tridi.prototype.attachMousewheelEvents = function () {
        var _this = this;
        if (this.mousewheel) {
            this.viewerImage().addEventListener("wheel", function (e) {
                if (e.preventDefault && !_this.passive)
                    e.preventDefault();
                e.deltaY / 120 > 0 ? _this.nextMove() : _this.prevMove();
            }, { passive: this.passive });
        }
    };
    Tridi.prototype.attachKeyEvents = function () {
        var _this = this;
        if (this.keys) {
            this.viewerImage().setAttribute("tabindex", "0");
            this.viewerImage().addEventListener("keydown", function (e) {
                if (e.key === "ArrowLeft")
                    _this.prevMove();
                if (e.key === "ArrowRight")
                    _this.nextMove();
            });
        }
    };
    Tridi.prototype.clearIntervals = function () {
        this.intervals.map(clearInterval);
        this.intervals.length = 0;
    };
    Tridi.prototype.setAutoplayInterval = function () {
        var autoplayInterval = window.setInterval(this.nextMove.bind(this), this.autoplaySpeed);
        this.intervals.push(autoplayInterval);
    };
    Tridi.prototype.clearTimeouts = function () {
        this.timeouts.map(clearTimeout);
        this.timeouts.length = 0;
    };
    Tridi.prototype.setAutoplayTimeout = function () {
        var autoplayTimeout = window.setTimeout(this.setAutoplayInterval.bind(this), this.resumeAutoplayDelay);
        this.timeouts.push(autoplayTimeout);
    };
    Tridi.prototype.toggleAutoplay = function (state, skipDelay) {
        if (state) {
            this.clearTimeouts();
            if (this.intervals.length === 0) {
                skipDelay ? this.setAutoplayInterval() : this.setAutoplayTimeout();
            }
        }
        else {
            this.clearIntervals();
        }
        this.trigger(state ? 'onAutoplayStart' : 'onAutoplayStop');
    };
    Tridi.prototype.stopAutoplaySequence = function () {
        this.clearTimeouts();
        this.toggleAutoplay(false);
    };
    Tridi.prototype.startAutoplay = function () {
        var _this = this;
        if (this.autoplay) {
            this.toggleAutoplay(true, true);
            if (this.stopAutoplayOnClick) {
                this.viewerImage().addEventListener("mousedown", this.stopAutoplaySequence.bind(this));
                if (this.touch) {
                    this.viewerImage().addEventListener("touchstart", this.stopAutoplaySequence.bind(this), { passive: this.passive });
                }
            }
            if (this.stopAutoplayOnMouseenter) {
                this.viewerImage().addEventListener("mouseenter", this.stopAutoplaySequence.bind(this));
            }
            var handleAutoplayToggle = function (e) {
                (!e.target.classList.contains("tridi-btn")) && _this.toggleAutoplay(true);
            };
            if (this.resumeAutoplayOnMouseleave) {
                var viewerImage = this.viewerImage();
                viewerImage.addEventListener("mouseleave", handleAutoplayToggle);
                if (this.touch)
                    viewerImage.addEventListener("touchend", handleAutoplayToggle);
            }
        }
    };
    Tridi.prototype.attachEvents = function () {
        this.attachCosmeticEvents();
        this.attachDragEvents();
        this.attachMouseLeaveDetection();
        this.attachTouchEvents();
        this.attachMousewheelEvents();
        this.attachKeyEvents();
    };
    Tridi.prototype.start = function () {
        var _this = this;
        this.generateViewer();
        this.generateLoadingScreen();
        this.setLoadingState(true);
        this.generateViewerImage();
        this.setLoadingState(false);
        this.displayHintOnStartup(function () {
            _this.lazyLoad(function () {
                _this.setLoadingState(true);
                _this.generateStash();
                _this.populateStash();
                _this.attachEvents();
                _this.startAutoplay();
                _this.setLoadingState(false);
            });
        });
        this.trigger('onLoad');
    };
    Tridi.prototype.next = function () {
        this.nextMove();
    };
    Tridi.prototype.prev = function () {
        this.prevMove();
    };
    Tridi.prototype.autoplayStart = function () {
        this.toggleAutoplay(true);
    };
    Tridi.prototype.autoplayStop = function () {
        this.toggleAutoplay(false);
    };
    Tridi.prototype.update = function (options, syncFrame) {
        if (this.validateUpdate(options)) {
            this.setLoadingState(true);
            this.updateOptions(options);
            this.destroyStash();
            this.generateStash();
            this.populateStash();
            this.updateViewerImage(syncFrame ? this.imageIndex : 1);
            this.attachEvents();
            this.setLoadingState(false);
            this.trigger('onUpdate');
        }
    };
    Tridi.prototype.load = function () {
        this.start();
    };
    return Tridi;
}());
/* istanbul ignore next */
if (typeof module !== "undefined")
    module.exports = Tridi;
//# sourceMappingURL=tridi.js.map