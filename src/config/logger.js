import * as _ from 'lodash';
import winston from 'winston';

let LoggerInstance = null;

export const Logger = {
  init: ({ transports = [], level = 'info', defaultMeta = {} } = {}) => {
    const loggerlevels = {
      fatal: 0,
      alert: 1,
      error: 2,
      warning: 3,
      info: 4,
      debug: 5,
      trace: 6,
    };
    const loggerColors = {
      fatal: 'blue',
      alert: 'magenta',
      error: 'red',
      warning: 'yellow',
      info: 'green',
      debug: 'cyan',
      trace: 'white',
    };

    if (!_.isArray(transports)) {
      throw new Error('transports is not an array');
    }

    if (!Object.keys(loggerlevels).includes(level)) {
      throw new Error('invalid level');
    }

    if (!_.isObject(defaultMeta) || _.isArray(defaultMeta)) {
      throw new Error('invalid default meta');
    }

    if (_.isEmpty(transports)) {
      transports.push(
        new winston.transports.Console({
          format: winston.format.combine(winston.format.cli(), winston.format.simple()),
        }),
      );
    }

    winston.addColors(loggerColors);

    LoggerInstance = winston.createLogger({
      level: level || 'debug',
      levels: loggerlevels,
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss',
          alias: '@timestamp',
        }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json(),
      ),
      transports,
      defaultMeta,
    });
  },

  log: (level, message, meta = {}) => {
    LoggerInstance.log({ level, message, meta });
  },

  stream: {
    write: (message) => LoggerInstance.log('debug', message),
  },
};
