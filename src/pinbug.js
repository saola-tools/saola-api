"use strict";

let debug = null;

function pinbug (pkgName) {
  if (debug == null) {
    try {
      // eslint-disable-next-line
      debug = require('debug');
    } catch (err) {
      debug = function() {
        let log = function() {
          return console.info.apply(console, arguments);
        };
        log.enabled = false;
        return log;
      };
    }
  }
  return debug(pkgName);
}

module.exports = pinbug;
