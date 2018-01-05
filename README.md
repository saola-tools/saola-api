# devebot-api

> The devebot application programming interface.

## Install

Installs this library and you'll have access to the `devebot` service from your program.

```shell
npm install --save devebot-api
```

## Usage

### Creates object and defines events

```javascript
var DevebotApi = require('devebot-api');
var logger = require('winston');

var devebot = new DevebotApi({
  host: '<your-address-default-127.0.0.1>',
  port: '<your-port-default-17779>',
  path: '<default-devebot>',
  logger: logger // option
});

devebot.on('started', function() {
  logger.info(' - The command is started');
});

devebot.on('completed', function(data) {
  logger.info(' - The command is commpleted successful, result: %s',
      JSON.stringify(data, null, 2));
});

devebot.on('failed', function(data) {
  logger.info(' - The command is failed, output: %s',
      JSON.stringify(data, null, 2));
});

devebot.on('done', function() {
  logger.info(' - The command is finished');
});

devebot.on('noop', function() {
  logger.info(' - The command not found');
});
```

### Gets commands definition

Uses `devebot.loadDefinition(callback)` to get the commands defintion from `devebot` service.

```javascript
devebot.loadDefinition(function(err, definition) {
  // do something with commands definition
});
```

### Executes a command

Uses `devebot.execCommand(cmd_definition, callback)` to execute a command that has been defined in `devebot` service.

Example:

```javascript
var cmd_def = {
  name: '<name_of_command>',
  options: {
    option_1: '<value_1>',
    option_2: '<value_2>'
  }
};

var callback = function(err, result) {
  // do something with err & result
};

devebot.execCommand(cmd_def, callback);
```

or inline form:

```javascript
devebot.execCommand({
  name: '<name_of_command>',
  options: {
    option_1: '<value_1>',
    option_2: '<value_2>'
  }
}, function(err, result) {
  // do something with err & result
});
```
