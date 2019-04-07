import 'jest-dom/extend-expect';
const tridi = require('../src/tridi');

console = <any>{
  error: jest.fn()
}

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
  }

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
  }

  setupTridi(containerId, options).load();

  test('Viewer is generated', () => {
    const viewer = document.querySelector(`#${containerId}.tridi-viewer`);
    expect(viewer).toBeInTheDocument();
  });

  test('Viewer image is generated', () => {
    const viewer = document.querySelector(`#${containerId} .tridi-viewer-image`);
    expect(viewer).toBeInTheDocument();
  });

  test('Loading screen is generated', () => {
    const loadingScreen = document.querySelector(`#${containerId} .tridi-loading`);
    const spinner = document.querySelector(`#${containerId} .tridi-spinner`);
    
    expect(loadingScreen).toBeInTheDocument();
    expect(spinner).toBeInTheDocument();
  });

  test('Loading screen is not visible', () => {
    const loadingScreen = <HTMLDivElement>document.querySelector(`#${containerId} .tridi-loading`);
    expect(loadingScreen.style.display).toEqual('none');
  });

  test('Stash is generated', () => {
    const stash = <HTMLDivElement>document.querySelector(`#${containerId} .tridi-stash`);
    expect(stash).toBeInTheDocument();
  });


  test('Stash is populated', () => {
    const stash = <HTMLDivElement>document.querySelector(`#${containerId} .tridi-stash`);
    const stashedImages = stash.querySelectorAll('.tridi-image').length; 
    expect(stashedImages).toEqual(options.count);
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
    }
  
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

    expect(console.error).toHaveBeenCalledWith(`'location' property is missing or invalid. Image location must be provided for 'numbered' property.`);
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
});

describe('Behavior', () => {
  const containerId = 'tridi-test-container-4';

  const options = {
    element: `#${containerId}`,
    location: './images/1',
    format: 'jpg',
    count: 5,
  }
  
  const tridiInstance = setupTridi(containerId, options);
  tridiInstance.load();

  test('prev() should not throw', () => {
    expect(() => tridiInstance.prev()).not.toThrow();
  });

  test('next() should not throw', () => {
    expect(() => tridiInstance.next()).not.toThrow();
  });

  test('autoplayStart() should not throw', () => {
    expect(() => tridiInstance.autoplayStart()).not.toThrow();
  });

  test('autoplayStop() should not throw', () => {
    expect(() => tridiInstance.autoplayStop()).not.toThrow();
  });
});

describe('Update', () => {
  const containerId = 'tridi-test-container-5';

  const options = {
    element: `#${containerId}`,
    format: 'jpg',
    count: 5,
  }

  const oldOptions = {
    ...options,
    location: './images/1',
  }

  const newOptions = {
    ...options,
    location: './images/2',
  }

  
  const tridiInstance = setupTridi(containerId, oldOptions);
  tridiInstance.load();

  test('should not throw', () => {
    expect(() => tridiInstance.update(newOptions)).not.toThrow();
  });

  test(`should accept 'syncFrame' parameter`, () => {
    expect(() => tridiInstance.update(newOptions, true)).not.toThrow();
  });
});