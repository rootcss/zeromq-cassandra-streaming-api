'use strict';

let cassandra_driver = require('cassandra-driver');
let config = require('../config/config.js');

class Cassandra {
  constructor() {
    this.setConfiguration();
    this.cassandra = this.getClient(this.cassandraOptions);
  }

  setConfiguration() {
    let distance = cassandra_driver.types.distance;
    this.cassandraOptions = {
      contactPoints: config.cassandra.contactPoints,
      keyspace: config.cassandra.events_keyspace,
      authProvider: new cassandra_driver.auth.PlainTextAuthProvider(config.cassandra.creds.username, config.cassandra.creds.password),
      pooling: {coreConnectionsPerHost: {}},
    }
    this.cassandraOptions.pooling.coreConnectionsPerHost[distance.local] = 4;
    this.cassandraOptions.pooling.coreConnectionsPerHost[distance.remote] = 1;
  }

  getClient(cassandraOptions) {
    return new cassandra_driver.Client(cassandraOptions);
  }

}

module.exports = Cassandra;
