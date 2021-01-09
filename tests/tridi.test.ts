import '@testing-library/jest-dom/extend-expect';
import * as Tridi from '../src/tridi';
import { Tridi as TridiClass, TridiOptions } from '../src/tridi';

// eslint-disable-next-line no-global-assign
console = <any>{
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
};

window = <any>{
  setInterval: jest.fn(),
  setTimeout: jest.fn(),
};

const map = <any>{};

jest.spyOn(window, 'addEventListener').mockImplementation((event, cb) => {
  map[event] = cb;
});

const setupTridi = (containerId: string, options: object) => {
  const tridiContainer = document.createElement('div');
  tridiContainer.id = containerId;
  document.body.appendChild(tridiContainer);
  return Tridi.create(options as TridiOptions);
};

describe('Tridi', () => {
  const containerId = 'tridi-test-container-1';
  const options = {
    element: `#${containerId}`,
    location: './images/1',
    format: 'jpg',
    count: 5,
  };

  const tridiInstance = setupTridi(containerId, options);

  it('should be defined', () => {
    expect(Tridi).toBeDefined();
  });

  it('should expose create() function', () => {
    expect(Tridi.create).toBeDefined();
  });

  it('create() should return new Tridi class instance', () => {
    expect(Tridi.create(options as TridiOptions)).toBeInstanceOf(TridiClass);
  });

  it('should expose load() method', () => {
    expect(tridiInstance.load).toBeInstanceOf(Function);
  });

  it('should expose update() method', () => {
    expect(tridiInstance.update).toBeInstanceOf(Function);
  });

  it('should expose next() method', () => {
    expect(tridiInstance.next).toBeInstanceOf(Function);
  });

  it('should expose prev() method', () => {
    expect(tridiInstance.prev).toBeInstanceOf(Function);
  });

  it('should expose autoplayStart() method', () => {
    expect(tridiInstance.autoplayStart).toBeInstanceOf(Function);
  });

  it('should expose autoplayStop() method', () => {
    expect(tridiInstance.autoplayStop).toBeInstanceOf(Function);
  });
});

describe('Tridi.load()', () => {
  const containerId = 'tridi-test-container-2';
  const options = {
    element: `#${containerId}`,
    location: './images/1',
    format: 'jpg',
    count: 5,
    lazy: false,
  };

  setupTridi(containerId, options).load();

  it('Viewer is generated', () => {
    const viewer = document.querySelector(`#${containerId}.tridi-viewer`);
    expect(viewer).toBeInTheDocument();
  });

  it('Viewer image is generated', () => {
    const viewerImage = document.querySelector(`#${containerId} .tridi-viewer-image`);
    expect(viewerImage).toBeInTheDocument();
  });

  it('Loading screen is generated', () => {
    const loadingScreen = document.querySelector(`#${containerId} .tridi-loading`);
    const spinner = document.querySelector(`#${containerId} .tridi-spinner`);

    expect(loadingScreen).toBeInTheDocument();
    expect(spinner).toBeInTheDocument();
  });

  it('Loading screen is hidden', () => {
    const loadingScreen = <HTMLDivElement>document.querySelector(`#${containerId} .tridi-loading`);
    expect(loadingScreen.style.display).toStrictEqual('none');
  });

  it('Stash is generated', () => {
    const stash = <HTMLDivElement>document.querySelector(`#${containerId} .tridi-stash`);
    expect(stash).toBeInTheDocument();
  });

  it('Stash is not visible', () => {
    const stash = <HTMLDivElement>document.querySelector(`#${containerId} .tridi-stash`);
    expect(stash.style.display).toBe('none');
  });

  it('Stash is populated', () => {
    const stash = <HTMLDivElement>document.querySelector(`#${containerId} .tridi-stash`);
    const stashedImages = stash.querySelectorAll('.tridi-image').length;
    expect(stashedImages).toStrictEqual(options.count);
  });

  it('Loading state is set to false after stash is populated', () => {
    const loadingScreen = <HTMLElement>document.querySelector(`#${containerId} .tridi-loading`);
    expect(loadingScreen.style.display).toStrictEqual('none');
  });
});

