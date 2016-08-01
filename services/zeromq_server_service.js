'use strict';

let zeromq = require('zmq');
let config = require('../config/config.js');
let moment = require('moment');
var utility = require('./utility_service.js');

class ZeromqServerService {
  constructor(cassandra) {
    this.setConfiguration()
    this.socket = zeromq.socket('router');
    this.cassandra = cassandra;
    this.socket.identity = 'S-' + process.pid;
    this.client_heartbeat = []; // alive | dead - client hearbeat checker
  }

  setConfiguration() {
    this.connection_url = config.zeromq_server.connection_url;
  }

  getSocket() {
    return this.socket;
  }

  bind_socket() {
    let connection_url = this.connection_url;
    let self = this.socket;
    let that = this;
    self.bind(connection_url, (err) => {
      if (err) {
        log.error(err);
        throw err;
      }
      log.info('Server is running on ' + connection_url);
      self.on('message', (client_identity, data) => this.onMessage(client_identity, data));
    });
  }

  onMessage(client_identity, data) {
    this.client_heartbeat[client_identity] = 'alive';
    let req = JSON.parse(data.toString());
    log.info('[' + this.socket.identity + ']: Request from ' + client_identity + ' - ' + data.toString());

    if(req.domain === 'cassandra_query') {
        let options = {pageState: null, prepare: 1, fetchSize: req.fetchSize};
        log.info("Streaming the results now..")
        this.exec(client_identity, req.query, options);
    }

    else if(req.domain === 'client_heartbeat') {
        // This will set the flag that client is now dead. (heartbeat)
        // and now we should terminate the loop streaming shit.
        this.client_heartbeat[client_identity] = 'dead';
        log.debug("Client has triggered termination. Stopping the stream.")
    }

    else if(req.domain == 'cassandra_fetch') {
      console.log("Cassandra Fetch..");
      let bid_range = utility.strigify_bucket_ids(utility.get_bucket_id_range(req.from, req.to));
      let query = "SELECT * FROM api_events WHERE bucket_id IN (" + bid_range + ")";
      let options = {pageState: null, prepare: 1, fetchSize: req.fetchSize};
      log.info("Streaming the results now..")
      this.exec(client_identity, query, options);
    }

    else {
      log.info('Domain need to be set in the requests.');
    }
  }

  exec(client_identity, query, options) {
    let self = this.socket;
    this.cassandra.eachRow(query, [], options, function(n, row){
      self.send([client_identity, JSON.stringify(row)]);
      log.debug('*');
    }, (err, result) => {
      if(this.client_heartbeat[client_identity] !== 'alive') {
        console.log('Client triggered termination.');
      }
      if(result && result.meta && result.meta.pageState && this.client_heartbeat[client_identity] == 'alive') {
        options['pageState'] = result.meta.pageState.toString('hex');
        this.exec(client_identity, query, options);
      } else {
        log.info("Nothing left to paginate.");
      }
    });
  }

}

module.exports = ZeromqServerService;
