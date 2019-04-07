import 'jest-dom/extend-expect';
const tridi = require('../src/tridi');

console = <any>{
  error: jest.fn()
}

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
      count: 5
    };

    expect(() => setupTridi(containerId, options).load()).toThrow();
  });

  test(`should throw when setting images as 'numbered' and 'location' is missing`, () => {
    const options = {
      images: 'numbered'
    };

    expect(() => setupTridi(containerId, options).load()).toThrow();
  });
});