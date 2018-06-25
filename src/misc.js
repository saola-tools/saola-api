'use strict';

const emptyFunction = function() {};

const emptyLogger = {
  trace: emptyFunction,
  debug: emptyFunction,
  info: emptyFunction,
  warn: emptyFunction,
  error: emptyFunction,
  fatal: emptyFunction
}

const STATE_MAP = {
  "definition": "definition",
  "enqueque": "started",
  "progress": "progress",
  "failed": "failure",
  "complete": "success",
  "done": "done",
  "noop": "noop"
}

function Chores() {
  this.isArray = function(a) {
    return a instanceof Array;
  }
  
  this.isString = function(s) {
    return typeof(s) === 'string';
  }

  this.pick = function(source, fieldNames) {
    let target = {};
    if (this.isArray(fieldNames)) {
      fieldNames.forEach(function(fieldName) {
        if (fieldName in source) {
          target[fieldName] = source[fieldName];
        }
      });
    }
    return target;
  }

  this.emptyLogger = emptyLogger;
  this.STATE_MAP = STATE_MAP;
}

module.exports = new Chores();