describe('Init options validation', () => {
  const containerId = 'tridi-test-container-3';

  const commonValidOptions = {
    element: `#${containerId}`,
    location: './images/1',
    format: 'jpg',
    count: 5,
  };

  it('should throw for missing \'element\' property', () => {
    const options = {
      location: './images/1',
      format: 'jpg',
      count: 5,
    };

    // eslint-disable-next-line jest/require-to-throw-message
    expect(() => setupTridi(containerId, options).load()).toThrow();
  });

  it('should accept HTML element with ID parapmeter as element property', () => {
    const customTridiElement = document.createElement('div');
    customTridiElement.id = containerId;

    const options = {
      element: document.querySelector(`#${containerId}`),
      location: './images/1',
      format: 'jpg',
      count: 5,
    };

    expect(() => setupTridi(containerId, options).load()).not.toThrow();
  });

  it('should accept HTML element with class property as element property', () => {
    const customTridiElement = document.createElement('div');
    customTridiElement.classList.add(`css-class-${containerId}`);
    document.body.appendChild(customTridiElement);

    const options = {
      element: document.querySelector(`.css-class-${containerId}`),
      location: './images/1',
      format: 'jpg',
      count: 5,
    };

    console.log(document.querySelector(`.css-class-${containerId}`));

    expect(() => setupTridi(containerId, options).load()).not.toThrow();
  });

  it('should accept HTML element with no id or class property as element property', () => {
    const customTridiElement = document.createElement('div');

    const options = {
      element: customTridiElement,
      location: './images/1',
      format: 'jpg',
      count: 5,
    };

    expect(() => setupTridi(containerId, options).load()).not.toThrow();
  });

  it('should throw when \'images\' and \'format\' properties are missing', () => {
    const options = {
      element: `#${containerId}`,
      count: 5,
    };

    // eslint-disable-next-line jest/require-to-throw-message
    expect(() => setupTridi(containerId, options).load()).toThrow();
  });

  it('should call console.error when \'numbered\' and \'location\' is missing', () => {
    const options = {
      element: `#${containerId}`,
      images: 'numbered',
    };

    setupTridi(containerId, options).load();

    // eslint-disable-next-line jest/prefer-called-with
    expect(console.error).toHaveBeenCalled();
  });

  it('should accept array of strings as image source', () => {
    const imgArray = [
      './images/1/1.jpg',
      './images/1/2.jpg',
      './images/1/3.jpg',
    ];

    const options = {
      element: `#${containerId}`,
      images: imgArray,
    };

    expect(() => setupTridi(containerId, options).load()).not.toThrow();
  });

  it('should accept \'draggable\' option', () => {
    const options = {
      ...commonValidOptions,
      draggable: true,
    };

    expect(() => setupTridi(containerId, options).load()).not.toThrow();
  });

  it('should accept \'touchDragInterval\' option', () => {
    const options = {
      ...commonValidOptions,
      touchDragInterval: true,
    };

    expect(() => setupTridi(containerId, options).load()).not.toThrow();
  });

  it('should accept \'autoplaySpeed\' option', () => {
    const options = {
      ...commonValidOptions,
      autoplaySpeed: 2,
    };

    expect(() => setupTridi(containerId, options).load()).not.toThrow();
  });

  it('should accept \'passive\' option', () => {
    const options = {
      ...commonValidOptions,
      passive: true,
    };

    expect(() => setupTridi(containerId, options).load()).not.toThrow();
  });

  it('should accept \'touch\' option', () => {
    const options = {
      ...commonValidOptions,
      touch: true,
    };

    expect(() => setupTridi(containerId, options).load()).not.toThrow();
  });

  it('should accept \'mouseleaveDetect\' option', () => {
    const options = {
      ...commonValidOptions,
      mouseleaveDetect: true,
    };

    expect(() => setupTridi(containerId, options).load()).not.toThrow();
  });

  it('should accept \'autoplay\' option', () => {
    const options = {
      ...commonValidOptions,
      autoplay: true,
    };

    expect(() => setupTridi(containerId, options).load()).not.toThrow();
  });

  it('should accept \'stopAutoplayOnMouseenter\' option', () => {
    const options = {
      ...commonValidOptions,
      autoplay: true,
      stopAutoplayOnMouseenter: true,
    };

    expect(() => setupTridi(containerId, options).load()).not.toThrow();
  });

  it('should accept \'resumeAutoPlayOnMouseleave\' option', () => {
    const options = {
      ...commonValidOptions,
      autoplay: true,
      resumeAutoPlayOnMouseleave: true,
    };

    expect(() => setupTridi(containerId, options).load()).not.toThrow();
  });

  it('should accept \'inverse\' option', () => {
    const options = {
      ...commonValidOptions,
      inverse: true,
    };

    expect(() => setupTridi(containerId, options).load()).not.toThrow();
  });

  it('should accept \'skip\' option', () => {
    const options = {
      ...commonValidOptions,
      lazy: true,
      skip: false,
    };

    expect(() => setupTridi(containerId, options).load()).not.toThrow();
  });

  it('should accept \'hintOnStartup\' option', () => {
    const options = {
      ...commonValidOptions,
      lazy: true,
      hintOnStartup: true,
    };

    expect(() => setupTridi(containerId, options).load()).not.toThrow();
  });

  it('should accept \'hintText\' option', () => {
    const options = {
      ...commonValidOptions,
      lazy: true,
      hintOnStartup: true,
      hintText: 'test',
    };

    expect(() => setupTridi(containerId, options).load()).not.toThrow();
  });
});

