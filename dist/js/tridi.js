/*
  Tridi - JavaScript 3D Image Viewer
  Author: Łukasz Wójcik
  License: MIT
  Homepage: https://tridi.lukem.net
  GitHub: http://github.com/lukemnet/tridi
*/
var Tridi = /** @class */ (function () {
    // private loaded: boolean;
    function Tridi(options) {
        this.validateOptions = function (options) {
            if (!options.element) {
                console.error(Tridi.header(), "'element' property is missing or invalid. Container element must be specified.");
            }
            if (typeof options.images === 'undefined' && typeof options.imageFormat === 'undefined') {
                console.error(Tridi.header(), "'imageFormat' property is missing or invalid. Image format must be provided for 'numbered' property.");
            }
            if (options.images === 'numbered' && !options.imageLocation) {
                console.error(Tridi.header(), "'imageLocation' property is missing or invalid. Image location must be provided for 'numbered' property.");
            }
            if (Array.isArray(options.images) && options.imageFormat) {
                console.warn(Tridi.header(), "Got array of images as initalizing parameter. 'imageFormat' property will be ignored.");
            }
            if (Array.isArray(options.images) && options.imageLocation) {
                console.warn(Tridi.header(), "Got array of images as initalizing parameter. 'imageLocation' property will be ignored.");
            }
            if (Array.isArray(options.images) && options.imageCount) {
                console.warn(Tridi.header(), "Got array of images as initalizing parameter. 'imageCount' property will be ignored.");
            }
            if (!options.showHintOnStartup && options.hintText) {
                console.warn(Tridi.header(), "'showHintOnStartup is set to 'false'. 'hintText' parameter will be ignored.");
            }
            if (!options.draggable && options.mouseleaveDetect) {
                console.warn(Tridi.header(), "'draggable is set to 'false'. 'mouseleaveDetect' parameter will be ignored.");
            }
            if (!options.autoplay && options.autoplaySpeed) {
                console.warn(Tridi.header(), "'autoplay is set to 'false'. 'autoplaySpeed' parameter will be ignored.");
            }
            if (!options.autoplay && options.stopAutoplayOnMouseenter) {
                console.warn(Tridi.header(), "'autoplay is set to 'false'. 'stopAutoplayOnMouseenter' parameter will be ignored.");
            }
            if (!options.autoplay && options.resumeAutoplayOnMouseleave) {
                console.warn(Tridi.header(), "'autoplay is set to 'false'. 'resumeAutoplayOnMouseleave' parameter will be ignored.");
            }
            if (!options.autoplay && options.resumeAutoplayDelay) {
                console.warn(Tridi.header(), "'autoplay is set to 'false'. 'resumeAutoplayDelay' parameter will be ignored.");
            }
        };
        this.validateOptions(options);
        this.element = options.element;
        this.images = options.images || 'numbered';
        this.imageFormat = options.imageFormat || undefined;
        this.imageLocation = options.imageLocation || './images';
        this.imageCount = Array.isArray(this.images) ? this.images.length : (options.imageCount) || options.imagecount || options.count;
        this.draggable = typeof options.draggable !== 'undefined' ? options.draggable : true;
        this.showHintOnStartup = options.showHintOnStartup || false;
        this.hintText = options.hintText || null;
        this.lazy = options.lazy || false;
        this.autoplay = options.autoplay || false;
        this.autoplaySpeed = typeof options.autoplaySpeed !== 'undefined' ? options.autoplaySpeed || options.autoplayspeed : 50;
        this.stopAutoplayOnClick = options.stopAutoplayOnClick || false;
        this.stopAutoplayOnMouseenter = options.stopAutoplayOnMouseenter || false;
        this.resumeAutoplayOnMouseleave = options.resumeAutoplayOnMouseleave || false;
        this.resumeAutoplayDelay = options.resumeAutoplayDelay || 0;
        this.buttons = options.buttons || false;
        this.scroll = options.scroll || false;
        this.spinner = typeof options.spinner !== 'undefined' ? options.spinner : false;
        this.touch = typeof options.touch !== 'undefined' ? options.touch : true;
        this.mousewheel = options.mousewheel || false;
        this.wheelInverse = options.wheelInverse || false;
        this.inverse = options.inverse || false;
        this.dragInterval = options.dragInterval || 1;
        this.touchDragInterval = options.touchDragInterval || 1;
        this.mouseleaveDetect = typeof options.mouseleaveDetect !== 'undefined' ? options.mouseleaveDetect : false;
        this.verbose = options.verbose || options.debug || false;
        this.imageIndex = 1;
        this.moveBuffer = [];
        this.moveState = 0;
        this.dragActive = false;
        this.intervals = [];
        this.timeouts = [];
        // this.loaded = false;
        if (this.verbose)
            console.log(Tridi.header(this.element), 'Class intialized');
    }
    Tridi.header = function (element) {
        return "Tridi" + (element ? " [" + element + "]" : '') + ":";
    };
    Tridi.prototype.appendClass = function (element, className) {
        element.className += element.className.length === 0 ? className : " " + className;
    };
    Tridi.prototype.addClassName = function (element, className) {
        var _this = this;
        if (typeof className === 'string') {
            if (!element.classList.contains(className)) {
                this.appendClass(element, className);
            }
        }
        else if (Array.isArray(className)) {
            className.forEach(function (clname) {
                if (!element.classList.contains(clname)) {
                    _this.appendClass(element, clname);
                }
            });
        }
    };
    Tridi.prototype.removeClassName = function (element, className) {
        if (typeof className === 'string') {
            if (element.classList.contains(className)) {
                element.classList.remove(className);
            }
        }
        else if (Array.isArray(className)) {
            className.forEach(function (clname) {
                if (element.classList.contains(clname)) {
                    element.classList.remove(clname);
                }
            });
        }
    };
    Tridi.prototype.getContainer = function () {
        return document.querySelector(this.element);
    };
    Tridi.prototype.getViewer = function () {
        return document.querySelector(this.element + ".tridi-viewer");
    };
    Tridi.prototype.getStash = function () {
        return document.querySelector(this.element + " .tridi-stash");
    };
    Tridi.prototype.getLeftButton = function () {
        return document.querySelector(this.element + " .tridi-btn-left");
    };
    Tridi.prototype.getRightButton = function () {
        return document.querySelector(this.element + " .tridi-btn-right");
    };
    Tridi.prototype.getHintOverlay = function () {
        return document.querySelector(this.element + " .tridi-hint-overlay");
    };
    Tridi.prototype.getLoadingScreen = function () {
        return document.querySelector(this.element + " .tridi-loading");
    };
    Tridi.prototype.getImage = function (whichImage) {
        return this.getImages()[whichImage - 1];
    };
    Tridi.prototype.getFirstImage = function () {
        return this.getImage(1);
    };
    Tridi.prototype.getViewerImage = function () {
        return document.querySelector(this.element + ".tridi-viewer .tridi-viewer-image");
    };
    Tridi.prototype.lazyLoad = function (callback, skip) {
        if (this.lazy && !skip) {
            var viewerImage = this.getViewerImage();
            viewerImage.addEventListener('click', function () {
                callback();
            });
        }
        else {
            callback();
        }
    };
    Tridi.prototype.getImages = function () {
        if (this.images === 'numbered') {
            var count = this.imageCount;
            var location_1 = this.imageLocation;
            var format_1 = this.imageFormat;
            return Array.from(new Array(count), function (_a, index) { return location_1 + "/" + (index + 1) + "." + format_1; });
        }
        else if (Array.isArray(this.images)) {
            return this.images;
        }
        else {
            console.error(Tridi.header(this.element), 'Error getting images from source.');
            return null;
        }
    };
    Tridi.prototype.generateViewer = function () {
        var container = this.getContainer();
        if (!container) {
            console.error(this.element, "Viewer element not found");
        }
        else {
            if (this.verbose)
                console.log(Tridi.header(this.element), 'Appending Tridi CSS classes');
            this.addClassName(container, [
                // 'tridi-loading',
                'tridi-viewer',
                "tridi-viewer-" + this.element.substr(1),
                "tridi-draggable-" + this.draggable,
                "tridi-touch-" + this.touch,
                "tridi-mousewheel-" + this.mousewheel,
                "tridi-wheelInverse-" + this.wheelInverse,
                "tridi-showHintOnStartup-" + this.showHintOnStartup,
                "tridi-lazy-" + this.lazy,
                "tridi-buttons-" + this.buttons,
            ]);
        }
    };
    Tridi.prototype.generateLoadingScreen = function () {
        var loadingScreen = document.createElement('div');
        loadingScreen.className = 'tridi-loading';
        loadingScreen.style.display = 'none';
        var loadingSpinner = document.createElement('div');
        loadingSpinner.className = 'tridi-spinner';
        loadingScreen.appendChild(loadingSpinner);
        this.getViewer().appendChild(loadingScreen);
    };
    Tridi.prototype.setLoadingState = function (enable) {
        this.getLoadingScreen().style.display = enable ? 'block' : 'none';
    };
    Tridi.prototype.generateStash = function () {
        var stash = this.getStash();
        if (!stash) {
            if (this.verbose)
                console.log(Tridi.header(this.element), 'Generating image stash');
            var stashElement = document.createElement('div');
            stashElement.className = 'tridi-stash';
            stashElement.style.display = 'none';
            this.getViewer().appendChild(stashElement);
        }
    };
    Tridi.prototype.displayHintOnStartup = function (callback) {
        var _this = this;
        if (this.showHintOnStartup) {
            if (this.verbose)
                console.log(Tridi.header(this.element), 'Generating hint on startup');
            var element_1 = this.element.substr(1);
            var hintOverlay = document.createElement('div');
            hintOverlay.className = "tridi-hint-overlay tridi-" + element_1 + "-hint-overlay";
            hintOverlay.tabIndex = 0;
            var hint = document.createElement('div');
            hint.className = 'tridi-hint';
            if (this.hintText)
                hint.innerHTML = "<span class=\"tridi-hint-text tridi-" + element_1 + "-hint-text\">" + this.hintText + "</span>";
            hintOverlay.appendChild(hint);
            this.getViewer().appendChild(hintOverlay);
            var hintClickHandler_1 = function (e) {
                var isItHintOverlay = e.target.classList.contains("tridi-" + element_1 + "-hint-overlay");
                var isItHintText = e.target.classList.contains("tridi-" + element_1 + "-hint-text");
                if (isItHintOverlay || isItHintText) {
                    _this.getHintOverlay().style.display = 'none';
                    callback();
                }
            };
            document.addEventListener('click', hintClickHandler_1);
            document.addEventListener('keydown', function (e) {
                if (e.which === 13)
                    hintClickHandler_1(e);
            });
        }
        else {
            callback();
        }
    };
    Tridi.prototype.populateStash = function () {
        var stash = this.getStash();
        var images = this.getImages();
        if (stash && images) {
            images.forEach(function (image, index) {
                stash.innerHTML += "<img src=\"" + image + "\" class=\"tridi-image-" + (index + 1) + "\" alt=\"\" />";
            });
        }
        else {
            console.error(this.element, 'Error populating stash!');
        }
    };
    Tridi.prototype.generateViewerImage = function () {
        if (this.verbose)
            console.log(Tridi.header(this.element), 'Generating first image');
        var element = this.element.substr(1);
        var viewer = this.getViewer();
        var image = this.getFirstImage();
        viewer.innerHTML = "<img src=\"" + image + "\" alt=\"\" class=\"tridi-viewer-image tridi-viewer-" + element + "-image\" draggable=\"false\" />" + viewer.innerHTML;
    };
    Tridi.prototype.nextFrame = function () {
        var viewerImage = this.getViewerImage();
        this.imageIndex = this.imageIndex <= 1
            ? this.imageCount
            : this.imageIndex - 1;
        viewerImage.src = this.getImage(this.imageIndex);
    };
    Tridi.prototype.previousFrame = function () {
        var viewerImage = this.getViewerImage();
        this.imageIndex = this.imageIndex >= this.imageCount
            ? 1
            : this.imageIndex + 1;
        viewerImage.src = this.getImage(this.imageIndex);
    };
    Tridi.prototype.rotateViewerImage = function (e) {
        var _this = this;
        var touch = e.touches;
        var interval = touch ? this.touchDragInterval : this.dragInterval;
        this.moveState += 1;
        var eventX = e.touches
            ? e.touches[0].clientX
            : e.clientX;
        var coord = (eventX - this.getViewerImage().offsetLeft);
        this.moveBuffer.push(coord);
        var moveLength = this.moveBuffer.length;
        var oldMove = this.moveBuffer[moveLength - 2];
        var newMove = this.moveBuffer[moveLength - 1];
        var threshold = !(this.moveState % interval);
        var nextMove = function () { return _this.inverse ? _this.previousFrame() : _this.nextFrame(); };
        var previousMove = function () { return _this.inverse ? _this.nextFrame() : _this.previousFrame(); };
        if (threshold) {
            if (newMove < oldMove) {
                nextMove();
            }
            else if (newMove > oldMove) {
                previousMove();
            }
        }
    };
    Tridi.prototype.startDragging = function () {
        var viewer = this.getViewer();
        this.addClassName(viewer, 'tridi-dragging');
        this.dragActive = true;
    };
    Tridi.prototype.stopDragging = function () {
        var viewer = this.getViewer();
        this.removeClassName(viewer, 'tridi-dragging');
        this.dragActive = false;
    };
    Tridi.prototype.resetMoveBuffer = function () {
        this.moveBuffer = [];
    };
    Tridi.prototype.attachCosmeticEvents = function () {
        var _this = this;
        if (this.verbose)
            console.log(Tridi.header(this.element), 'Attaching common events');
        var viewer = this.getViewer();
        viewer.addEventListener('mouseenter', function () {
            if (_this.verbose)
                console.log(Tridi.header(_this.element), 'Mouseenter event triggered');
            _this.addClassName(viewer, 'tridi-viewer-hovered');
        });
        viewer.addEventListener('mouseleave', function () {
            if (_this.verbose)
                console.log(Tridi.header(_this.element), 'Mouseenter event triggered');
            _this.removeClassName(viewer, 'tridi-viewer-hovered');
        });
    };
    Tridi.prototype.attachDragEvents = function () {
        var _this = this;
        if (this.draggable) {
            var viewerImage = this.getViewerImage();
            if (this.verbose)
                console.log(Tridi.header(this.element), 'Attaching drag events');
            viewerImage.addEventListener('mouseup', function (e) {
                if (e.preventDefault)
                    e.preventDefault();
                if (_this.verbose)
                    console.log(Tridi.header(_this.element), 'Mouseup triggered');
                _this.stopDragging();
                _this.resetMoveBuffer();
            });
            viewerImage.addEventListener('mousedown', function (e) {
                if (e.preventDefault)
                    e.preventDefault();
                if (_this.verbose)
                    console.log(Tridi.header(_this.element), 'Mousedown triggered');
                _this.startDragging();
                _this.rotateViewerImage(e);
            });
            viewerImage.addEventListener('mousemove', function (e) {
                if (_this.dragActive) {
                    if (e.preventDefault)
                        e.preventDefault();
                    if (_this.verbose)
                        console.log(Tridi.header(_this.element), 'Mousemove triggered');
                    _this.rotateViewerImage(e);
                }
            });
            viewerImage.addEventListener('mouseleave', function () {
                if (_this.verbose)
                    console.log(Tridi.header(_this.element), 'Mouseleave triggered');
                _this.resetMoveBuffer();
            });
        }
    };
    Tridi.prototype.attachMouseLeaveDetection = function () {
        var _this = this;
        if (this.mouseleaveDetect) {
            if (this.verbose)
                console.log(Tridi.header(this.element), 'Attaching mouseleave detection');
            var viewer = this.getViewer();
            viewer.addEventListener('mouseleave', function () {
                if (_this.verbose)
                    console.log(Tridi.header(_this.element), 'Viewer mouseleave triggered');
                _this.stopDragging();
                _this.resetMoveBuffer();
            });
        }
    };
    Tridi.prototype.attachTouchEvents = function () {
        var _this = this;
        if (this.touch) {
            if (this.verbose)
                console.log(Tridi.header(this.element), 'Attaching touch events');
            var viewerImage = this.getViewerImage();
            viewerImage.addEventListener('touchstart', function (e) {
                if (e.preventDefault)
                    e.preventDefault();
                if (_this.verbose)
                    console.log(Tridi.header(_this.element), 'Touchstart triggered');
                _this.startDragging();
                _this.rotateViewerImage(e);
            });
            viewerImage.addEventListener('touchmove', function (e) {
                if (e.preventDefault)
                    e.preventDefault();
                if (_this.verbose)
                    console.log(Tridi.header(_this.element), 'Touchmove triggered');
                _this.rotateViewerImage(e);
            });
            viewerImage.addEventListener('touchend', function (e) {
                if (e.preventDefault)
                    e.preventDefault();
                if (_this.verbose)
                    console.log(Tridi.header(_this.element), 'Touchend triggered');
                _this.stopDragging();
                _this.resetMoveBuffer();
            });
        }
    };
    Tridi.prototype.attachMousewheelEvents = function () {
        var _this = this;
        if (this.mousewheel) {
            if (this.verbose)
                console.log(Tridi.header(this.element), 'Attaching mousewheel events');
            var viewerImage = this.getViewerImage();
            var nextMove_1 = function () { return _this.wheelInverse ? _this.previousFrame() : _this.nextFrame(); };
            var previousMove_1 = function () { return _this.wheelInverse ? _this.nextFrame() : _this.previousFrame(); };
            viewerImage.addEventListener('wheel', function (e) {
                if (e.preventDefault)
                    e.preventDefault();
                (e.deltaY / 120 > 0) ? nextMove_1() : previousMove_1();
            });
        }
    };
    Tridi.prototype.generateButtons = function () {
        if (this.buttons) {
            if (!this.getLeftButton() && !this.getRightButton()) {
                if (this.verbose)
                    console.log(Tridi.header(this.element), 'Generating buttons');
                var leftBtn = document.createElement('div');
                var rightBtn = document.createElement('div');
                leftBtn.className += 'tridi-btn tridi-btn-left';
                leftBtn.setAttribute('tabindex', '0');
                rightBtn.className += 'tridi-btn tridi-btn-right';
                rightBtn.setAttribute('tabindex', '0');
                this.getViewer().appendChild(leftBtn);
                this.getViewer().appendChild(rightBtn);
            }
        }
    };
    Tridi.prototype.attachButtonEvents = function () {
        var _this = this;
        if (this.buttons) {
            var leftBtn = this.getLeftButton();
            var rightBtn = this.getRightButton();
            if (leftBtn) {
                if (this.verbose)
                    console.log(Tridi.header(this.element), 'Attaching left button click event');
                leftBtn.addEventListener('click', function () {
                    if (_this.verbose)
                        console.log(Tridi.header(_this.element), 'Left button click triggered');
                    _this.inverse ? _this.previousFrame() : _this.nextFrame();
                });
                leftBtn.addEventListener('keydown', function (e) {
                    if (e.which === 13) {
                        if (_this.verbose)
                            console.log(Tridi.header(_this.element), 'Left button Enter keydown triggered');
                        _this.inverse ? _this.previousFrame() : _this.nextFrame();
                    }
                });
            }
            if (rightBtn) {
                if (this.verbose)
                    console.log(Tridi.header(this.element), 'Attaching right button click event');
                rightBtn.addEventListener('click', function () {
                    if (_this.verbose)
                        console.log(Tridi.header(_this.element), 'Right button click triggered');
                    _this.inverse ? _this.nextFrame() : _this.previousFrame();
                });
                rightBtn.addEventListener('keydown', function (e) {
                    if (e.which === 13) {
                        if (_this.verbose)
                            console.log(Tridi.header(_this.element), 'Right button Enter keydown triggered');
                        _this.inverse ? _this.nextFrame() : _this.previousFrame();
                    }
                });
            }
        }
    };
    Tridi.prototype.toggleAutoplay = function (state, skipDelay) {
        var delay = this.resumeAutoplayDelay;
        var speed = this.autoplaySpeed;
        if (state === false) {
            this.intervals.forEach(clearInterval);
            this.intervals = [];
        }
        else {
            var self_1 = this;
            this.timeouts.forEach(clearTimeout);
            this.timeouts = [];
            if (skipDelay) {
                var autoplayInterval = setInterval(function () {
                    self_1.nextFrame();
                }, speed);
                self_1.intervals.push(autoplayInterval);
            }
            else {
                var autoplayTimeout = setTimeout(function () {
                    var autoplayInterval = setInterval(function () {
                        self_1.nextFrame();
                    }, speed);
                    self_1.intervals.push(autoplayInterval);
                }, delay);
                self_1.timeouts.push(autoplayTimeout);
            }
        }
    };
    Tridi.prototype.startAutoplay = function () {
        var _this = this;
        if (this.autoplay) {
            if (this.verbose)
                console.log(Tridi.header(this.element), 'Starting autoplay');
            this.toggleAutoplay(true, true);
            if (this.stopAutoplayOnClick) {
                if (this.verbose)
                    console.log(Tridi.header(this.element), 'Enable stop autoplay on click event');
                var viewerImage = this.getViewerImage();
                viewerImage.addEventListener('mousedown', function () {
                    _this.toggleAutoplay(false);
                });
            }
            if (this.stopAutoplayOnMouseenter) {
                if (this.verbose)
                    console.log(Tridi.header(this.element), 'Enable stop autoplay on hover event');
                var viewerImage = this.getViewerImage();
                viewerImage.addEventListener('mouseenter', function () {
                    if (_this.verbose)
                        console.log(Tridi.header(_this.element), 'Stopping autoplay on mouseenter');
                    _this.toggleAutoplay(false);
                });
            }
            if (this.resumeAutoplayOnMouseleave) {
                var viewerImage = this.getViewerImage();
                viewerImage.addEventListener('mouseleave', function (e) {
                    if (_this.verbose)
                        console.log(Tridi.header(_this.element), 'Resuming autoplay on mouseleave');
                    if (!e.target.classList.contains('tridi-btn')) {
                        _this.toggleAutoplay(true);
                    }
                });
            }
        }
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
                _this.attachCosmeticEvents();
                _this.attachDragEvents();
                _this.attachMouseLeaveDetection();
                _this.attachTouchEvents();
                _this.attachMousewheelEvents();
                _this.generateButtons();
                _this.attachButtonEvents();
                _this.startAutoplay();
                _this.setLoadingState(false);
            });
        });
    };
    Tridi.prototype.load = function () {
        this.start();
    };
    return Tridi;
}());
//# sourceMappingURL=tridi.js.map