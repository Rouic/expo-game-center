// Test setup file
// Mock console.log to reduce noise in tests
global.console = {
  ...console,
  // Uncomment to ignore console logs in tests
  // log: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};

// Set up test environment
beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();
});