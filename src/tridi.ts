/*
  Tridi v1.0.1 - JavaScript 360 3D Product Viewer
  Author: Lukasz Wojcik
  License: MIT
  Homepage: https://tridi.lukem.net
  GitHub: http://github.com/lukemnet/tridi
*/

type ImageArray = ReadonlyArray<string>;
type NumberedImages = "numbered";
interface TridiOptions {
  [key: string]: any;
  element: string | HTMLElement;
  images?: ImageArray | NumberedImages;
  format?: string;
  count?: number;
  location?: string;
  hintOnStartup?: boolean;
  lazy?: boolean;
  hintText?: string | null;
  focusOnHintClose?: boolean;
  draggable?: boolean;
  keys?: boolean;
  autoplay?: boolean;
  autoplaySpeed?: number;
  stopAutoplayOnClick?: boolean;
  stopAutoplayOnMouseenter?: boolean;
  resumeAutoplayOnMouseleave?: boolean;
  resumeAutoplayDelay?: number;
  passive?: boolean;
  spinner?: boolean;
  mousewheel?: boolean;
  dragInterval?: number;
  touchDragInterval?: number;
  mouseleaveDetect?: boolean;
  touch?: boolean;
  inverse?: boolean;
  playable?: boolean;
  // onViewerGenerated
  // onViewerImageGenerated
  // onHintOnStartup
  // onLoadingScreen
  // onImagesPreloaded
  // onEventsAttached
  // onAutoplayStarted
  // onLoad
  // onNextMove
  // onPrevMove
  // onDragStart
  // onDrag
  // onDragEnd
  // onUpdate
  // onMouseEnter
  // onMouseLeave
  // onTouchStart
  // onTouchEnd
}

interface TridiUpdatableOptions {
  [key: string]: any;
  images?: ImageArray | NumberedImages;
  format?: string;
  count?: number;
  location?: string;
}

class Tridi {
  [key: string]: any;
  element: string | HTMLElement;
  images?: ImageArray | NumberedImages;
  format?: string;
  location?: string;
  count?: number;
  draggable?: boolean;
  keys?: boolean;
  hintOnStartup?: boolean;
  hintText?: string | null;
  focusOnHintClose?: boolean;
  lazy?: boolean;
  autoplay?: boolean;
  autoplaySpeed?: number;
  stopAutoplayOnClick?: boolean;
  stopAutoplayOnMouseenter?: boolean;
  resumeAutoplayOnMouseleave?: boolean;
  resumeAutoplayDelay: number;
  spinner?: boolean;
  dragInterval?: number;
  touchDragInterval?: number;
  mouseleaveDetect?: boolean;
  touch?: boolean;
  mousewheel?: boolean;
  inverse?: boolean;
  private elementName: string;
  private stashedImgs: number;
  private imageIndex: number;
  private moveBuffer: number[];
  private dragActive: boolean;
  private intervals: number[];
  private timeouts: number[];

  constructor(options: TridiOptions) {
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
    this.elementName = this.setElementName();
    this.imageIndex = 1;
    this.moveBuffer = [];
    this.dragActive = false;
    this.intervals = [];
    this.timeouts = [];
    this.stashedImgs = 0;
  }

  private setElementName = () => {
    const el = this.element;
  
    if (typeof el === "string") return el.substr(1);
    if (el.getAttribute("id")) return el.getAttribute("id")!;
    if (el.getAttribute("class")) return el.getAttribute("class")!;

    return `unnamedTridi-${Math.floor(Math.random()*90000) + 10000}`;
  }

  // private triggerEvent = (eventName:string) => {
  //   if (this[eventName]) this[eventName]();
  // }

  private validate = (options: TridiOptions) => {
    if (!options.element) {
      console.error(
        `'element' property is missing or invalid. Container element must be specified.`
      );
    }

    if (
      typeof options.images === "undefined" &&
      typeof options.format === "undefined"
    ) {
      console.error(
        `'format' property is missing or invalid. Image format must be provided for 'numbered' property.`
      );
    }

    if (options.images === "numbered" && !options.location) {
      console.error(
        `'location' property is missing or invalid. Image location must be provided for 'numbered' property.`
      );
    }
  };

  private validateUpdate(options: TridiUpdatableOptions) {
    if (
      !options.images &&
      !options.format &&
      !options.count &&
      !options.location
    ) {
      console.error(
        `UpdatableOptions object doesn't contain options that can be updated.`
      );
      return false;
    }
    return true;
  }

  private updateOptions(options: TridiOptions | TridiUpdatableOptions) {
    Object.keys(options).forEach(key => {
      this[key] = options[key];
      if (options[key].constructor === Array) this.count = options[key].length;
    });
  }

