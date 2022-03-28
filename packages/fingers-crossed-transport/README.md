# Fingers Crossed Winston Transport

This library implements a transport for [Winston](https://github.com/winstonjs/winston)
loggers that works as a regular transport while the service is working
normally but automatically switches to a verbose mode when an error occurs, in
an attempt to provide more context to help diagnose the issue. In this verbose
mode, the transport will print debugging messages that would normally be
discarded.

## Usage

```javascript
import { FingersCrossedTransport } from '@kristijorgji/winstojns-transport-fingers-crossed'
import { createLogger, transports } from 'winston';

const transport = new FingersCrossedTransport(new transports.Console(), {
  // Prints all messages with level >= info and switches to verbose mode when a
  // message with level >= warn arrives
  standardLevel: 'info',
  activationLevel: 'warn',
});

const logger = createLogger({ transports: [transport] });
```

## Configuration options

| Option                | Description                                                                                                                                                                                     |
|-----------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `standardLevel`       | Normal logging threshold, i.e., messages with a lower level won't be printed and messages with level greater than or equal will be printed immediately. <br/>Typically `info` or `warn`.        |
| `activationLevel`     | Threshold level at the transport will switch to verbose mode and print detailed logging messages that were not displayed before. <br/>Typically `warn` or `error`                               |
| `maxItemsInBuffer`    | Maximum number of messages to keep in buffer in order to avoid memory leak if activation threshold is never reached. <br/>Defaults to undefined (no limit)                                      |
| `resetOnActivation`   | If set to true then when activationLevel is reached all logs are flushed(logged) then logger is reset. Will not print out anything until next activation level is reached <br/>Defaults to true |

## reset

When a message with logging level >= `activationLevel` arrives, the transport
switches to verbose mode and starts logging all messages. To disable verbose
mode call `transport.reset()`, as the following example shows:

```javascript
import { FingersCrossedTransport } from '@kristijorgji/winstojns-transport-fingers-crossed'
import { createLogger, transports } from 'winston';

const transport = new FingersCrossedTransport(new transports.Console(), {
  standardLevel: 'info',
  activationLevel: 'warn',
});

const logger = createLogger({ transports: [transport] });

logger.debug('Debug message will not be printed immediately');

logger.warn('Warn message will be printed immediately, together with the debug message above');
logger.debug('This debug message will be printed immediately as well');

transport.reset();

logger.debug('This debug message will not be printed');
```
