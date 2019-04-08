import 'jest-dom/extend-expect';
const tridi = require('../src/tridi');

console = <any>{
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn()
}

window = <any>{
  setInterval: jest.fn(),
  setTimeout: jest.fn(),
};

const map = <any>{};

window.addEventListener = jest.fn((event, cb) => {
  map[event] = cb;
});

beforeEach(() => {
  jest.clearAllMocks();
});

const setupTridi = (containerId: string, options: object) => {
  const tridiContainer = document.createElement('div');
  tridiContainer.id = containerId;
  document.body.appendChild(tridiContainer);
  return new tridi(options);
}

describe('Tridi class', () => {  
  const containerId = 'tridi-test-container-1';
  const options = {
      element: `#${containerId}`,
      location: './images/1',
      format: 'jpg',
      count: 5
  };

  const tridiInstance = setupTridi(containerId, options);

  test('should be defined', () => {
    expect(tridi).toBeDefined();
  });

  test('should be instantiable', () => {
    expect(tridiInstance).toBeInstanceOf(tridi);
  })

  test('should expose load() method', () => {
    expect(tridiInstance.load).toBeInstanceOf(Function);
  });

  test('should expose update() method', () => {
    expect(tridiInstance.update).toBeInstanceOf(Function);
  });

  test('should expose next() method', () => {
    expect(tridiInstance.next).toBeInstanceOf(Function);
  });

  test('should expose prev() method', () => {
    expect(tridiInstance.prev).toBeInstanceOf(Function);
  });

  test('should expose autoplayStart() method', () => {
    expect(tridiInstance.autoplayStart).toBeInstanceOf(Function);
  });

  test('should expose autoplayStop() method', () => {
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

  test('Viewer is generated', () => {
    const viewer = document.querySelector(`#${containerId}.tridi-viewer`);
    expect(viewer).toBeInTheDocument();
  });

  test('Viewer image is generated', () => {
    const viewerImage = document.querySelector(`#${containerId} .tridi-viewer-image`);
    expect(viewerImage).toBeInTheDocument();
  });

  test('Loading screen is generated', () => {
    const loadingScreen = document.querySelector(`#${containerId} .tridi-loading`);
    const spinner = document.querySelector(`#${containerId} .tridi-spinner`);
    
    expect(loadingScreen).toBeInTheDocument();
    expect(spinner).toBeInTheDocument();
  });

  test('Loading screen is hidden', () => {
    const loadingScreen = <HTMLDivElement>document.querySelector(`#${containerId} .tridi-loading`);
    expect(loadingScreen.style.display).toEqual('none');
  });

  test('Stash is generated', () => {
    const stash = <HTMLDivElement>document.querySelector(`#${containerId} .tridi-stash`);
    expect(stash).toBeInTheDocument();
  });

  test('Stash is not visible', () => {
    const stash = <HTMLDivElement>document.querySelector(`#${containerId} .tridi-stash`);
    expect(stash.style.display).toBe('none');
  });

  test('Stash is populated', () => {
    const stash = <HTMLDivElement>document.querySelector(`#${containerId} .tridi-stash`);
    const stashedImages = stash.querySelectorAll('.tridi-image').length; 
    expect(stashedImages).toEqual(options.count);
  });

  test('Loading state is set to false after stash is populated', () => {
    // const stash = <HTMLDivElement>document.querySelector(`#${containerId} .tridi-stash`);
    // const stashedImages = stash.querySelectorAll('.tridi-image').length; 
    const loadingScreen = <HTMLElement>document.querySelector(`#${containerId} .tridi-loading`);
    

    expect(loadingScreen.style.display).toEqual('none');
  });
});

describe('Init options validation', () => {
  const containerId = 'tridi-test-container-3';

  const commonValidOptions = {
    element: `#${containerId}`,
    location: './images/1',
    format: 'jpg',
    count: 5,
  }

  test(`should throw for missing 'element' property`, () => {
    const options = {
      location: './images/1',
      format: 'jpg',
      count: 5,
    };
  
    expect(() => setupTridi(containerId, options).load()).toThrow();
  });

  test(`should throw when 'images' and 'format' properties are missing`, () => {
    const options = {
      element: `#${containerId}`,
      count: 5
    };

    expect(() => setupTridi(containerId, options).load()).toThrow();
  });

  test(`should call console.error when 'numbered' and 'location' is missing`, () => {
    const options = {
      element: `#${containerId}`,
      images: 'numbered'
    };

    setupTridi(containerId, options).load();

    expect(console.error).toHaveBeenCalled();
  });

  test(`should accept array of strings as image source`, () => {
    const imgArray = [
      './images/1/1.jpg',
      './images/1/2.jpg',
      './images/1/3.jpg'
    ];

    const options = {
      element: `#${containerId}`,
      images: imgArray
    };

    expect(() => setupTridi(containerId, options).load()).not.toThrow();
  });

  test(`should accept 'draggable' option`, () => {
    const options = {
      ...commonValidOptions,
      draggable: true
    };

    expect(() => setupTridi(containerId, options).load()).not.toThrow();
  });

  test(`should accept 'touchDragInterval' option`, () => {
    const options = {
      ...commonValidOptions,
      touchDragInterval: true
    };

    expect(() => setupTridi(containerId, options).load()).not.toThrow();
  });

  test(`should accept 'autoplaySpeed' option`, () => {
    const options = {
      ...commonValidOptions,
      autoplaySpeed: 2,
    };

    expect(() => setupTridi(containerId, options).load()).not.toThrow();
  });

  test(`should accept 'passive' option`, () => {
    const options = {
      ...commonValidOptions,
      passive: true,
    };

    expect(() => setupTridi(containerId, options).load()).not.toThrow();
  });

  test(`should accept 'touch' option`, () => {
    const options = {
      ...commonValidOptions,
      touch: true,
    };

    expect(() => setupTridi(containerId, options).load()).not.toThrow();
  });

  test(`should accept 'mouseleaveDetect' option`, () => {
    const options = {
      ...commonValidOptions,
      mouseleaveDetect: true,
    };

    expect(() => setupTridi(containerId, options).load()).not.toThrow();
  });

  test(`should accept 'autoplay' option`, () => {
    const options = {
      ...commonValidOptions,
      autoplay: true,
      stopAutoplayOnClick: true,
      stopAutoplayOnMouseenter: true,
      resumeAutoPlayOnMouseleave: true,
    };

    expect(() => setupTridi(containerId, options).load()).not.toThrow();
  });

  test(`should accept 'autoplay' option`, () => {
    const options = {
      ...commonValidOptions,
      autoplay: true,
    };

    expect(() => setupTridi(containerId, options).load()).not.toThrow();
  });

  test(`should accept 'stopAutoplayOnMouseenter' option`, () => {
    const options = {
      ...commonValidOptions,
      autoplay: true,
      stopAutoplayOnMouseenter: true,
    };

    expect(() => setupTridi(containerId, options).load()).not.toThrow();
  });

  test(`should accept 'resumeAutoPlayOnMouseleave' option`, () => {
    const options = {
      ...commonValidOptions,
      autoplay: true,
      resumeAutoPlayOnMouseleave: true,
    };

    expect(() => setupTridi(containerId, options).load()).not.toThrow();
  });

  test(`should accept 'inverse' option`, () => {
    const options = {
      ...commonValidOptions,
      inverse: true,
    };

    expect(() => setupTridi(containerId, options).load()).not.toThrow();
  });

  test(`should accept 'skip' option`, () => {
    const options = {
      ...commonValidOptions,
      lazy: true,
      skip: false,
    };

    expect(() => setupTridi(containerId, options).load()).not.toThrow();
  });

  test(`should accept 'hintOnStartup' option`, () => {
    const options = {
      ...commonValidOptions,
      lazy: true,
      hintOnStartup: true,
    };

    expect(() => setupTridi(containerId, options).load()).not.toThrow();
  });

  test(`should accept 'hintText' option`, () => {
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

  test(`prev() should not throw if 'inverse' option set to true`, () => {
    expect(() => tridiInstance.prev()).not.toThrow();
  });

  test(`next() should not throw if 'inverse' option set to true`, () => {
    expect(() => tridiInstance.next()).not.toThrow();
  });

  test('autoplayStart() should not throw', () => {
    expect(() => tridiInstance.autoplayStart()).not.toThrow();
  });

  test('autoplayStop() should not throw', () => {
    expect(() => tridiInstance.autoplayStop()).not.toThrow();
  });

  test('viewer image should be cycled back to first frame when hitting array limit', () => {
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

  test('should not throw', () => {
    expect(() => tridiInstance.update(newOptions)).not.toThrow();
  });

  test(`should accept 'syncFrame' parameter to true`, () => {
    expect(() => tridiInstance.update(newOptions, true)).not.toThrow();
  });

  test(`should accept 'syncFrame' parameter set to false`, () => {
    expect(() => tridiInstance.update(newOptions, false)).not.toThrow();
  });

  test(`should return false for missing updatable options`, () => {
    const emptyOptionsObject = {};
    expect(() => tridiInstance.update(emptyOptionsObject)).not.toThrow();
  })
});

describe('Event listeners', () => {
  const containerId = 'tridi-test-container-6';

  const options = {
    element: `#${containerId}`,
    format: 'jpg',
    count: 5,
  };

  
  test(`should listen for 'wheel' events`, () => {
    setupTridi(containerId, {
      ...options,
      mousewheel: true
    }).load();

    const viewerImage = document.querySelector(`#${containerId} .tridi-viewer-image`)!;
    expect(() => viewerImage.dispatchEvent(new WheelEvent('wheel', { deltaY: 100 }))).not.toThrow();
    expect(() => viewerImage.dispatchEvent(new WheelEvent('wheel', { deltaY: -100 }))).not.toThrow();
  });

  test(`should listen for 'wheel' events with 'passive' option set to false`, () => {
    setupTridi(containerId, {
      ...options,
      mousewheel: true,
      passive: false,
    }).load();

    const viewerImage = document.querySelector(`#${containerId} .tridi-viewer-image`)!;
    expect(() => viewerImage.dispatchEvent(new WheelEvent('wheel', { deltaY: 100 }))).not.toThrow();
    expect(() => viewerImage.dispatchEvent(new WheelEvent('wheel', { deltaY: -100 }))).not.toThrow();
  });

  test(`should not react to touch events when 'touch' option is set to false`, () => {
    setupTridi(containerId, {
      ...options,
      draggable: true,
      touch: false,
      lazy: true,
      skip: false,
    }).load();

    const viewerImage = document.querySelector(`#${containerId} .tridi-viewer-image`)!;

    expect(() => viewerImage.dispatchEvent(new TouchEvent('touchstart', { touches: [ { clientX: 100 } as Touch ] }))).not.toThrow();
  });

  test(`should listen for 'mouseenter' events with 'stopAutoplayOnMouseenter' option set to true`, () => {
    setupTridi(containerId, {
      ...options,
      autoplay: true,
      stopAutoplayOnMouseenter: true,
    }).load();

    const viewerImage = document.querySelector(`#${containerId} .tridi-viewer-image`)!;
    expect(() => viewerImage.dispatchEvent(new MouseEvent('mouseenter'))).not.toThrow();
  });

  test(`should listen for 'mousedown' events with 'stopAutoplayOnClick' option set to true`, () => {
    setupTridi(containerId, {
      ...options,
      autoplay: true,
      stopAutoplayOnClick: true,
    }).load();

    const viewerImage = document.querySelector(`#${containerId} .tridi-viewer-image`)!;
    expect(() => viewerImage.dispatchEvent(new MouseEvent('mousedown'))).not.toThrow();
  });

  test(`should listen for 'mouseleave' events with 'resumeAutoplayOnMouseleave' option set to true`, () => {
    setupTridi(containerId, {
      ...options,
      autoplay: true,
      resumeAutoplayOnMouseleave: true,
    }).load();

    const viewerImage = document.querySelector(`#${containerId} .tridi-viewer-image`)!;
    expect(() => viewerImage.dispatchEvent(new MouseEvent('mouseleave'))).not.toThrow();
  });

  test(`should handle mouse drag events correctly`, () => {
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

  test(`should do nothing when drag event was not initiated`, () => {
    setupTridi(containerId, {
      ...options,
      draggable: true,
    }).load();

    const viewerImage = document.querySelector(`#${containerId} .tridi-viewer-image`)!;
    expect(() => {
      viewerImage.dispatchEvent(new MouseEvent('mousemove', { clientX: 100 }));
    }).not.toThrow();
  });

  test(`should handle 'mouseleave' event correctly when 'mouseleaveDetect' option is set to true`, () => {
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

  test(`should handle touch drag events correctly`, () => {
    setupTridi(containerId, {
      ...options,
      draggable: true,
      touch: true,
    }).load();

    const viewerImage = document.querySelector(`#${containerId} .tridi-viewer-image`)!;

    expect(() => {
      viewerImage.dispatchEvent(new TouchEvent('touchstart', { touches: [ { clientX: 100 } as Touch ] }));
      viewerImage.dispatchEvent(new TouchEvent('touchmove', { touches: [ { clientX: -100 } as Touch ] }));
      viewerImage.dispatchEvent(new TouchEvent('touchmove', { touches: [ { clientX: 100 } as any ] }));
      viewerImage.dispatchEvent(new TouchEvent('touchend'));
    }).not.toThrow();
  });

  test(`should listen for click events on hint overlay`, () => {
    setupTridi(containerId, {
      ...options,
      draggable: true,
      touch: true,
      hintOnStartup: true
    }).load();

    const hintOverlay = document.querySelector(`#${containerId} .tridi-hint-overlay`)!;

    expect(() => (hintOverlay as HTMLElement).click()).not.toThrow();
  });

  test(`should listen for Enter keypresses on hint overlay`, () => {
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

  test(`should ignore touch events on hint overlay when 'touch' option is set to false`, () => {
    setupTridi(containerId, {
      ...options,
      draggable: true,
      touch: false,
      hintOnStartup: true,
      hintText: 'test',
    }).load();

    const hintOverlay = document.querySelector(`#${containerId} .tridi-hint-overlay`)!

    expect(() => hintOverlay.dispatchEvent(new TouchEvent('touchstart', { touches: [ { clientX: 100 } as Touch ] }))).not.toThrow();
  });
});
