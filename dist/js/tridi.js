/*
  Tridi v0.0.4 - 3D 360 Product Viewer
  Author: Łukasz Wójcik
  License: MIT
  Homepage: https://tridi.lukem.net
  GitHub: http://github.com/lukemnet/tridi
*/
var Tridi = /** @class */ (function () {
    function Tridi(options) {
        this.validate = function (options) {
            if (!options.element) {
                console.error(Tridi.h(), "'element' property is missing or invalid. Container element must be specified.");
            }
            if (typeof options.images === 'undefined' && typeof options.imageFormat === 'undefined') {
                console.error(Tridi.h(), "'imageFormat' property is missing or invalid. Image format must be provided for 'numbered' property.");
            }
            if (options.images === 'numbered' && !options.imageLocation) {
                console.error(Tridi.h(), "'imageLocation' property is missing or invalid. Image location must be provided for 'numbered' property.");
            }
            if (Array.isArray(options.images) && options.imageFormat) {
                console.warn(Tridi.h(), "Got array of images as initalizing parameter. 'imageFormat' property will be ignored.");
            }
            if (Array.isArray(options.images) && options.imageLocation) {
                console.warn(Tridi.h(), "Got array of images as initalizing parameter. 'imageLocation' property will be ignored.");
            }
            if (Array.isArray(options.images) && options.imageCount) {
                console.warn(Tridi.h(), "Got array of images as initalizing parameter. 'imageCount' property will be ignored.");
            }
            if (!options.showHintOnStartup && options.hintText) {
                console.warn(Tridi.h(), "'showHintOnStartup is set to 'false'. 'hintText' parameter will be ignored.");
            }
            if (!options.draggable && options.mouseleaveDetect) {
                console.warn(Tridi.h(), "'draggable is set to 'false'. 'mouseleaveDetect' parameter will be ignored.");
            }
            if (!options.autoplay && options.autoplaySpeed) {
                console.warn(Tridi.h(), "'autoplay is set to 'false'. 'autoplaySpeed' parameter will be ignored.");
            }
            if (!options.autoplay && options.stopAutoplayOnMouseenter) {
                console.warn(Tridi.h(), "'autoplay is set to 'false'. 'stopAutoplayOnMouseenter' parameter will be ignored.");
            }
            if (!options.autoplay && options.resumeAutoplayOnMouseleave) {
                console.warn(Tridi.h(), "'autoplay is set to 'false'. 'resumeAutoplayOnMouseleave' parameter will be ignored.");
            }
            if (!options.autoplay && options.resumeAutoplayDelay) {
                console.warn(Tridi.h(), "'autoplay is set to 'false'. 'resumeAutoplayDelay' parameter will be ignored.");
            }
        };
        this.validate(options);
        this.element = options.element;
        this.images = options.images || 'numbered';
        this.imageFormat = options.imageFormat || undefined;
        this.imageLocation = options.imageLocation || './images';
        this.imageCount = Array.isArray(this.images) ? this.images.length : options.imageCount;
        this.draggable = typeof options.draggable !== 'undefined' ? options.draggable : true;
        this.showHintOnStartup = options.showHintOnStartup || false;
        this.hintText = options.hintText || null;
        this.lazy = options.lazy || false;
        this.autoplay = options.autoplay || false;
        this.autoplaySpeed = typeof options.autoplaySpeed !== 'undefined' ? options.autoplaySpeed : 50;
        this.stopAutoplayOnClick = options.stopAutoplayOnClick || false;
        this.stopAutoplayOnMouseenter = options.stopAutoplayOnMouseenter || false;
        this.resumeAutoplayOnMouseleave = options.resumeAutoplayOnMouseleave || false;
        this.resumeAutoplayDelay = options.resumeAutoplayDelay || 0;
        this.buttons = options.buttons || false;
        this.scroll = options.scroll || false;
        this.spinner = options.spinner || false;
        this.touch = typeof options.touch !== 'undefined' ? options.touch : true;
        this.mousewheel = options.mousewheel || false;
        this.wheelInverse = options.wheelInverse || false;
        this.inverse = options.inverse || false;
        this.dragInterval = options.dragInterval || 1;
        this.touchDragInterval = options.touchDragInterval || 2;
        this.mouseleaveDetect = typeof options.mouseleaveDetect !== 'undefined' ? options.mouseleaveDetect : false;
        this.verbose = options.verbose || false;
        this.imageIndex = 1;
        this.moveBuffer = [];
        this.dragActive = false;
        this.intervals = [];
        this.timeouts = [];
        if (this.verbose)
            console.log(Tridi.h(this.element), 'Class intialized');
    }
    Tridi.h = function (element) {
        return "Tridi" + (element ? " [" + element + "]" : '') + ":";
    };
    Tridi.prototype.getElem = function (cssClass, child) {
        return document.querySelector("" + this.element + (child ? ' ' : '') + (cssClass ? cssClass : ''));
    };
    Tridi.prototype.container = function () {
        return this.getElem();
    };
    Tridi.prototype.viewer = function () {
        return this.getElem('.tridi-viewer');
    };
    Tridi.prototype.stash = function () {
        return this.getElem('.tridi-stash', true);
    };
    Tridi.prototype.leftBtn = function () {
        return this.getElem('.tridi-btn-left', true);
    };
    Tridi.prototype.rightBtn = function () {
        return this.getElem('.tridi-btn-right', true);
    };
    Tridi.prototype.getHintOverlay = function () {
        return this.getElem('.tridi-hint-overlay', true);
    };
    Tridi.prototype.getLoadingScreen = function () {
        return this.getElem('.tridi-loading', true);
    };
    Tridi.prototype.image = function (whichImage) {
        return this.imgs()[whichImage - 1];
    };
    Tridi.prototype.firstImage = function () {
        return this.image(1);
    };
    Tridi.prototype.viewerImage = function () {
        return this.getElem('.tridi-viewer .tridi-viewer-image');
    };
    Tridi.prototype.lazyLoad = function (callback, skip) {
        if (this.lazy && !skip) {
            this.viewerImage().addEventListener('click', function () {
                callback();
            });
            if (this.touch) {
                this.viewerImage().addEventListener('touchstart', function () {
                    callback();
                });
            }
        }
        else {
            callback();
        }
    };
    Tridi.prototype.imgs = function () {
        if (this.images === 'numbered') {
            var count = this.imageCount;
            var location_1 = this.imageLocation;
            var format_1 = this.imageFormat;
            return Array.apply(null, { length: count }).map(function (_a, index) { return location_1 + "/" + (index + 1) + "." + format_1; });
        }
        if (Array.isArray(this.images))
            return this.images;
        console.error(Tridi.h(this.element), 'Error getting images from source.');
        return null;
    };
    Tridi.prototype.generateViewer = function () {
        var container = this.container();
        if (!container) {
            console.error(this.element, "Viewer element not found");
        }
        else {
            if (this.verbose)
                console.log(Tridi.h(this.element), 'Appending Tridi CSS classes');
            container.classList.add('tridi-viewer', "tridi-viewer-" + this.element.substr(1), "tridi-draggable-" + this.draggable, "tridi-touch-" + this.touch, "tridi-mousewheel-" + this.mousewheel, "tridi-showHintOnStartup-" + this.showHintOnStartup, "tridi-lazy-" + this.lazy, "tridi-buttons-" + this.buttons);
        }
    };
    Tridi.prototype.generateLoadingScreen = function () {
        var loadingScreen = document.createElement('div');
        loadingScreen.className = 'tridi-loading';
        loadingScreen.style.display = 'none';
        var loadingSpinner = document.createElement('div');
        loadingSpinner.className = 'tridi-spinner';
        loadingScreen.appendChild(loadingSpinner);
        this.viewer().appendChild(loadingScreen);
    };
    Tridi.prototype.setLoadingState = function (enable) {
        this.getLoadingScreen().style.display = enable ? 'block' : 'none';
    };
    Tridi.prototype.generateStash = function () {
        if (!this.stash()) {
            if (this.verbose)
                console.log(Tridi.h(this.element), 'Generating image stash');
            var stashElement = document.createElement('div');
            stashElement.classList.add('tridi-stash', "tridi-" + this.element + "-stash");
            this.viewer().appendChild(stashElement);
        }
    };
    Tridi.prototype.displayHintOnStartup = function (callback) {
        var _this = this;
        if (this.showHintOnStartup) {
            if (this.verbose)
                console.log(Tridi.h(this.element), 'Generating hint on startup');
            var element_1 = this.element.substr(1);
            var hintOverlay = document.createElement('div');
            hintOverlay.classList.add('tridi-hint-overlay', "tridi-" + element_1 + "-hint-overlay");
            hintOverlay.tabIndex = 0;
            var hint = document.createElement('div');
            hint.classList.add('tridi-hint', "tridi-" + element_1 + "-hint");
            if (this.hintText)
                hint.innerHTML = "<span class=\"tridi-hint-text tridi-" + element_1 + "-hint-text\">" + this.hintText + "</span>";
            hintOverlay.appendChild(hint);
            this.viewer().appendChild(hintOverlay);
            var hintClickHandler_1 = function (e) {
                var isItHintOverlay = e.target.classList.contains("tridi-" + element_1 + "-hint-overlay");
                var isItHintText = e.target.classList.contains("tridi-" + element_1 + "-hint");
                if (isItHintOverlay || isItHintText) {
                    _this.getHintOverlay().style.display = 'none';
                    callback();
                }
            };
            document.addEventListener('click', hintClickHandler_1);
            if (this.touch)
                document.addEventListener('touchstart', hintClickHandler_1);
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
        var stash = this.stash();
        var images = this.imgs();
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
            console.log(Tridi.h(this.element), 'Generating first image');
        var element = this.element.substr(1);
        var viewer = this.viewer();
        var image = this.firstImage();
        viewer.innerHTML = "<img src=\"" + image + "\" alt=\"\" class=\"tridi-viewer-image tridi-viewer-" + element + "-image\" draggable=\"false\" />" + viewer.innerHTML;
    };
    Tridi.prototype.nextFrame = function () {
        var viewerImage = this.viewerImage();
        this.imageIndex = this.imageIndex <= 1
            ? this.imageCount
            : this.imageIndex - 1;
        viewerImage.src = this.image(this.imageIndex);
    };
    Tridi.prototype.prevFrame = function () {
        var viewerImage = this.viewerImage();
        this.imageIndex = this.imageIndex >= this.imageCount
            ? 1
            : this.imageIndex + 1;
        viewerImage.src = this.image(this.imageIndex);
    };
    Tridi.prototype.rotateViewerImage = function (e) {
        var _this = this;
        var touch = e.touches;
        var interval = (touch ? this.touchDragInterval : this.dragInterval);
        var eventX = e.touches
            ? e.touches[0].clientX
            : e.clientX;
        var coord = (eventX - this.viewerImage().offsetLeft);
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
        var nextMove = function () { return _this.inverse ? _this.prevFrame() : _this.nextFrame(); };
        var prevMove = function () { return _this.inverse ? _this.nextFrame() : _this.prevFrame(); };
        if (threshold) {
            if (newMove < oldMove) {
                nextMove();
            }
            else if (newMove > oldMove) {
                prevMove();
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
        var _this = this;
        if (this.verbose)
            console.log(Tridi.h(this.element), 'Attaching common events');
        var viewer = this.viewer();
        viewer.addEventListener('mouseenter', function () {
            if (_this.verbose)
                console.log(Tridi.h(_this.element), 'Mouseenter event triggered');
            viewer.classList.toggle('tridi-viewer-hovered', true);
        });
        viewer.addEventListener('mouseleave', function () {
            if (_this.verbose)
                console.log(Tridi.h(_this.element), 'Mouseleave event triggered');
            viewer.classList.toggle('tridi-viewer-hovered', false);
        });
    };
    Tridi.prototype.attachDragEvents = function () {
        var _this = this;
        if (this.draggable) {
            var viewerImage = this.viewerImage();
            if (this.verbose)
                console.log(Tridi.h(this.element), 'Attaching drag events');
            viewerImage.addEventListener('mouseup', function (e) {
                if (e.preventDefault)
                    e.preventDefault();
                if (_this.verbose)
                    console.log(Tridi.h(_this.element), 'Mouseup triggered');
                _this.stopDragging();
                _this.resetMoveBuffer();
            });
            viewerImage.addEventListener('mousedown', function (e) {
                if (e.preventDefault)
                    e.preventDefault();
                if (_this.verbose)
                    console.log(Tridi.h(_this.element), 'Mousedown triggered');
                _this.startDragging();
                _this.rotateViewerImage(e);
            });
            viewerImage.addEventListener('mousemove', function (e) {
                if (_this.dragActive) {
                    if (_this.verbose)
                        console.log(Tridi.h(_this.element), 'Mousemove triggered');
                    _this.rotateViewerImage(e);
                }
            });
            viewerImage.addEventListener('mouseleave', function () {
                if (_this.verbose)
                    console.log(Tridi.h(_this.element), 'Mouseleave triggered');
                _this.resetMoveBuffer();
            });
        }
    };
    Tridi.prototype.attachMouseLeaveDetection = function () {
        var _this = this;
        if (this.mouseleaveDetect) {
            if (this.verbose)
                console.log(Tridi.h(this.element), 'Attaching mouseleave detection');
            var viewer = this.viewer();
            viewer.addEventListener('mouseleave', function () {
                if (_this.verbose)
                    console.log(Tridi.h(_this.element), 'Viewer mouseleave triggered');
                _this.stopDragging();
                _this.resetMoveBuffer();
            });
        }
    };
    Tridi.prototype.attachTouchEvents = function () {
        var _this = this;
        if (this.touch) {
            if (this.verbose)
                console.log(Tridi.h(this.element), 'Attaching touch events');
            var viewerImage = this.viewerImage();
            viewerImage.addEventListener('touchstart', function (e) {
                if (e.preventDefault)
                    e.preventDefault();
                if (_this.verbose)
                    console.log(Tridi.h(_this.element), 'Touchstart triggered');
                _this.startDragging();
                _this.rotateViewerImage(e);
            });
            viewerImage.addEventListener('touchmove', function (e) {
                if (e.preventDefault)
                    e.preventDefault();
                if (_this.verbose)
                    console.log(Tridi.h(_this.element), 'Touchmove triggered');
                _this.rotateViewerImage(e);
            });
            viewerImage.addEventListener('touchend', function (e) {
                if (e.preventDefault)
                    e.preventDefault();
                if (_this.verbose)
                    console.log(Tridi.h(_this.element), 'Touchend triggered');
                _this.stopDragging();
                _this.resetMoveBuffer();
            });
        }
    };
    Tridi.prototype.attachMousewheelEvents = function () {
        var _this = this;
        if (this.mousewheel) {
            if (this.verbose)
                console.log(Tridi.h(this.element), 'Attaching mousewheel events');
            var viewerImage = this.viewerImage();
            var nextMove_1 = function () { return _this.wheelInverse ? _this.prevFrame() : _this.nextFrame(); };
            var prevMove_1 = function () { return _this.wheelInverse ? _this.nextFrame() : _this.prevFrame(); };
            viewerImage.addEventListener('wheel', function (e) {
                if (e.preventDefault)
                    e.preventDefault();
                (e.deltaY / 120 > 0) ? nextMove_1() : prevMove_1();
            });
        }
    };
    Tridi.prototype.generateButtons = function () {
        if (this.buttons) {
            if (!this.leftBtn() && !this.rightBtn()) {
                if (this.verbose)
                    console.log(Tridi.h(this.element), 'Generating buttons');
                var leftBtn = document.createElement('div');
                var rightBtn = document.createElement('div');
                leftBtn.className += 'tridi-btn tridi-btn-left';
                leftBtn.setAttribute('tabindex', '0');
                rightBtn.className += 'tridi-btn tridi-btn-right';
                rightBtn.setAttribute('tabindex', '0');
                this.viewer().appendChild(leftBtn);
                this.viewer().appendChild(rightBtn);
            }
        }
    };
    Tridi.prototype.attachButtonEvents = function () {
        var _this = this;
        if (this.buttons) {
            var leftBtn = this.leftBtn();
            var rightBtn = this.rightBtn();
            if (leftBtn) {
                if (this.verbose)
                    console.log(Tridi.h(this.element), 'Attaching left button click event');
                leftBtn.addEventListener('click', function () {
                    if (_this.verbose)
                        console.log(Tridi.h(_this.element), 'Left button click triggered');
                    _this.inverse ? _this.prevFrame() : _this.nextFrame();
                });
                leftBtn.addEventListener('keydown', function (e) {
                    if (e.which === 13) {
                        if (_this.verbose)
                            console.log(Tridi.h(_this.element), 'Left button Enter keydown triggered');
                        _this.inverse ? _this.prevFrame() : _this.nextFrame();
                    }
                });
            }
            if (rightBtn) {
                if (this.verbose)
                    console.log(Tridi.h(this.element), 'Attaching right button click event');
                rightBtn.addEventListener('click', function () {
                    if (_this.verbose)
                        console.log(Tridi.h(_this.element), 'Right button click triggered');
                    _this.inverse ? _this.nextFrame() : _this.prevFrame();
                });
                rightBtn.addEventListener('keydown', function (e) {
                    if (e.which === 13) {
                        if (_this.verbose)
                            console.log(Tridi.h(_this.element), 'Right button Enter keydown triggered');
                        _this.inverse ? _this.nextFrame() : _this.prevFrame();
                    }
                });
            }
        }
    };
    Tridi.prototype.toggleAutoplay = function (state, skipDelay) {
        var _this = this;
        var speed = this.autoplaySpeed;
        if (!state) {
            this.intervals.forEach(clearInterval);
            this.intervals.length = 0;
        }
        else {
            this.timeouts.forEach(clearTimeout);
            this.timeouts.length = 0;
            if (skipDelay) {
                var autoplayInterval = window.setInterval(function () {
                    _this.nextFrame();
                }, speed);
                this.intervals.push(autoplayInterval);
            }
            else {
                var autoplayTimeout = window.setTimeout(function () {
                    var autoplayInterval = window.setInterval(function () {
                        _this.nextFrame();
                    }, speed);
                    _this.intervals.push(autoplayInterval);
                }, this.resumeAutoplayDelay);
                this.timeouts.push(autoplayTimeout);
            }
        }
    };
    Tridi.prototype.startAutoplay = function () {
        var _this = this;
        if (this.autoplay) {
            if (this.verbose)
                console.log(Tridi.h(this.element), 'Starting autoplay');
            this.toggleAutoplay(true, true);
            if (this.stopAutoplayOnClick) {
                if (this.verbose)
                    console.log(Tridi.h(this.element), 'Enable stop autoplay on click event');
                this.viewerImage().addEventListener('mousedown', function () {
                    if (_this.verbose)
                        console.log(Tridi.h(_this.element), 'Stopping autoplay on mousedown');
                    _this.toggleAutoplay(false);
                });
            }
            if (this.stopAutoplayOnMouseenter) {
                if (this.verbose)
                    console.log(Tridi.h(this.element), 'Enable stop autoplay on hover event');
                this.viewerImage().addEventListener('mouseenter', function () {
                    if (_this.verbose)
                        console.log(Tridi.h(_this.element), 'Stopping autoplay on mouseenter');
                    _this.toggleAutoplay(false);
                });
            }
            if (this.resumeAutoplayOnMouseleave) {
                var viewerImage = this.viewerImage();
                viewerImage.addEventListener('mouseleave', function (e) {
                    if (_this.verbose)
                        console.log(Tridi.h(_this.element), 'Resuming autoplay on mouseleave');
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