module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testMatch: [
    '<rootDir>/tests/**/*.test.js'
  ],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/main.js', // Entry point, covered by integration tests
    '!src/scenes/PreloadScene.js', // Asset loading, hard to unit test
    '!src/scenes/MenuScene.js' // UI scene, covered by integration tests
  ],
  moduleFileExtensions: ['js'],
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  testTimeout: 10000
};