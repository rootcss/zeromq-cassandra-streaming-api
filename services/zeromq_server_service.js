'use strict';

let zeromq = require('zmq');
let config = require('../config/config.js');
let moment = require('moment');

class ZeromqServerService {
  constructor(cassandra) {
    this.setConfiguration()
    this.socket = zeromq.socket('router');
    this.cassandra = cassandra;
    this.socket.identity = 'S-' + process.pid;
    this.client_state = []; // alive | dead
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
    this.client_state[client_identity] = 'alive';
    let req = JSON.parse(data.toString());
    log.info('[' + this.socket.identity + ']: Request from ' + client_identity + ' - ' + data.toString());

    if(req.domain === 'cassandra_query') {
        let options = {pageState: null, prepare: 1, fetchSize: req.fetchSize};
        log.info("Streaming the results now..")
        this.exec(client_identity, req.query, options);
    }

    else if(req.domain === 'client_state') {
        // This will set the flag that client is now dead.
        // and now we should terminate the loop streaming shit.
        this.client_state[client_identity] = 'dead';
        log.debug("Client has triggered termination. Stopping the stream.")
    }

    else if(req.domain == 'cassandra_fetch') {
      // === WIP ===
      // console.log("Cassandra Fetch..");
      // let bid_range = get_bucket_id_range(req.from, req.to);
      // let order = req.order || "DESC";
      // console.log(bid_range);
      // bid_range.forEach((bid) => {
      //     let query = "SELECT * FROM api_events WHERE bucket_id = '"+bid+"' ORDER BY event_timestamp' "+order;
      //
      //     let options = {pageState: null, prepare: 1, fetchSize: req.fetchSize};
      //     log.info("Streaming the results now..")
      //     this.exec(client_identity, query, options);
      // });
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
      if(this.client_state[client_identity] !== 'alive') {
        console.log('Client triggered termination.');
      }
      if(result && result.meta && result.meta.pageState && this.client_state[client_identity] == 'alive') {
        options['pageState'] = result.meta.pageState.toString('hex');
        this.exec(client_identity, query, options);
      } else {
        log.info("Nothing left to paginate.");
      }
    });
  }

}

var get_date_from_bucket_id = function(bucket_id) {
  var bid = bucket_id;
  var y = bid.split("_");
  return y[1]+"-"+y[2]+"-"+y[3];
};

var get_bucket_id_range = function(_from, _to) {
  let startDate = get_date_from_bucket_id(_from);
  let stopDate = get_date_from_bucket_id(_to);
  var bids = getDates(new Date(startDate), new Date(stopDate));
  return bids;
};


// Returns an array of dates between the two dates
var getDates = function(startDate, endDate) {
  var dates = [],
      currentDate = startDate,
      addDays = function(days) {
        var date = new Date(this.valueOf());
        date.setDate(date.getDate() + days);
        return date;
      };
  while (currentDate <= endDate) {
    dates.push("date_"+moment(currentDate).format('YYYY_MM_DD'));
    currentDate = addDays.call(currentDate, 1);
  }
  return dates;
};


module.exports = ZeromqServerService;
