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
    var api, wsClient, clientStub;
    var clientMethods = ['on', 'ready', 'send'];

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
            false && console.log("Command[%s] result: %s", command.name, JSON.stringify(data, null, 2));
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

    it("invoke execCommand() with state 'failed' successfully", function(done) {
      new Promise(function(onResolved, onRejected) {
        var command = {
          name: 'example',
          options: {
            expected: 'failed',
            expectedData: { msg: 'failed' }
          }
        };
        api
          .on("failed", function(data) {
            assert.deepInclude(data, {
              state: 'failed',
              msg: 'failed'
            });
          })
          .on("close", onResolved)
          .on("error", onRejected)
          .execCommand(command);
      }).then(chores.ary(done, 0)).catch(done);
    });

    it("invoke execCommand() with state 'cancelled' successfully", function(done) {
      new Promise(function(onResolved, onRejected) {
        var command = {
          name: 'example',
          options: {
            expected: 'cancelled',
            expectedData: { msg: 'cancelled' }
          }
        };
        api
          .on("cancelled", function(data) {
            assert.deepInclude(data, {
              state: 'cancelled',
              msg: 'cancelled'
            });
          })
          .on("close", onResolved)
          .on("error", onRejected)
          .execCommand(command);
      }).then(chores.ary(done, 0)).catch(done);
    });

    it("invoke execCommand() with state 'timeout' successfully", function(done) {
      new Promise(function(onResolved, onRejected) {
        var command = {
          name: 'example',
          options: {
            expected: 'timeout',
            expectedData: { msg: 'timeout' }
          }
        };
        api
          .on("timeout", function(data) {
            assert.deepInclude(data, {
              state: 'timeout',
              msg: 'timeout'
            });
          })
          .on("close", onResolved)
          .on("error", onRejected)
          .execCommand(command);
      }).then(chores.ary(done, 0)).catch(done);
    });

    it("invoke loadDefinition() successfully", function(done) {
      new Promise(function(onResolved, onRejected) {
        var command = {
          name: 'definition',
          options: {
            expected: 'definition',
            expectedData: [
              {
                name: 'example',
                options: []
              }
            ]
          }
        };
        api
          .on("definition", function(data) {
            assert.deepInclude(data, {
              state: 'definition',
              value: command.options.expectedData
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