describe('Behavior', () => {
  const containerId = 'tridi-test-container-4';

  const options = {
    element: `#${containerId}`,
    location: './images/1',
    format: 'jpg',
    inverse: true,
    count: 5,
  };

  const tridiInstance = setupTridi(containerId, options);
  tridiInstance.load();

  it('prev() should not throw if \'inverse\' option set to true', () => {
    expect(() => tridiInstance.prev()).not.toThrow();
  });

  it('next() should not throw if \'inverse\' option set to true', () => {
    expect(() => tridiInstance.next()).not.toThrow();
  });

  it('autoplayStart() should not throw', () => {
    expect(() => tridiInstance.autoplayStart()).not.toThrow();
  });

  it('autoplayStop() should not throw', () => {
    expect(() => tridiInstance.autoplayStop()).not.toThrow();
  });

  it('viewer image should be cycled back to first frame when hitting array limit', () => {
    const viewerImage = <HTMLImageElement>document.querySelector(`#${containerId} .tridi-viewer-image`)!;
    const oldSrc = viewerImage.src;
    tridiInstance.prev();
    tridiInstance.next();
    const newSrc = viewerImage.src;

    expect(oldSrc).toMatch(newSrc);
  });
});

describe('Update', () => {
  const containerId = 'tridi-test-container-5';

  const options = {
    element: `#${containerId}`,
    format: 'jpg',
    count: 5,
  };

  const oldOptions = {
    ...options,
    location: './images/1',
  };

  const newOptions = {
    ...options,
    location: './images/2',
  };

  const tridiInstance = setupTridi(containerId, oldOptions);
  tridiInstance.load();

  it('should not throw', () => {
    expect(() => tridiInstance.update(newOptions)).not.toThrow();
  });

  it('should accept \'syncFrame\' parameter to true', () => {
    expect(() => tridiInstance.update(newOptions, true)).not.toThrow();
  });

  it('should accept \'syncFrame\' parameter set to false', () => {
    expect(() => tridiInstance.update(newOptions, false)).not.toThrow();
  });

  it('should return false for missing updatable options', () => {
    const emptyOptionsObject = {};
    expect(() => tridiInstance.update(emptyOptionsObject)).not.toThrow();
  });

  it('should update image count if image array is passed as image source', () => {
    const newImageArray = ['./images/1.jpg', './images/2.jpg', './images/3.jpg'];
    const updatedOptions = {
      images: newImageArray,
    };
    expect(() => tridiInstance.update(updatedOptions)).not.toThrow();
  });
});

