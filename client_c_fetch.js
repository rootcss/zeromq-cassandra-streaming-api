var zeromq = require('zmq')
  , port = 'tcp://127.0.0.1:12345';
  var utility = require('./services/utility_service.js');

var socket = zeromq.socket('dealer');
socket.identity = 'C-' + process.pid;
socket.connect(port);
console.log('Connected on '+port);

var req_args = {
  'domain': 'cassandra_fetch',
  // 'event_list': ['TransactionChargedEvent'],
  'from': 'date_2016_02_01',
  'to': 'date_2016_05_25',
  // 'order': 'ASC',
  'fetchSize': 10,
}
socket.send(JSON.stringify(req_args));

// receving the data from server
socket.on('message', function(data) {
  var x = JSON.parse(data.toString())
  console.log('[' + socket.identity + ']: ' + utility.get_timestamp_from_timeuuid(x.event_timestamp) + ' - ' + x.bucket_id);
});

process.on('SIGINT', function() {
  console.log("Triggering termination signal now.");
  socket.send(JSON.stringify({'domain':'client_heartbeat', 'action':'dead'}));
  socket.close();
});
