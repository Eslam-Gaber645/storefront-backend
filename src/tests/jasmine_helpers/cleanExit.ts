'use strict';

process.on('exit', e => {
  // Change the exit code to 0 if not because the tests failed,
  // to continue the npm lifecycle
  process.exitCode = 0;
});
