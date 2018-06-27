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

    let wsClient;
    let clientStub;
    let clientMethods = ['on', 'ready', 'send'];

    beforeEach(function() {
      wsClient = lab.createWsClientMock(lab.createWsServerMock());
      clientStub = {};
      clientMethods.forEach(function(methodName) {
        clientStub[methodName] = sinon.stub(wsClient, methodName).callThrough();
      });
      api = new DevebotApi({ listener: wsClient });
    });

    it("invoke execCommand() with state 'noop' successfully", function(done) {
      new Promise(function(onResolved, onRejected) {
        var command = {
          name: 'example',
          options: {
            expected: 'noop'
          }
        };
        lab.rejectEvents(api, ['failed', 'cancelled', 'timeout', 'started']);
        api
          .on("noop", function(data) {
            assert.deepInclude(data, {
              state: 'noop'
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
      }).then(chores.ary(done, 0)).catch(done);
    });

    afterEach(function() {
      clientMethods.forEach(function(methodName) {
        clientStub[methodName].resetHistory();
      });
    });
  });
});
