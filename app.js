'use strict';

global.log = require('./config/logger.js');
let zeromq_monitoring_service = require('./services/zeromq_monitoring_service.js');

let cassandra = new (require('./lib/cassandra.js'))().cassandra;
log.info("Cassandra connection pool is ready");

let zeromq_service = require('./services/zeromq_server_service.js');
log.info("Initializing ZeroMQ Services");

let server = new zeromq_service(cassandra);
let socket = server.getSocket();
new zeromq_monitoring_service(socket).initiateMonitoring();
server.bind_socket();