  private getElem(cssClass?: string) {
    if (typeof this.element === "string") {
      return cssClass
        ? <HTMLElement>(
            document.querySelector(
              `${this.element} ${cssClass}`
            )
          )!
        : <HTMLElement>document.querySelector(this.element)!;
    }
    return this.element;
  }

  private viewer() {
    return this.getElem();
  }

  private stash() {
    return this.getElem(".tridi-stash");
  }

  private getHintOverlay() {
    return this.getElem(".tridi-hint-overlay");
  }

  private getLoadingScreen() {
    return this.getElem(".tridi-loading");
  }

  private image(whichImage: number) {
    return this.imgs()![whichImage - 1];
  }

  private viewerImage() {
    return <HTMLImageElement>this.getElem(".tridi-viewer-image");
  }

  private lazyLoad(callback: Function, skip?: Boolean) {
    if (this.lazy && !skip) {
      this.viewerImage().addEventListener("click", callback as EventListener);
      if (this.touch) {
        this.viewerImage().addEventListener(
          "touchstart",
          callback as EventListener,
          { passive: this.passive }
        );
      }
    } else {
      callback();
    }
  }

  private imgs() {
    if (this.images === "numbered") {
      return <ReadonlyArray<string>>(
        Array.apply(null, { length: this.count }).map(
          ({}, index: number) =>
            `${this.location}/${index + 1}.${this.format!.toLowerCase()}`
        )
      );
    }
    return this.images as ReadonlyArray<string>;
  }

  private generateViewer() {
    const viewer = this.viewer();
    if (viewer) {
      viewer.className +=
        " tridi-viewer" +
        ` tridi-${this.elementName}-viewer` +
        ` tridi-draggable-${this.draggable}` +
        ` tridi-touch-${this.touch}` +
        ` tridi-mousewheel-${this.mousewheel}` +
        ` tridi-hintOnStartup-${this.hintOnStartup}` +
        ` tridi-lazy-${this.lazy}`;
    }
  }

  private generateLoadingScreen() {
    const loadingScreen = document.createElement("div");
    loadingScreen.className += `tridi-loading tridi-${
      this.elementName
    }-loading`;
    loadingScreen.style.display = "none";

    const loadingSpinner = document.createElement("div");
    loadingSpinner.className += `tridi-spinner tridi-${
      this.elementName
    }-spinner`;
    loadingScreen.appendChild(loadingSpinner);
    this.viewer().appendChild(loadingScreen);
  }

  private setLoadingState(enable: boolean) {
    this.getLoadingScreen().style.display = enable ? "block" : "none";
  }

  private generateStash() {
    if (!this.stash()) {
      this.stashedImgs = 0;

      const stash = document.createElement("div");
      stash.style.display = "none";
      stash.classList.add("tridi-stash");
      this.viewer().appendChild(stash);
    }
  }

  private destroyStash() {
    this.stashedImgs = 0;
    this.stash().parentNode!.removeChild(this.stash());
  }

  private displayHintOnStartup(callback: Function) {
    if (this.hintOnStartup) {
      const hintOverlayClassName = `tridi-${this.elementName}-hint-overlay`;
      const hintOverlay = document.createElement("div");
      hintOverlay.className += `tridi-hint-overlay ${hintOverlayClassName}`;
      hintOverlay.tabIndex = 0;

      const hintClassName = `tridi-${this.elementName}-hint`;
      const hint = document.createElement("div");
      hint.className += `tridi-hint ${hintClassName}`;

      if (this.hintText) {
        hint.innerHTML = `<span class="tridi-hint-text tridi-${
          this.elementName
        }-hint-text">${this.hintText}</span>`;
      }

      hintOverlay.appendChild(hint);

      this.viewer().appendChild(hintOverlay);

      const hintClickHandler = (e: Event) => {
        const isItHintOverlay = (e.target as HTMLElement).classList.contains(
          hintOverlayClassName
        );
        const isItHint = (e.target as HTMLElement).classList.contains(
          hintClassName
        );

        if (isItHintOverlay || isItHint) {
          this.getHintOverlay().style.display = "none";
          callback();
          /* istanbul ignore next */
          if (this.focusOnHintClose) this.viewerImage().focus();
        }
      };

      document.addEventListener("click", hintClickHandler);
      if (this.touch) document.addEventListener("touchstart", hintClickHandler);

      document.addEventListener("keydown", e => {
        /* istanbul ignore next */
        if (e.key === "Enter") hintClickHandler(e);
      });
    } else {
      callback();
    }
  }

