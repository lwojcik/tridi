/*
  Tridi v0.0.8 - JavaScript 360 3D Product Viewer
  Author: Lukasz Wojcik
  License: MIT
  Homepage: https://tridi.lukem.net
  GitHub: http://github.com/lukemnet/tridi
*/

type ImageArray = ReadonlyArray<string>;
type NumberedImages = "numbered";
interface TridiOptions {
  [key: string]: any;
  element: string;
  images?: ImageArray | NumberedImages;
  format?: string;
  count?: number;
  location?: string;
  hintOnStartup?: boolean;
  lazy?: boolean;
  hintText?: string | null;
  draggable?: boolean;
  autoplay?: boolean;
  autoplaySpeed?: number;
  stopAutoplayOnClick?: boolean;
  stopAutoplayOnMouseenter?: boolean;
  resumeAutoplayOnMouseleave?: boolean;
  resumeAutoplayDelay?: number;
  buttons?: boolean;
  scroll?: boolean;
  passive?: boolean;
  spinner?: boolean;
  mousewheel?: boolean;
  wheelInverse?: boolean;
  dragInterval?: number;
  touchDragInterval?: number;
  mouseleaveDetect?: boolean;
  touch?: boolean;
  inverse?: boolean;
  playable?: boolean;
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
  element: string;
  images?: ImageArray | NumberedImages;
  format?: string;
  location?: string;
  count?: number;
  draggable?: boolean;
  hintOnStartup?: boolean;
  hintText?: string | null;
  lazy?: boolean;
  autoplay?: boolean;
  autoplaySpeed?: number;
  stopAutoplayOnClick?: boolean;
  stopAutoplayOnMouseenter?: boolean;
  resumeAutoplayOnMouseleave?: boolean;
  resumeAutoplayDelay: number;
  buttons?: boolean;
  scroll?: boolean;
  spinner?: boolean;
  dragInterval?: number;
  touchDragInterval?: number;
  mouseleaveDetect?: boolean;
  touch?: boolean;
  mousewheel?: boolean;
  wheelInverse?: boolean;
  inverse?: boolean;
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

