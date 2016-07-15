var log4js = require('log4js');
log4js.configure({
  appenders: [
    { type: 'console' },
    { type: 'file', filename: 'log.log', category: 'zeromq-server' }
  ]
});

var logger = log4js.getLogger('zeromq-server');
var loglevel = process.env.LOG_LEVEL || 'INFO';
logger.setLevel(loglevel);
logger.info("Logger initialized with log level: ", loglevel);

module.exports = logger;
