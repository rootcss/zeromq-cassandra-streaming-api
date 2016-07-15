var cassandra = require('cassandra-driver');
var distance = cassandra.types.distance;
var options = {
   contactPoints: ['192.168.56.101'],
   pooling: {
      coreConnectionsPerHost: {}
   }
};
options.pooling.coreConnectionsPerHost[distance.local] = 4;
options.pooling.coreConnectionsPerHost[distance.remote] = 1;
var client = new cassandra.Client(options);
console.log(client);