  private updateOption(option: string, value: any) {
    this[option] = value;
  }

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
      this.updateOption(key, options[key]);
    });
  }

  private getElem(cssClass?: string, child?: boolean) {
    return <HTMLElement>(
      document.querySelector(
        `${this.element}${child ? " " : ""}${cssClass ? cssClass : ""}`
      )
    );
  }

  private container() {
    return this.getElem();
  }

  private viewer() {
    return this.getElem(".tridi-viewer")!;
  }

  private stash() {
    return this.getElem(".tridi-stash", true);
  }

  private leftBtn() {
    return this.getElem(".tridi-btn-left", true);
  }

  private rightBtn() {
    return this.getElem(".tridi-btn-right", true);
  }

  private getHintOverlay() {
    return this.getElem(".tridi-hint-overlay", true);
  }

  private getLoadingScreen() {
    return this.getElem(".tridi-loading", true);
  }

  private image(whichImage: number) {
    return this.imgs()![whichImage - 1];
  }

  private firstImage() {
    return this.image(1);
  }

  private viewerImage() {
    return <HTMLImageElement>this.getElem(".tridi-viewer .tridi-viewer-image");
  }

  private lazyLoad(callback: Function, skip?: Boolean) {
    if (this.lazy && !skip) {
      this.viewerImage().addEventListener("click", (callback as EventListener));
      if (this.touch) this.viewerImage().addEventListener("touchstart", (callback as EventListener), { passive: this.passive });
    } else {
      callback();
    }
  }

  private imgs() {
    if (this.images === "numbered") {
      return <ReadonlyArray<string>>(
        Array.apply(null, { length: this.count }).map(
          ({}, index: number) => `${this.location}/${index + 1}.${this.format!.toLowerCase()}`
        )
      );
    }

    if (Array.isArray(this.images)) return this.images as ReadonlyArray<string>;
    return null;
  }

  private generateViewer() {
    const container = this.container();
    if (container) {
      const element = this.element.substr(1);

      container.className +=
        " tridi-viewer" +
        ` tridi-${element}-viewer` +
        ` tridi-draggable-${this.draggable}` +
        ` tridi-touch-${this.touch}` +
        ` tridi-mousewheel-${this.mousewheel}` +
        ` tridi-hintOnStartup-${this.hintOnStartup}` +
        ` tridi-lazy-${this.lazy}` +
        ` tridi-buttons-${this.buttons}`;
    }
  }

  private generateLoadingScreen() {
    const loadingScreen = document.createElement("div");
    loadingScreen.className = "tridi-loading";
    loadingScreen.style.display = "none";

    const loadingSpinner = document.createElement("div");
    loadingSpinner.className = "tridi-spinner";
    loadingScreen.appendChild(loadingSpinner);

    this.viewer().appendChild(loadingScreen);
  }

  private setLoadingState(enable: boolean) {
    this.getLoadingScreen().style.display = enable ? "block" : "none";
  }

  private generateStash() {
    if (!this.stash()) {
      const stash = document.createElement("div");
      stash.classList.add("tridi-stash");
      this.viewer().appendChild(stash);
    }
  }

  private destroyStash() {
    this.stash().parentNode!.removeChild(this.stash());
  }

  private displayHintOnStartup(callback: Function) {
    if (this.hintOnStartup) {
      const element = this.element.substr(1);
      const hintOverlayClassName = `tridi-${element}-hint-overlay`;
      const hintOverlay = document.createElement("div");
      hintOverlay.className += `tridi-hint-overlay ${hintOverlayClassName}`;
      hintOverlay.tabIndex = 0;

      const hintClassName = `tridi-${element}-hint`;
      const hint = document.createElement("div");
      hint.className += `tridi-hint ${hintClassName}`;

      if (this.hintText) {
        hint.innerHTML = `<span class="tridi-hint-text">${this.hintText}</span>`;
      }

      hintOverlay.appendChild(hint);

      this.viewer().appendChild(hintOverlay);

      const hintClickHandler = (e: Event) => {
        const isItHintOverlay = (e.target as HTMLElement).classList.contains(hintOverlayClassName);
        const isItHintText = (e.target as HTMLElement).classList.contains(hintClassName);

        if (isItHintOverlay || isItHintText) {
          this.getHintOverlay().style.display = "none";
          callback();
        }
      };

      document.addEventListener("click", hintClickHandler);
      if (this.touch) document.addEventListener("touchstart", hintClickHandler);

      document.addEventListener("keydown", e => {
        if (e.which === 13) hintClickHandler(e);
      });
    } else {
      callback();
    }
  }

  private populateStash() {
    const stash = this.stash();
    const images = this.imgs();

    if (stash && images) {
      images.forEach((image, index) => {
        stash.innerHTML += `<img src="${image}" class="tridi-image tridi-image-${index + 1}" alt="" />`;
      });
    }
  }

  private generateViewerImage() {
    const viewer = this.viewer();
    const image = this.firstImage();

    viewer.innerHTML = `<img src="${image}" alt="" class="tridi-viewer-image" draggable="false" />${
      viewer.innerHTML
    }`;
  }

  private updateViewerImage(whichImage?: number) {
    this.viewerImage().src = whichImage
      ? this.image(whichImage)
      : this.firstImage();
  }

  private nextFrame() {
    this.imageIndex = this.imageIndex <= 1
      ? this.count!
      : this.imageIndex - 1;

    this.viewerImage().src = this.image(this.imageIndex);
  }

  private prevFrame() {
    this.imageIndex = this.imageIndex >= this.count!
      ? 1
      : this.imageIndex + 1;

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
  }

  private stopDragging() {
    this.dragActive = false;
  }

  private resetMoveBuffer() {
    this.moveBuffer.length = 0;
  }

  private attachCosmeticEvents() {
    const viewer = this.viewer();
    const toggleViewer = () => viewer.classList.toggle("tridi-viewer-hovered");

    viewer.addEventListener("mouseenter", toggleViewer);
    viewer.addEventListener("mouseleave", toggleViewer);
  }

  private attachDragEvents() {
    if (this.draggable) {
      const viewerImage = this.viewerImage();

      viewerImage.addEventListener("mousedown", e => {
        if (e.preventDefault) e.preventDefault();
        this.startDragging();
        this.rotateViewerImage(e);
      });

      viewerImage.addEventListener("mouseup", e => {
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

      viewerImage.addEventListener("touchstart", e => {
        this.startDragging();
        this.rotateViewerImage(e);
      }, { passive: true });

      viewerImage.addEventListener("touchmove", e => {
        this.rotateViewerImage(e);
      }, { passive: true });

      viewerImage.addEventListener("touchend", () => {
        this.stopDragging();
        this.resetMoveBuffer();
      });
    }
  }

  private attachMousewheelEvents() {
    if (this.mousewheel) {
      this.viewerImage().addEventListener("wheel", e => {
        if (e.preventDefault && !this.passive) e.preventDefault();
        e.deltaY / 120 > 0 ? this.nextMove() : this.prevMove();
      }, { passive: this.passive });
    }
  }

  private generateButton(btnName: string) {
    const btn = document.createElement("div");
    btn.setAttribute("tabindex", "0");
    btn.className += `tridi-btn tridi-btn-${btnName}`;
    this.viewer().appendChild(btn);
  }

  private generateButtons() {
    if (this.buttons && !this.leftBtn() && !this.rightBtn()) {
      this.generateButton("left");
      this.generateButton("right");
    }
  }

  private attachBtnEvents(element: HTMLElement, callback: Function) {
    element.addEventListener("click", (callback as EventListener));

    element.addEventListener("keydown", e => {
      if (e.which === 13) callback();
    });
  }

  private attachButtonsEvents() {
    if (this.buttons) {
      if (this.leftBtn()) this.attachBtnEvents(this.leftBtn(), this.nextMove.bind(this));
      if (this.rightBtn()) this.attachBtnEvents(this.rightBtn(), this.prevMove.bind(this));
    }
  }

  private clearIntervals() {
    this.intervals.forEach(clearInterval);
    this.intervals.length = 0;
  }

  private setAutoplayInterval() {
    const autoplayInterval = window.setInterval(() => {
      this.nextMove();
    }, this.autoplaySpeed);
    this.intervals.push(autoplayInterval);
  }

  private clearTimeouts() {
    this.timeouts.forEach(clearTimeout);
    this.timeouts.length = 0;
  }

  private setAutoplayTimeout() {
    const autoplayTimeout = window.setTimeout(() => {
      this.setAutoplayInterval();
    }, this.resumeAutoplayDelay);
    this.timeouts.push(autoplayTimeout);
  }

  private toggleAutoplay(state: boolean, skipDelay?: boolean) {
    if (state) {
      this.clearTimeouts();

      if (this.intervals.length === 0) {
        skipDelay
          ? this.setAutoplayInterval()
          : this.setAutoplayTimeout();
      }
    } else {
      this.clearIntervals();
    }
  }

  private startAutoplay() {
    if (this.autoplay) {
      this.toggleAutoplay(true, true);

      if (this.stopAutoplayOnClick) {
        this.viewerImage().addEventListener("mousedown", () => {
          this.toggleAutoplay(false);
        });
      }

      if (this.stopAutoplayOnMouseenter) {
        this.viewerImage().addEventListener("mouseenter", () => {
          this.toggleAutoplay(false);
        });
      }

      if (this.resumeAutoplayOnMouseleave) {
        const viewerImage = this.viewerImage();

        viewerImage.addEventListener("mouseleave", e => {
          if (!(e.target as HTMLElement).classList.contains("tridi-btn")) {
            this.toggleAutoplay(true);
          }
        });
      }
    }
  }

  private attachEvents() {
    this.attachCosmeticEvents();
    this.attachDragEvents();
    this.attachMouseLeaveDetection();
    this.attachTouchEvents();
    this.attachMousewheelEvents();
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
        this.attachEvents();
        this.generateButtons();
        this.attachButtonsEvents();
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
      this.updateViewerImage(syncFrame ? this.imageIndex : 1);
      this.attachEvents();
      this.setLoadingState(false);
    }
  }

  load() {
    this.start();
  }
}

module.exports = Tridi;