  private stashImage(
    stash: HTMLElement,
    imageSrc: string,
    index: number,
    callback: Function
  ) {
    const img = new Image();
    img.src = imageSrc;
    img.className += `tridi-image tridi-image-${index + 1}`;
    stash.innerHTML += img.outerHTML;
    img.onload = callback.bind(this);
  }

  private populateStash() {
    const stash = this.stash();
    const images = this.imgs();

    if (stash && images) {
      images.forEach((image, index) => {
        /* istanbul ignore next */
        this.stashImage(stash, image, index, () => {
          this.stashedImgs += 1;
          if (this.stashedImgs === images.length) this.setLoadingState(false);
        });
      });
    }
  }

  private generateViewerImage() {
    const viewer = this.viewer();
    const firstImage = this.image(1);
    const viewerImage = new Image();
    viewerImage.src = firstImage;
    viewerImage.className += `tridi-viewer-image tridi-${
      this.elementName
    }-viewer-image`;
    viewerImage.setAttribute("draggable", "false");
    viewerImage.setAttribute("alt", "");
    viewer.innerHTML = `${viewerImage.outerHTML}${viewer.innerHTML}`;
  }

  private updateViewerImage(whichImage: number) {
    this.viewerImage().src = this.image(whichImage);
  }

  private nextFrame() {
    this.imageIndex = this.imageIndex <= 1 ? this.count! : this.imageIndex - 1;

    this.viewerImage().src = this.image(this.imageIndex);
  }

  private prevFrame() {
    this.imageIndex = this.imageIndex >= this.count! ? 1 : this.imageIndex + 1;

    this.viewerImage().src = this.image(this.imageIndex);
  }

  private nextMove() {
    return this.inverse ? this.prevFrame() : this.nextFrame();
  }

  private prevMove() {
    return this.inverse ? this.nextFrame() : this.prevFrame();
  }

  private rotateViewerImage(e: MouseEvent | TouchEvent) {
    const touch = (e as TouchEvent).touches;
    const interval = (touch ? this.touchDragInterval : this.dragInterval)!;

    const eventX = (e as TouchEvent).touches
      ? (e as TouchEvent).touches[0].clientX
      : (e as MouseEvent).clientX;

    const coord = eventX - this.viewerImage().offsetLeft;

    if (this.moveBuffer.length < 2) {
      this.moveBuffer.push(coord);
    } else {
      const tmp = this.moveBuffer[1];
      this.moveBuffer[1] = coord;
      this.moveBuffer[0] = tmp;
    }

    const threshold = !(coord % interval);
    const oldMove = this.moveBuffer[0];
    const newMove = this.moveBuffer[1];

    if (threshold) {
      if (newMove < oldMove) {
        this.nextMove();
      } else if (newMove > oldMove) {
        this.prevMove();
      }
    }
  }

  private startDragging() {
    this.dragActive = true;
    this.viewer().classList.add("tridi-dragging");
  }

  private stopDragging() {
    this.dragActive = false;
    this.viewer().classList.remove("tridi-dragging");
  }

  private resetMoveBuffer() {
    this.moveBuffer.length = 0;
  }

  private attachCosmeticEvents() {
    const viewer = this.viewer();

    viewer.addEventListener("mouseenter", () =>
      viewer.classList.add("tridi-viewer-hovered")
    );
    viewer.addEventListener("mouseleave", () =>
      viewer.classList.remove("tridi-viewer-hovered")
    );
  }

  private attachDragEvents() {
    if (this.draggable) {
      const viewerImage = this.viewerImage();

      viewerImage.addEventListener("mousedown", e => {
        /* istanbul ignore next */
        if (e.preventDefault) e.preventDefault();
        this.startDragging();
        this.rotateViewerImage(e);
      });

      viewerImage.addEventListener("mouseup", e => {
        /* istanbul ignore next */
        if (e.preventDefault) e.preventDefault();
        this.stopDragging();
        this.resetMoveBuffer();
      });

      viewerImage.addEventListener("mousemove", e => {
        if (this.dragActive) this.rotateViewerImage(e);
      });

      viewerImage.addEventListener("mouseleave", () => {
        this.resetMoveBuffer();
      });
    }
  }

  private attachMouseLeaveDetection() {
    if (this.mouseleaveDetect) {
      this.viewer().addEventListener("mouseleave", () => {
        this.stopDragging();
        this.resetMoveBuffer();
      });
    }
  }

  private attachTouchEvents() {
    if (this.touch) {
      const viewerImage = this.viewerImage();

      viewerImage.addEventListener(
        "touchstart",
        e => {
          this.startDragging();
          this.rotateViewerImage(e);
        },
        { passive: true }
      );

      viewerImage.addEventListener(
        "touchmove",
        e => {
          this.rotateViewerImage(e);
        },
        { passive: true }
      );

      viewerImage.addEventListener("touchend", () => {
        this.stopDragging();
        this.resetMoveBuffer();
      });
    }
  }

