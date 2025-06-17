// Test setup file
// Mock console.log to reduce noise in tests
global.console = {
  ...console,
  // Uncomment to ignore console logs in tests
  // log: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};

// Mock common React Native/Expo modules
jest.mock('react-native', () => ({
  NativeModules: {},
  Platform: {
    OS: 'ios',
    select: jest.fn((obj) => obj.ios),
  },
}));

// Set up test environment
beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();
});