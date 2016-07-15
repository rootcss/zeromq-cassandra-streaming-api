//global.log = require('./config/logger.js');

var zeromq = require('zmq')
  , port = 'tcp://127.0.0.1:12345';

//var zeromq_monitoring_service = require('./services/zeromq_monitoring_service.js');

var socket = zeromq.socket('dealer');
socket.identity = 'C-' + process.pid;
socket.connect(port);
console.log('Connected on '+port);

//new zeromq_monitoring_service(socket).initiateMonitoring();

var req_args = {
  'domain': 'cassandra_query',
  'query': "SELECT dateOf(event_timestamp) FROM api_events WHERE event_name = 'TransactionChargedEvent' LIMIT 10000",
  'fetchSize': 10,
}
socket.send(JSON.stringify(req_args));

// receving the data from server
socket.on('message', function(data) {
  console.log('[' + socket.identity + ']: ' + data);
});

process.on('SIGINT', function() {
  console.log("Triggering termination signal now.");
  socket.send(JSON.stringify({'domain':'client_state', 'action':'dead'}));
  socket.close();
});