  private attachMousewheelEvents() {
    if (this.mousewheel) {
      this.viewerImage().addEventListener(
        "wheel",
        e => {
          if (e.preventDefault && !this.passive) e.preventDefault();
          e.deltaY / 120 > 0 ? this.nextMove() : this.prevMove();
        },
        { passive: this.passive }
      );
    }
  }

  private attachKeyEvents() {
    if (this.keys) {
      this.viewerImage().setAttribute("tabindex", "0");
      this.viewerImage().addEventListener("keydown", e => {
        if (e.key === "ArrowLeft") this.prevMove();
        if (e.key === "ArrowRight") this.nextMove();
      });
    }
  }

  private clearIntervals() {
    this.intervals.forEach(clearInterval);
    this.intervals.length = 0;
  }

  private setAutoplayInterval() {
    const autoplayInterval = window.setInterval(
      this.nextMove.bind(this),
      this.autoplaySpeed
    );
    this.intervals.push(autoplayInterval);
  }

  private clearTimeouts() {
    this.timeouts.forEach(clearTimeout);
    this.timeouts.length = 0;
  }

  private setAutoplayTimeout() {
    const autoplayTimeout = window.setTimeout(
      this.setAutoplayInterval.bind(this),
      this.resumeAutoplayDelay
    );
    this.timeouts.push(autoplayTimeout);
  }

  private toggleAutoplay(state: boolean, skipDelay?: boolean) {
    if (state) {
      this.clearTimeouts();

      if (this.intervals.length === 0) {
        skipDelay ? this.setAutoplayInterval() : this.setAutoplayTimeout();
      }
    } else {
      this.clearIntervals();
    }
  }

  private stopAutoplaySequence() {
    this.clearTimeouts();
    this.toggleAutoplay(false);
  }

  private startAutoplay() {
    if (this.autoplay) {
      this.toggleAutoplay(true, true);

      if (this.stopAutoplayOnClick) {
        this.viewerImage().addEventListener(
          "mousedown",
          this.stopAutoplaySequence.bind(this)
        );
        if (this.touch) {
          this.viewerImage().addEventListener(
            "touchstart",
            this.stopAutoplaySequence.bind(this),
            { passive: this.passive }
          );
        }
      }

      if (this.stopAutoplayOnMouseenter) {
        this.viewerImage().addEventListener(
          "mouseenter",
          this.stopAutoplaySequence.bind(this)
        );
      }

      if (this.resumeAutoplayOnMouseleave) {
        const viewerImage = this.viewerImage();

        viewerImage.addEventListener("mouseleave", e => {
          if (!(e.target as HTMLElement).classList.contains("tridi-btn")) {
            this.toggleAutoplay(true);
          }
        });

        if (this.touch) {
          viewerImage.addEventListener("touchend", e => {
            if (!(e.target as HTMLElement).classList.contains("tridi-btn")) {
              this.toggleAutoplay(true);
            }
          });
        }
      }
    }
  }

  private attachEvents() {
    this.attachCosmeticEvents();
    this.attachDragEvents();
    this.attachMouseLeaveDetection();
    this.attachTouchEvents();
    this.attachMousewheelEvents();
    this.attachKeyEvents();
  }

  private start() {
    this.generateViewer();
    this.generateLoadingScreen();
    this.setLoadingState(true);
    this.generateViewerImage();
    this.setLoadingState(false);
    this.displayHintOnStartup(() => {
      this.lazyLoad(() => {
        this.setLoadingState(true);
        this.generateStash();
        this.populateStash();
        this.setLoadingState(true);
        this.attachEvents();
        this.startAutoplay();
        this.setLoadingState(false);
      });
    });
  }

  next() {
    this.nextMove();
  }

  prev() {
    this.prevMove();
  }

  autoplayStart() {
    this.toggleAutoplay(true);
  }

  autoplayStop() {
    this.toggleAutoplay(false);
  }

  update(options: TridiUpdatableOptions, syncFrame?: boolean) {
    if (this.validateUpdate(options)) {
      this.setLoadingState(true);
      this.updateOptions(options);
      this.destroyStash();
      this.generateStash();
      this.populateStash();
      this.setLoadingState(true);
      this.updateViewerImage(syncFrame ? this.imageIndex : 1);
      this.attachEvents();
      this.setLoadingState(false);
    }
  }

  load() {
    this.start();
  }
}

/* istanbul ignore next */
if (typeof module !== "undefined") module.exports = Tridi;
