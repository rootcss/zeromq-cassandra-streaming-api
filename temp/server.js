var events = require('events');
var eventEmitter = new events.EventEmitter();

// Cassandra Connection
var cassandra_driver = require('cassandra-driver');
var config = require('./config/config.js');

var distance = cassandra_driver.types.distance;
var cassandraOptions = {
  contactPoints: config.cassandra.contactPoints,
  keyspace: config.cassandra.events_keyspace,
  authProvider: new cassandra_driver.auth.PlainTextAuthProvider(config.cassandra.creds.username, config.cassandra.creds.password),
  pooling: {coreConnectionsPerHost: {}},
}
cassandraOptions.pooling.coreConnectionsPerHost[distance.local] = 4;
cassandraOptions.pooling.coreConnectionsPerHost[distance.remote] = 1;
var cassandra = new cassandra_driver.Client(cassandraOptions);
console.log(cassandra);

// eventHandler to process pagination
eventEmitter.on('event_stream_pagination', function(data) {
  if(data) {
    var pageState = data['pageState'].toString('hex');
    var options = {pageState: pageState, prepare: 1, fetchSize: 2}
    print("|");
    exec(data['envelope'], data['query'], options);
  }
});

var zeromq = require('zmq')
var port = 'tcp://127.0.0.1:12345';
var socket = zeromq.socket('router');
socket.identity = 'S-' + process.pid;

socket.bind(port, function(err) {
  if (err) throw err;

  console.log('Server is running on ' + port);
  socket.on('message', function(envelope, data) {
    if(data.toString() === 'get_me_stuff') {
        console.log('[' + socket.identity + ']: Request from ' + envelope + ' - ' + data.toString());
        var options = {pageState: null, prepare: 1, fetchSize: 2};
        var query = "SELECT * FROM api_events LIMIT 100";
        exec(envelope, query, options);
    }
    else {
      console.log('Kya karun iska?');
    }
  });
});

function exec(envelope, query, options) {
  cassandra.eachRow(query, [], options, function (n, row) {
    socket.send([envelope, JSON.stringify(row)]);
    print('*');
  }, function(err, result){
    if(result && result.meta && result.meta.pageState) {
      var pageState = result.meta.pageState;
      if(pageState) {
        var ret = {
          'pageState': pageState,
          'query': query,
          'envelope': envelope,
        }
        eventEmitter.emit('event_stream_pagination', ret);
      }
    } else {
      print("\nNothing more to paginate.\n");
    }
  });
}

function print(data) {
  process.stdout.write(data);
  return;
}
