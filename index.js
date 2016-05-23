'use strict';

var events = require('events');
var util = require('util');
var WebSocket = require('ws');

function Client(params) {
  Client.super_.apply(this);
  
  params = params || {};
  
  var config = params;
  var logger = params.logger || emptyLogger;
  
  var self = this;
  
  self.loadDefinition = function(callback) {
    self.execCommand({ name: 'definition', options: [] }, callback);
  };

  self.execCommand = function(command, callback) {
    var ws = buildWebsocketClient(config);

    var wsCommand = {
      command: command.name,
      options: command.options
    };
    
    ws.on('open', function open() {
      logger.debug(' - Websocket@client is opened');
      ws.send(JSON.stringify(wsCommand));
    });
    
    ws.on('message', function incomming(data) {
      logger.debug(' - Websocket@client is received a message data: %s', data);
      
      data = JSON.parse(data);
      switch(data.state) {
        case 'definition':
          ws.close();
          self.emit('definition', data);
          callback && callback(null, data.value);
          break;
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
          callback && callback();
          break;
        case 'noop':
          ws.close();
          self.emit('noop');
          callback && callback({
            name: 'IS_NOT_IMPLEMENTED',
            message: 'operation is not implemented'
          });
          break;
        default:
          break;
      }
    });
    
    ws.on('close', function handler(code, message) {
      logger.debug(' - Websocket@client is closed, code: %s, message: %s', code, message);
    });
    
    ws.on('error', function handler(error) {
      logger.debug(' - Websocket@client encounter an error: %s', error);
    });
  };
}

util.inherits(Client, events.EventEmitter);

module.exports = Client;

var buildWebsocketClient = function(config) {
  var sslEnabled = (config.ssl && typeof(config.ssl) == 'object' && config.ssl.enabled);
  var wsUrl = util.format('%s://%s:%s%s/execute',
    sslEnabled?'wss':'ws', config.host, config.port, config.path);
  var wsOpts = sslEnabled ? {rejectUnauthorized: config.ssl.rejectUnauthorized || false} : {};
  return new WebSocket(wsUrl, null, wsOpts);
};

var emptyFunction = function() {};

var emptyLogger = {
  debug: emptyFunction,
  trace: emptyFunction,
  error: emptyFunction
};
