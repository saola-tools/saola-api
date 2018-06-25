'use strict';

var emptyFunction = function() {};

module.exports = {
  emptyLogger: {
    trace: emptyFunction,
    debug: emptyFunction,
    info: emptyFunction,
    warn: emptyFunction,
    error: emptyFunction,
    fatal: emptyFunction
  },
  STATE_MAP: {
    "definition": "definition",
    "enqueque": "started",
    "progress": "progress",
    "failed": "failure",
    "complete": "success",
    "done": "done",
    "noop": "noop"
  }
}