describe('Event listeners', () => {
  const containerId = 'tridi-test-container-6';

  const options = {
    element: `#${containerId}`,
    format: 'jpg',
    count: 5,
  };

  it('should listen for \'wheel\' events', () => {
    setupTridi(containerId, {
      ...options,
      mousewheel: true,
    }).load();

    const viewerImage = document.querySelector(`#${containerId} .tridi-viewer-image`)!;
    expect(() => viewerImage.dispatchEvent(new WheelEvent('wheel', { deltaY: 100 }))).not.toThrow();
    expect(() => viewerImage.dispatchEvent(new WheelEvent('wheel', { deltaY: -100 }))).not.toThrow();
  });

  it('should listen for \'keydown\' events', () => {
    setupTridi(containerId, {
      ...options,
      keys: true,
    }).load();

    const viewerImage = document.querySelector(`#${containerId} .tridi-viewer-image`)!;
    expect(() => viewerImage.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))).not.toThrow();
    expect(() => viewerImage.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))).not.toThrow();
  });

  it('should listen for \'wheel\' events with \'passive\' option set to false', () => {
    setupTridi(containerId, {
      ...options,
      mousewheel: true,
      passive: false,
    }).load();

    const viewerImage = document.querySelector(`#${containerId} .tridi-viewer-image`)!;
    expect(() => viewerImage.dispatchEvent(new WheelEvent('wheel', { deltaY: 100 }))).not.toThrow();
    expect(() => viewerImage.dispatchEvent(new WheelEvent('wheel', { deltaY: -100 }))).not.toThrow();
  });

  it('should not react to touch events when \'touch\' option is set to false', () => {
    setupTridi(containerId, {
      ...options,
      draggable: true,
      touch: false,
      lazy: true,
      skip: false,
    }).load();

    const viewerImage = document.querySelector(`#${containerId} .tridi-viewer-image`)!;

    expect(() =>
      viewerImage.dispatchEvent(
        new TouchEvent(
          'touchstart',
          {
            touches: [
              { clientX: 100 } as Touch,
            ],
          },
        ),
      )).not.toThrow();
  });

  it('should add \'tridi-viewer-hovered\' class on \'mouseenter\' event on viewer', () => {
    setupTridi(containerId, {
      ...options,
    }).load();

    const viewer = document.querySelector(`#${containerId}`)!;
    viewer.dispatchEvent(new MouseEvent('mouseenter'));
    expect(viewer).toHaveClass('tridi-viewer-hovered');
  });

  it('should listen for \'mouseenter\' events with \'stopAutoplayOnMouseenter\' option set to true', () => {
    setupTridi(containerId, {
      ...options,
      autoplay: true,
      stopAutoplayOnMouseenter: true,
    }).load();

    const viewerImage = document.querySelector(`#${containerId} .tridi-viewer-image`)!;
    expect(() => viewerImage.dispatchEvent(new MouseEvent('mouseenter'))).not.toThrow();
  });

  it('should listen for \'touchstart\' events with \'stopAutoplayOnMouseenter\' option set to true', () => {
    setupTridi(containerId, {
      ...options,
      autoplay: true,
      stopAutoplayOnMouseenter: true,
    }).load();

    const viewerImage = document.querySelector(`#${containerId} .tridi-viewer-image`)!;
    expect(() =>
      viewerImage.dispatchEvent(
        new TouchEvent(
          'touchstart',
          {
            touches: [
              { clientX: 100 } as Touch,
            ],
          },
        ),
      )).not.toThrow();
  });

  it('should do nothing with \'touchstart\' events with \'stopAutoplayOnClick\' set to true and \'touch\' set to false', () => {
    setupTridi(containerId, {
      ...options,
      autoplay: true,
      touch: false,
      stopAutoplayOnClick: true,
    }).load();

    const viewerImage = document.querySelector(`#${containerId} .tridi-viewer-image`)!;
    expect(() => viewerImage.dispatchEvent(
      new TouchEvent(
        'touchstart',
        {
          touches: [
            { clientX: 100 } as Touch,
          ],
        },
      ),
    )).not.toThrow();
  });

  it('should listen for \'mousedown\' events with \'stopAutoplayOnClick\' option set to true', () => {
    setupTridi(containerId, {
      ...options,
      autoplay: true,
      stopAutoplayOnClick: true,
    }).load();

    const viewerImage = document.querySelector(`#${containerId} .tridi-viewer-image`)!;
    expect(() => viewerImage.dispatchEvent(new MouseEvent('mousedown'))).not.toThrow();
  });

  it('should listen for \'mouseleave\' events with \'resumeAutoplayOnMouseleave\' option set to true', () => {
    setupTridi(containerId, {
      ...options,
      autoplay: true,
      resumeAutoplayOnMouseleave: true,
    }).load();

    const viewerImage = document.querySelector(`#${containerId} .tridi-viewer-image`)!;
    expect(() => viewerImage.dispatchEvent(new MouseEvent('mouseleave'))).not.toThrow();
  });

  it('should listen for \'touchend\' events with \'resumeAutoplayOnMouseleave\' option set to true', () => {
    setupTridi(containerId, {
      ...options,
      autoplay: true,
      resumeAutoplayOnMouseleave: true,
    }).load();

    const viewerImage = document.querySelector(`#${containerId} .tridi-viewer-image`)!;
    expect(() => viewerImage.dispatchEvent(new TouchEvent('touchend'))).not.toThrow();
  });

  it('should not listen for \'touchend\' events with \'touch\' option set to false', () => {
    setupTridi(containerId, {
      ...options,
      autoplay: true,
      touch: false,
      resumeAutoplayOnMouseleave: true,
    }).load();

    const viewerImage = document.querySelector(`#${containerId} .tridi-viewer-image`)!;
    expect(() => viewerImage.dispatchEvent(new TouchEvent('touchend'))).not.toThrow();
  });

  it('should handle mouse drag events correctly', () => {
    setupTridi(containerId, {
      ...options,
      draggable: true,
    }).load();

    const viewerImage = document.querySelector(`#${containerId} .tridi-viewer-image`)!;
    expect(() => {
      viewerImage.dispatchEvent(new MouseEvent('mousedown'));
      viewerImage.dispatchEvent(new MouseEvent('mousemove', { clientX: 100 }));
      viewerImage.dispatchEvent(new MouseEvent('mousemove', { clientX: -100 }));
      viewerImage.dispatchEvent(new MouseEvent('mouseup'));
      viewerImage.dispatchEvent(new MouseEvent('mouseleave'));
    }).not.toThrow();
  });

  it('should do nothing when drag event was not initiated', () => {
    setupTridi(containerId, {
      ...options,
      draggable: true,
    }).load();

    const viewerImage = document.querySelector(`#${containerId} .tridi-viewer-image`)!;
    expect(() => {
      viewerImage.dispatchEvent(new MouseEvent('mousemove', { clientX: 100 }));
    }).not.toThrow();
  });

  it('should do nothing when draggable is to to false', () => {
    setupTridi(containerId, {
      ...options,
      draggable: false,
    }).load();

    const viewerImage = document.querySelector(`#${containerId} .tridi-viewer-image`)!;
    expect(() => {
      viewerImage.dispatchEvent(new MouseEvent('mousemove', { clientX: 100 }));
    }).not.toThrow();
  });

  it('should handle \'mouseleave\' event correctly when \'mouseleaveDetect\' option is set to true', () => {
    setupTridi(containerId, {
      ...options,
      draggable: true,
      mouseleaveDetect: true,
    }).load();

    const viewer = document.querySelector(`#${containerId}`)!;
    expect(() => {
      viewer.dispatchEvent(new MouseEvent('mouseleave'));
    }).not.toThrow();
  });

  it('should handle touch drag events correctly', () => {
    setupTridi(containerId, {
      ...options,
      draggable: true,
      touch: true,
    }).load();

    const viewerImage = document.querySelector(`#${containerId} .tridi-viewer-image`)!;

    expect(() => {
      viewerImage.dispatchEvent(
        new TouchEvent(
          'touchstart',
          {
            touches: [
              { clientX: 100 } as Touch,
            ],
          },
        ),
      );

      viewerImage.dispatchEvent(
        new TouchEvent(
          'touchmove',
          {
            touches: [
              { clientX: -100 } as Touch,
            ],
          },
        ),
      );

      viewerImage.dispatchEvent(
        new TouchEvent(
          'touchmove',
          {
            touches: [
              { clientX: 100 } as Touch,
            ],
          },
        ),
      );

      viewerImage.dispatchEvent(new TouchEvent('touchend'));
    }).not.toThrow();
  });

  it('should listen for click events on hint overlay', () => {
    setupTridi(containerId, {
      ...options,
      draggable: true,
      touch: true,
      hintOnStartup: true,
    }).load();

    const hintOverlay = document.querySelector(`#${containerId} .tridi-hint-overlay`)!;

    expect(() => (hintOverlay as HTMLElement).click()).not.toThrow();
  });

  it('should listen for Enter keypresses on hint overlay', () => {
    setupTridi(containerId, {
      ...options,
      draggable: true,
      touch: true,
      hintOnStartup: true,
      hintText: 'test',
    }).load();

    expect(() => {
      document.dispatchEvent(new Event('keydown', {
        key: 'Enter',
        which: 13,
      } as KeyboardEventInit));
    }).not.toThrow();
  });

  it('should ignore touch events on hint overlay when \'touch\' option is set to false', () => {
    setupTridi(containerId, {
      ...options,
      draggable: true,
      touch: false,
      hintOnStartup: true,
      hintText: 'test',
    }).load();

    const hintOverlay = document.querySelector(`#${containerId} .tridi-hint-overlay`)!;

    expect(() => hintOverlay.dispatchEvent(
      new TouchEvent(
        'touchstart',
        {
          touches: [
            { clientX: 100 } as Touch,
          ],
        },
      ),
    )).not.toThrow();
  });
});

