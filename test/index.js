'use strict';

var rewire = require('rewire');
var Runner = rewire('devebot/lib/runner');
var WsServerMock = Runner.__get__("WsServerMock");
var WsClientMock = Runner.__get__("WsClientMock");
var WebSocket = require('ws');
var chores = require('../lib/chores');

function TestLoader() {
  this.getDefaultTimeout = function() {
    return 3600000;
  }

  this.getDevebotApi = function() {
    return require('../index');
  }

  this.createWsServerMock = function() {
    return new WsServerMock();
  }

  this.createWsClientMock = function(ws) {
    return ws.register(new WsClientMock(ws));
  }

  this.createWebSocketServer = function(opts) {
    opts = opts || {};
    return new WebSocket.Server(opts);
  }
}

module.exports = new TestLoader();
