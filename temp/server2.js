var zeromq = require('zmq')
var port = 'tcp://127.0.0.1:12345';
global.cassandra = new (require('./lib/cassandra.js'))().cassandra;
global.socket = zeromq.socket('router');
socket.identity = 'S-' + process.pid;

var methods = require('./methods.js');

methods.initiateEventListener();
methods.bindSocket(socket, port);
