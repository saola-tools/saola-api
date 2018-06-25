'use strict';

var events = require('events');
var util = require('util');
var WebSocket = require('ws');
var misc = require('./misc');

function Client(params) {
  events.EventEmitter.call(this);

  params = params || {};

  var config = extractConnectionOpts(params);
  var logger = params.logger || misc.getDefaultLogger();
  var stateMap = params.stateMap || misc.STATE_MAP;
  var mapState = function(state) {
    return stateMap[state] || state;
  }
  let listener = params.listener || params.ws;

  var self = this;

  self.loadDefinition = function(callback) {
    self.execCommand({ name: 'definition', options: [] }, callback);
  };

  self.execCommand = function(command, callback) {
    var ws = listener ? listener : buildWebsocketClient(config);

    var wsCommand = {
      name: command.name,
      mode: command.mode,
      options: command.options,
      payload: command.payload,
      package: command.package,
      command: command.name,
      data: command.data
    };
    
    ws.on('open', function open() {
      logger.debug(' - Websocket@client is opened');
      ws.send(JSON.stringify(wsCommand));
    });
    
    ws.on('message', function incomming(data) {
      logger.debug(' - Websocket@client is received a message data: %s', data);
      
      data = JSON.parse(data);

      data.command = data.command || command;

      switch(data.state) {
        case 'definition':
          ws.close();
          self.emit(mapState(data.state), data);
          callback && callback(null, data.value);
          break;
        case 'started':
        case 'completed':
        case 'cancelled':
        case 'failed':
        case 'timeout':
          self.emit(mapState(data.state), data);
          break;
        case 'done':
          ws.close();
          self.emit(mapState(data.state), data);
          callback && callback();
          break;
        case 'noop':
          ws.close();
          self.emit(mapState(data.state), data);
          callback && callback({
            name: 'IS_NOT_IMPLEMENTED',
            message: 'operation is not implemented'
          });
          break;
        default:
          if (stateMap[data.state]) {
            self.emit(stateMap[data.state], data);
          }
          break;
      }
    });
    
    ws.on('close', function handler(code, message) {
      self.emit(mapState('close'), code, message);
      logger.debug(' - Websocket@client is closed, code: %s, message: %s', code, message);
    });
    
    ws.on('error', function handler(error) {
      self.emit(mapState('error'), error);
      logger.debug(' - Websocket@client encounter an error: %s', error);
    });

    (typeof(ws.ready) === 'function') && ws.ready();
  };
}

util.inherits(Client, events.EventEmitter);

module.exports = Client;

var extractConnectionOpts = function(params) {
  params = params || {};
  return misc.pick(params.connection || params, [
    'url', 'host', 'port', 'path', 'authen', 'tunnel'
  ]);
}

var buildWebsocketClient = function(config) {
  var wsOpts = {};

  if (config.authen instanceof Object) {
    wsOpts.headers = wsOpts.headers || {};
    if (config.authen.token_jwt) {
      wsOpts.headers["Authorization"] = "JWT " + config.authen.token_jwt;
    }
    if (config.authen.token_key && config.authen.token_secret) {
      wsOpts.headers["X-Token-Key"] = config.authen.token_key;
      wsOpts.headers["X-Token-Secret"] = config.authen.token_secret;
    }
  }

  var sslEnabled = (config.tunnel instanceof Object && config.tunnel.enabled);
  if (sslEnabled) {
    wsOpts.rejectUnauthorized = config.tunnel.rejectUnauthorized || false;
  }

  var wsUrl = util.format('%s://%s:%s%s/execute',
    sslEnabled?'wss':'ws', config.host, config.port, config.path);

  return new WebSocket(wsUrl, null, wsOpts);
};
