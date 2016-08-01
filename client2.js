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
  'query': "SELECT event_timestamp, event_name, bucket_id FROM api_events WHERE bucket_id = 'date_2016_05_24' AND event_name = 'UserApprovedEvent' OR event_name = 'TransactionChargedEvent' LIMIT 1000",
  'fetchSize': 10,
}
socket.send(JSON.stringify(req_args));

// receving the data from server
socket.on('message', function(data) {
  console.log('[' + socket.identity + ']: ' + data);
});

process.on('SIGINT', function() {
  console.log("SIGINT!!!");
  socket.send(JSON.stringify({'domain':'client_heartbeat', 'action':'dead'}));
  socket.close();
});
