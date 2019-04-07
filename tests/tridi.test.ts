import 'jest-dom/extend-expect';
const tridi = require('../src/tridi');

const tridiContainer = document.createElement('div');
tridiContainer.id = 'tridi-test-container';

describe('Tridi class', () => {  
  document.body.appendChild(tridiContainer);
  const tridiInstance = new tridi({
    element: '#tridi-test-container',
    location: './images/1',
    format: 'jpg',
    count: 5
  });

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
  document.body.appendChild(tridiContainer);
  const options = {
    element: '#tridi-test-container',
    location: './images/1',
    format: 'jpg',
    count: 5,
  }

  const tridiInstance = new tridi(options);
  tridiInstance.load();

  test('Viewer is generated', () => {
    const viewer = document.querySelector('#tridi-test-container.tridi-viewer');
    expect(viewer).toBeInTheDocument();
  });

  test('Viewer image is generated', () => {
    const viewer = document.querySelector('#tridi-test-container .tridi-viewer-image');
    expect(viewer).toBeInTheDocument();
  });

  test('Loading screen is generated', () => {
    const loadingScreen = document.querySelector('#tridi-test-container .tridi-loading');
    const spinner = document.querySelector('#tridi-test-container .tridi-spinner');
    
    expect(loadingScreen).toBeInTheDocument();
    expect(spinner).toBeInTheDocument();
  });

  test('Loading screen is not visible', () => {
    const loadingScreen = <HTMLDivElement>document.querySelector('#tridi-test-container .tridi-loading');
    expect(loadingScreen.style.display).toEqual('none');
  });

  test('Stash is generated', () => {
    const stash = <HTMLDivElement>document.querySelector('#tridi-test-container .tridi-stash');
    expect(stash).toBeInTheDocument();
  });


  test('Stash is populated', () => {
    const stash = <HTMLDivElement>document.querySelector('#tridi-test-container .tridi-stash');
    const stashedImages = stash.querySelectorAll('.tridi-image').length; 
    expect(stashedImages).toEqual(options.count);
  });
});