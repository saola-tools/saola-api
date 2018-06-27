'use strict';

var rewire = require('rewire');
var Runner = rewire('devebot/lib/runner');
var WsServerMock = Runner.__get__("WsServerMock");
var WsClientMock = Runner.__get__("WsClientMock");
var WebSocket = require('ws');
var assert = require('chai').assert;
var util = require('util');
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

  this.createWsClientMock = function(wsServer) {
    var wsClient = new WsClientMock(wsServer);
    wsServer.on('message', function(command) {
      command = JSON.parse(command);
      var options = command.options || {};
      var result = options.expectedData || {};
      switch(command.name) {
        case 'definition': {
          wsClient.emit('message', JSON.stringify({
            state: 'definition',
            value: result
          }));
        }
        break;
        case 'example':
        result.state = options.expected;
        wsClient.emit('message', JSON.stringify(result));
        if (['completed', 'failed', 'cancelled', 'timeout'].indexOf(options.expected) >= 0) {
          wsClient.emit('message', JSON.stringify({
            state: 'done'
          }));
        }
        break;
      }
    });
    return wsServer.register(wsClient);
  }

  this.createWebSocketServer = function(opts) {
    opts = opts || {};
    return new WebSocket.Server(opts);
  }

  this.rejectEvents = function(emitter, rejectedEvents) {
    rejectedEvents = rejectedEvents || [];
    rejectedEvents.forEach(function(eventName) {
      emitter.addListener(eventName, function(data) {
        assert.isTrue(false, util.format('[%s] must not be emitted', eventName));
      })
    });
  }
}

module.exports = new TestLoader();
