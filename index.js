'use strict';

var events = require('events');
var util = require('util');
var superagent = require('superagent');
var WebSocket = require('ws');

function Client(params) {
  Client.super_.apply(this, arguments);
  
  params = params || {};
  
  var config = params;
  var logger = params.logger || emptyLogger;
  
  var self = this;
  
  self.loadDefinition = function(callback) {
    logger.trace(' * load commandline definition with cfg: %s', JSON.stringify(config, null, 2));
    
    var url = util.format('http://%s:%s%s/clidef', config.host, config.port, config.path);
  
    logger.trace(' + send a get request to [%s] to get commandline definition', url);
    
    superagent.get(url)
    .set('user-agent', 'devebot/api')
    .type('application/json')
    .accept('application/json')
    .end(function(err, res) {
      if (err) {
        logger.trace(' -> failure on requesting commandline definition: %s', JSON.stringify(err, null, 2));
        callback({
          name: 'restapi_request_error',
          error: err
        });
        return;
      } else if (res.status != 200) {
        logger.trace(' -> invalide status on requesting commandline definition: %s', res.status);
        callback({
          name: 'restapi_invalid_status',
          status: res.status
        });
        return;
      } else {
        var result = res.body;
        logger.trace(' -> success on requesting commandline definition: %s', JSON.stringify(result, null, 2));
        callback(null, result);
      }
    });
  };
  
  self.execCommand = function(command) {
    var wsUrl = util.format('ws://%s:%s%s/execute', config.host, config.port, config.path);
    var ws = new WebSocket(wsUrl);

    var wsCommand = {
      command: command.name,
      options: command.options
    };
    
    ws.on('open', function open() {
      ws.send(JSON.stringify(wsCommand));
    });
    
    ws.on('message', function incomming(data) {
      data = JSON.parse(data);
      switch(data.state) {
        case 'enqueque':
          self.emit('started');
          break;
        case 'progress':
          self.emit('progress', data);
          break;
        case 'failed':
          self.emit('failure', data);
          break;
        case 'complete':
          self.emit('success', data);
          break;
        case 'done':
          ws.close();
          self.emit('done');
          break;
        case 'noop':
          ws.close();
          self.emit('noop');
          break;
        default:
          ws.close();
          self.emit('unknown');
          break;
      }
    });
  };
}

util.inherits(Client, events.EventEmitter);

module.exports = Client;

var emptyFunction = function() {};

var emptyLogger = {
  debug: emptyFunction,
  trace: emptyFunction,
  error: emptyFunction
};