describe('Custom events', () => {
  const containerId = 'tridi-test-container-7';

  const options = {
    element: `#${containerId}`,
    format: 'jpg',
    count: 5,
  };

  it('should accept \'onViewerGenerate\' event callback', () => {
    const tridi = setupTridi(containerId, {
      ...options,
      onViewerGenerate: () => false,
    });

    expect(() => tridi.load()).not.toThrow();
  });

  it('should accept \'onViewerImageGenerate\' event callback', () => {
    const tridi = setupTridi(containerId, {
      ...options,
      onViewerImageGenerate: () => 0,
    });

    expect(() => tridi.load()).not.toThrow();
  });

  it('should accept \'onViewerImageUpdate\' event callback', () => {
    const tridi = setupTridi(containerId, {
      ...options,
      onViewerImageUpdate: () => 0,
    });

    tridi.load();

    expect(() => tridi.update(options)).not.toThrow();
  });

  it('should accept \'onImagesPreload\' event callback', () => {
    const tridi = setupTridi(containerId, {
      ...options,
      onImagesPreload: () => false,
    });

    expect(() => tridi.load()).not.toThrow();
  });

  it('should accept \'onHintShow\' event callback', () => {
    const tridi = setupTridi(containerId, {
      ...options,
      onHintShow: () => false,
    });

    expect(() => tridi.load()).not.toThrow();
  });

  it('should accept \'onHintHide\' event callback', () => {
    const tridi = setupTridi(containerId, {
      ...options,
      onHintHide: () => false,
    });

    expect(() => tridi.load()).not.toThrow();
  });

  it('should accept \'onLoadingScreenShow\' event callback', () => {
    const tridi = setupTridi(containerId, {
      ...options,
      onLoadingScreenShow: () => false,
    });

    expect(() => tridi.load()).not.toThrow();
  });

  it('should accept \'onLoadingScreenHide\' event callback', () => {
    const tridi = setupTridi(containerId, {
      ...options,
      onLoadingScreenHide: () => false,
    });

    expect(() => tridi.load()).not.toThrow();
  });

  it('should accept \'onNextMove\' event callback', () => {
    const tridi = setupTridi(containerId, {
      ...options,
      onNextMove: () => false,
    });

    expect(() => tridi.load()).not.toThrow();
  });

  it('should accept \'onPrevMove\' event callback', () => {
    const tridi = setupTridi(containerId, {
      ...options,
      onPrevMove: () => false,
    });

    expect(() => tridi.load()).not.toThrow();
  });

  it('should accept \'onNextFrame\' event callback', () => {
    const tridi = setupTridi(containerId, {
      ...options,
      onNextFrame: () => false,
    });

    expect(() => tridi.load()).not.toThrow();
  });

  it('should accept \'onPrevFrame\' event callback', () => {
    const tridi = setupTridi(containerId, {
      ...options,
      onPrevFrame: () => false,
    });

    expect(() => tridi.load()).not.toThrow();
  });

  it('should accept \'onLoad\' event callback', () => {
    const tridi = setupTridi(containerId, {
      ...options,
      onLoad: () => false,
    });

    expect(() => tridi.load()).not.toThrow();
  });

  it('should accept \'onUpdate\' event callback', () => {
    const tridi = setupTridi(containerId, {
      ...options,
      onUpdate: () => false,
    });

    expect(() => tridi.load()).not.toThrow();
  });

  it('should accept \'onDragStart\' event callback', () => {
    const tridi = setupTridi(containerId, {
      ...options,
      onDragStart: () => false,
    });

    expect(() => tridi.load()).not.toThrow();
  });

  it('should accept \'onDragEnd\' event callback', () => {
    const tridi = setupTridi(containerId, {
      ...options,
      onDragEnd: () => false,
    });

    expect(() => tridi.load()).not.toThrow();
  });
});
