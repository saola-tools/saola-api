# @saola/api

> The Saola application programming interface.

## Install

Installs this library and you'll have access to the `saola` service from your program.

```shell
npm install --save @saola/api
```

## Usage

### Creates object and defines events

```javascript
var ApiClient = require('@saola/api');
var logger = require('winston');

var apiClient = new ApiClient({
  host: '<your-address-default-127.0.0.1>',
  port: '<your-port-default-17779>',
  path: '<default-saola>',
  logger: logger // option
});

apiClient.on('started', function() {
  logger.info(' - The command is started');
});

apiClient.on('completed', function(data) {
  logger.info(' - The command is commpleted successful, result: %s',
      JSON.stringify(data, null, 2));
});

apiClient.on('failed', function(data) {
  logger.info(' - The command is failed, output: %s',
      JSON.stringify(data, null, 2));
});

apiClient.on('done', function() {
  logger.info(' - The command is finished');
});

apiClient.on('noop', function() {
  logger.info(' - The command not found');
});
```

### Gets commands definition

Uses `apiClient.loadDefinition(callback)` to get the commands defintion from `saola` service.

```javascript
apiClient.loadDefinition(function(err, definition) {
  // do something with commands definition
});
```

### Executes a command

Uses `apiClient.execCommand(cmd_definition, callback)` to execute a command that has been defined in `saola` service.

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

apiClient.execCommand(cmd_def, callback);
```

or inline form:

```javascript
apiClient.execCommand({
  name: '<name_of_command>',
  options: {
    option_1: '<value_1>',
    option_2: '<value_2>'
  }
}, function(err, result) {
  // do something with err & result
});
```
