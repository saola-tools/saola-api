'use strict';

const rewire = require('rewire');
const Runner = rewire('@saola/core/lib/runner');
const WsServerMock = Runner.__get__("WsServerMock");
const WsClientMock = Runner.__get__("WsClientMock");
const WebSocket = require('ws');
const assert = require('chai').assert;
const util = require('util');
const chores = require('../lib/chores');

function TestLoader() {
  this.getDefaultTimeout = function() {
    return 3600000;
  }

  this.getApiClient = function() {
    return require('../index');
  }

  this.createWsServerMock = function() {
    return new WsServerMock();
  }

  this.createWsClientMock = function(wsServer) {
    const wsClient = new WsClientMock(wsServer);
    wsServer.on('message', function(command) {
      command = JSON.parse(command);
      const options = command.options || {};
      const result = options.expectedData || {};
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
