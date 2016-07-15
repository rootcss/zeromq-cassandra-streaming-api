var events = require('events');
var eventEmitter = new events.EventEmitter();

var initiateEventListener = function() {
  eventEmitter.on('event_stream_pagination', function(data) {
    if(data) {
      var pageState = data['pageState'].toString('hex');
      var options = {pageState: pageState, prepare: 1, fetchSize: data['fetchSize']}
      print("|");
      exec(data['client_identity'], data['query'], options);
    }
  });
};

var sendDataOnSocket = function(client_identity, data) {
  socket.send([client_identity, data]);
  print('*');
};

var print = function(data) {
  process.stdout.write(data);
};

var onMessage = function(client_identity, data) {
  var req = JSON.parse(data.toString());
  if(req.domain === 'cassandra_query') {
      console.log('[' + socket.identity + ']: Request from ' + client_identity + ' - ' + data.toString());
      var options = {pageState: null, prepare: 1, fetchSize: req.fetchSize};
      exec(client_identity, req.query, options);
  }
  else {
    console.log('Kya karun iska?');
  }
};

var bindSocket = function(socket, port) {
  socket.bind(port, function(err) {
    if (err) throw err;
    console.log('Server is running on ' + port);
    socket.on('message', onMessage);
  });
};

var exec = function(client_identity, query, options) {
  cassandra.eachRow(query, [], options, function (n, row) {
    sendDataOnSocket(client_identity, JSON.stringify(row));
  }, function(err, result){
    if(result && result.meta && result.meta.pageState) {
      var pageState = result.meta.pageState;
      if(pageState) {
        var pagination_args = {
          'pageState': pageState,
          'query': query,
          'client_identity': client_identity,
          'fetchSize': options['fetchSize'],
        }
        eventEmitter.emit('event_stream_pagination', pagination_args);
      }
    } else {
      print("\nNothing more to paginate.\n");
    }
  });
};

module.exports = {
  initiateEventListener: initiateEventListener,
  bindSocket: bindSocket,
};
