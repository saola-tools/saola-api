'use strict';

const pinbug = require('./pinbug');

const pinbugScope = 'devebot-api:';
const loggingLevels = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'];

const pinbugWrapper = {};
loggingLevels.forEach(function(level) {
  pinbugWrapper[level] = pinbug(pinbugScope + level);
});

const defaultLogger = {};
loggingLevels.forEach(function(level) {
  defaultLogger[level] = function() {
    pinbugWrapper[level].enabled && pinbugWrapper[level].apply(null, arguments);
  }
});

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

  this.getDefaultLogger = function() {
    return defaultLogger;
  }

  this.STATE_MAP = STATE_MAP;
}

module.exports = new Chores();
