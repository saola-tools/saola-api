'use strict';

var lab = require('../index');
var chores = require('../../lib/chores');
var DevebotApi = lab.getDevebotApi();
var assert = require('chai').assert;
var path = require('path');
var util = require('util');
var rewire = require('rewire');
var sinon = require('sinon');

var noop = function() {}

describe("tdd:devebot-api:local", function() {
  this.timeout(lab.getDefaultTimeout());

  describe("execCommand()", function() {
    let api;

    let wsServer = lab.createWsServerMock();
    let wsClient = lab.createWsClientMock(wsServer);
    let clientStub = {};
    let clientMethods = ['on', 'ready', 'send'];
    clientMethods.forEach(function(methodName) {
      clientStub[methodName] = sinon.stub(wsClient, methodName).callThrough();
    });
    wsServer.on('message', function(command) {
      command = JSON.parse(command);
      switch(command.name) {
        case 'definition': {
          wsClient.emit('message', JSON.stringify({
            state: 'definition',
            value: []
          }));
        }
        break;
        case 'example':
        var options = command.options || {};
        var result = options.expectedData || {};
        result.state = options.expected;
        wsClient.emit('message', JSON.stringify(result));
        if (['progress'].indexOf(options.expected) < 0) {
          wsClient.emit('message', JSON.stringify({
            state: 'done'
          }));
        }
        break;
      }
    });

    beforeEach(function() {
      api = new DevebotApi({ listener: wsClient });
    });

    it("invoke execCommand() with state 'completed' successfully", function(done) {
      new Promise(function(onResolved, onRejected) {
        var command = {
          name: 'example',
          options: {
            expected: 'completed',
            expectedData: {
              msg: 'completed'
            }
          }
        };
        api
          .on("completed", function(data) {
            assert.deepInclude(data, {
              state: 'completed',
              msg: 'completed'
            });
          })
          .on("close", onResolved)
          .on("error", onRejected)
          .execCommand(command);
        assert(clientStub.ready.calledOnce);
        assert(clientStub.on.withArgs("open").calledOnce);
        assert(clientStub.send.calledOnce);
        assert.deepInclude(JSON.parse(clientStub.send.args[0][0]), {
          name: command.name,
          command: command.name,
          options: chores.omit(command.options, ['exptected', 'expectedData'])
        });
      }).then(chores.ary(done, 0)).catch(done);
    });

    afterEach(function() {
      clientMethods.forEach(function(methodName) {
        clientStub[methodName].resetHistory();
      });
    });
  });
});
