/// <reference types="node" />
import '@testing-library/jest-dom/vitest';

// @react-input/mask registers window event listeners that fire after
// jsdom teardown, causing "window is not defined" ReferenceErrors.
// These are harmless teardown artifacts, not real test failures.
// See: https://github.com/vitest-dev/vitest/issues/1293
process.on('uncaughtException', (error: Error) => {
  if (error instanceof ReferenceError && error.message.includes('window is not defined')) {
    return;
  }
  throw error;
});
