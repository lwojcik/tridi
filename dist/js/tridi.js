/*
  Tridi v0.0.7 - JavaScript 360 3D Product Viewer
  Author: Lukasz Wojcik
  License: MIT
  Homepage: https://tridi.lukem.net
  GitHub: http://github.com/lukemnet/tridi
*/
var Tridi = /** @class */ (function () {
    function Tridi(options) {
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
        this.count = Array.isArray(this.images) ? this.images.length : options.count;
        this.draggable =
            typeof options.draggable !== "undefined" ? options.draggable : true;
        this.hintOnStartup = options.hintOnStartup || false;
        this.hintText = options.hintText || null;
        this.lazy = options.lazy || false;
        this.autoplay = options.autoplay || false;
        this.autoplaySpeed =
            typeof options.autoplaySpeed !== "undefined" ? options.autoplaySpeed : 50;
        this.stopAutoplayOnClick = options.stopAutoplayOnClick || false;
        this.stopAutoplayOnMouseenter = options.stopAutoplayOnMouseenter || false;
        this.resumeAutoplayOnMouseleave =
            options.resumeAutoplayOnMouseleave || false;
        this.resumeAutoplayDelay = options.resumeAutoplayDelay || 0;
        this.buttons = options.buttons || false;
        this.scroll = options.scroll || false;
        this.passive = typeof options.passive !== "undefined" ? options.passive : true;
        this.spinner = options.spinner || false;
        this.touch = typeof options.touch !== "undefined" ? options.touch : true;
        this.mousewheel = options.mousewheel || false;
        this.wheelInverse = options.wheelInverse || false;
        this.inverse = options.inverse || false;
        this.dragInterval = options.dragInterval || 1;
        this.touchDragInterval = options.touchDragInterval || 2;
        this.mouseleaveDetect =
            typeof options.mouseleaveDetect !== "undefined"
                ? options.mouseleaveDetect
                : false;
        this.imageIndex = 1;
        this.moveBuffer = [];
        this.dragActive = false;
        this.intervals = [];
        this.timeouts = [];
    }
    Tridi.prototype.updateOption = function (option, value) {
        this[option] = value;
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
        Object.keys(options).forEach(function (key) {
            _this.updateOption(key, options[key]);
        });
    };
    Tridi.prototype.getElem = function (cssClass, child) {
        return (document.querySelector("" + this.element + (child ? " " : "") + (cssClass ? cssClass : "")));
    };
    Tridi.prototype.container = function () {
        return this.getElem();
    };
    Tridi.prototype.viewer = function () {
        return this.getElem(".tridi-viewer");
    };
    Tridi.prototype.stash = function () {
        return this.getElem(".tridi-stash", true);
    };
    Tridi.prototype.leftBtn = function () {
        return this.getElem(".tridi-btn-left", true);
    };
    Tridi.prototype.rightBtn = function () {
        return this.getElem(".tridi-btn-right", true);
    };
    Tridi.prototype.getHintOverlay = function () {
        return this.getElem(".tridi-hint-overlay", true);
    };
    Tridi.prototype.getLoadingScreen = function () {
        return this.getElem(".tridi-loading", true);
    };
    Tridi.prototype.image = function (whichImage) {
        return this.imgs()[whichImage - 1];
    };
    Tridi.prototype.firstImage = function () {
        return this.image(1);
    };
    Tridi.prototype.viewerImage = function () {
        return this.getElem(".tridi-viewer .tridi-viewer-image");
    };
    Tridi.prototype.lazyLoad = function (callback, skip) {
        if (this.lazy && !skip) {
            this.viewerImage().addEventListener("click", callback);
            if (this.touch)
                this.viewerImage().addEventListener("touchstart", callback, { passive: this.passive });
        }
        else {
            callback();
        }
    };
    Tridi.prototype.imgs = function () {
        var _this = this;
        if (this.images === "numbered") {
            return (Array.apply(null, { length: this.count }).map(function (_a, index) { return _this.location + "/" + (index + 1) + "." + _this.format.toLowerCase(); }));
        }
        if (Array.isArray(this.images))
            return this.images;
        return null;
    };
    Tridi.prototype.generateViewer = function () {
        var container = this.container();
        if (container) {
            var element = this.element.substr(1);
            container.className +=
                " tridi-viewer" +
                    (" tridi-" + element + "-viewer") +
                    (" tridi-draggable-" + this.draggable) +
                    (" tridi-touch-" + this.touch) +
                    (" tridi-mousewheel-" + this.mousewheel) +
                    (" tridi-hintOnStartup-" + this.hintOnStartup) +
                    (" tridi-lazy-" + this.lazy) +
                    (" tridi-buttons-" + this.buttons);
        }
    };
    Tridi.prototype.generateLoadingScreen = function () {
        var loadingScreen = document.createElement("div");
        loadingScreen.className = "tridi-loading";
        loadingScreen.style.display = "none";
        var loadingSpinner = document.createElement("div");
        loadingSpinner.className = "tridi-spinner";
        loadingScreen.appendChild(loadingSpinner);
        this.viewer().appendChild(loadingScreen);
    };
    Tridi.prototype.setLoadingState = function (enable) {
        this.getLoadingScreen().style.display = enable ? "block" : "none";
    };
    Tridi.prototype.generateStash = function () {
        if (!this.stash()) {
            var stash = document.createElement("div");
            stash.classList.add("tridi-stash");
            this.viewer().appendChild(stash);
        }
    };
    Tridi.prototype.destroyStash = function () {
        this.stash().parentNode.removeChild(this.stash());
    };
    Tridi.prototype.displayHintOnStartup = function (callback) {
        var _this = this;
        if (this.hintOnStartup) {
            var element = this.element.substr(1);
            var hintOverlayClassName_1 = "tridi-" + element + "-hint-overlay";
            var hintOverlay = document.createElement("div");
            hintOverlay.className += "tridi-hint-overlay " + hintOverlayClassName_1;
            hintOverlay.tabIndex = 0;
            var hintClassName_1 = "tridi-" + element + "-hint";
            var hint = document.createElement("div");
            hint.className += "tridi-hint " + hintClassName_1;
            if (this.hintText) {
                hint.innerHTML = "<span class=\"tridi-hint-text\">" + this.hintText + "</span>";
            }
            hintOverlay.appendChild(hint);
            this.viewer().appendChild(hintOverlay);
            var hintClickHandler_1 = function (e) {
                var isItHintOverlay = e.target.classList.contains(hintOverlayClassName_1);
                var isItHintText = e.target.classList.contains(hintClassName_1);
                if (isItHintOverlay || isItHintText) {
                    _this.getHintOverlay().style.display = "none";
                    callback();
                }
            };
            document.addEventListener("click", hintClickHandler_1);
            if (this.touch)
                document.addEventListener("touchstart", hintClickHandler_1);
            document.addEventListener("keydown", function (e) {
                if (e.which === 13)
                    hintClickHandler_1(e);
            });
        }
        else {
            callback();
        }
    };
    Tridi.prototype.populateStash = function () {
        var stash = this.stash();
        var images = this.imgs();
        if (stash && images) {
            images.forEach(function (image, index) {
                stash.innerHTML += "<img src=\"" + image + "\" class=\"tridi-image tridi-image-" + (index + 1) + "\" alt=\"\" />";
            });
        }
    };
    Tridi.prototype.generateViewerImage = function () {
        var viewer = this.viewer();
        var image = this.firstImage();
        viewer.innerHTML = "<img src=\"" + image + "\" alt=\"\" class=\"tridi-viewer-image\" draggable=\"false\" />" + viewer.innerHTML;
    };
    Tridi.prototype.updateViewerImage = function (whichImage) {
        this.viewerImage().src = whichImage
            ? this.image(whichImage)
            : this.firstImage();
    };
    Tridi.prototype.nextFrame = function () {
        this.imageIndex = this.imageIndex <= 1
            ? this.count
            : this.imageIndex - 1;
        this.viewerImage().src = this.image(this.imageIndex);
    };
    Tridi.prototype.prevFrame = function () {
        this.imageIndex = this.imageIndex >= this.count
            ? 1
            : this.imageIndex + 1;
        this.viewerImage().src = this.image(this.imageIndex);
    };
    Tridi.prototype.nextMove = function () {
        return this.inverse ? this.prevFrame() : this.nextFrame();
    };
    Tridi.prototype.prevMove = function () {
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
        if (threshold) {
            if (newMove < oldMove) {
                this.nextMove();
            }
            else if (newMove > oldMove) {
                this.prevMove();
            }
        }
    };
    Tridi.prototype.startDragging = function () {
        this.dragActive = true;
    };
    Tridi.prototype.stopDragging = function () {
        this.dragActive = false;
    };
    Tridi.prototype.resetMoveBuffer = function () {
        this.moveBuffer.length = 0;
    };
    Tridi.prototype.attachCosmeticEvents = function () {
        var viewer = this.viewer();
        var toggleViewer = function () { return viewer.classList.toggle("tridi-viewer-hovered"); };
        viewer.addEventListener("mouseenter", toggleViewer);
        viewer.addEventListener("mouseleave", toggleViewer);
    };
    Tridi.prototype.attachDragEvents = function () {
        var _this = this;
        if (this.draggable) {
            var viewerImage = this.viewerImage();
            viewerImage.addEventListener("mousedown", function (e) {
                if (e.preventDefault)
                    e.preventDefault();
                _this.startDragging();
                _this.rotateViewerImage(e);
            });
            viewerImage.addEventListener("mouseup", function (e) {
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
    Tridi.prototype.generateButton = function (btnName) {
        var btn = document.createElement("div");
        btn.setAttribute("tabindex", "0");
        btn.className += "tridi-btn tridi-btn-" + btnName;
        this.viewer().appendChild(btn);
    };
    Tridi.prototype.generateButtons = function () {
        if (this.buttons && !this.leftBtn() && !this.rightBtn()) {
            this.generateButton("left");
            this.generateButton("right");
        }
    };
    Tridi.prototype.attachBtnEvents = function (element, callback) {
        element.addEventListener("click", callback);
        element.addEventListener("keydown", function (e) {
            if (e.which === 13)
                callback();
        });
    };
    Tridi.prototype.attachButtonsEvents = function () {
        if (this.buttons) {
            if (this.leftBtn())
                this.attachBtnEvents(this.leftBtn(), this.nextMove.bind(this));
            if (this.rightBtn())
                this.attachBtnEvents(this.rightBtn(), this.prevMove.bind(this));
        }
    };
    Tridi.prototype.clearIntervals = function () {
        this.intervals.forEach(clearInterval);
        this.intervals.length = 0;
    };
    Tridi.prototype.setAutoplayInterval = function () {
        var _this = this;
        var autoplayInterval = window.setInterval(function () {
            _this.nextMove();
        }, this.autoplaySpeed);
        this.intervals.push(autoplayInterval);
    };
    Tridi.prototype.clearTimeouts = function () {
        this.timeouts.forEach(clearTimeout);
        this.timeouts.length = 0;
    };
    Tridi.prototype.setAutoplayTimeout = function () {
        var _this = this;
        var autoplayTimeout = window.setTimeout(function () {
            _this.setAutoplayInterval();
        }, this.resumeAutoplayDelay);
        this.timeouts.push(autoplayTimeout);
    };
    Tridi.prototype.toggleAutoplay = function (state, skipDelay) {
        if (state) {
            this.clearTimeouts();
            if (this.intervals.length === 0) {
                skipDelay
                    ? this.setAutoplayInterval()
                    : this.setAutoplayTimeout();
            }
        }
        else {
            this.clearIntervals();
        }
    };
    Tridi.prototype.startAutoplay = function () {
        var _this = this;
        if (this.autoplay) {
            this.toggleAutoplay(true, true);
            if (this.stopAutoplayOnClick) {
                this.viewerImage().addEventListener("mousedown", function () {
                    _this.toggleAutoplay(false);
                });
            }
            if (this.stopAutoplayOnMouseenter) {
                this.viewerImage().addEventListener("mouseenter", function () {
                    _this.toggleAutoplay(false);
                });
            }
            if (this.resumeAutoplayOnMouseleave) {
                var viewerImage = this.viewerImage();
                viewerImage.addEventListener("mouseleave", function (e) {
                    if (!e.target.classList.contains("tridi-btn")) {
                        _this.toggleAutoplay(true);
                    }
                });
            }
        }
    };
    Tridi.prototype.attachEvents = function () {
        this.attachCosmeticEvents();
        this.attachDragEvents();
        this.attachMouseLeaveDetection();
        this.attachTouchEvents();
        this.attachMousewheelEvents();
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
                _this.generateButtons();
                _this.attachButtonsEvents();
                _this.startAutoplay();
                _this.setLoadingState(false);
            });
        });
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
        }
    };
    Tridi.prototype.load = function () {
        this.start();
    };
    return Tridi;
}());
//# sourceMappingURL=tridi.js.map