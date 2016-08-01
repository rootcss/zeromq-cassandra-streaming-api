'use strict';
let moment = require('moment');

module.exports = {
  // get bucket_id range (array) from bid range
  // here _from, _to are bucket_id format - date_2016_02_01
  get_bucket_id_range: function(_from, _to) {
    let startDate = this.get_date_from_bucket_id(_from);
    let stopDate = this.get_date_from_bucket_id(_to);
    return this.get_bucket_id_array_from_date_range(new Date(startDate), new Date(stopDate));
  },

  // converts bucket_ids list into a format accepted by cassandra IN statement
  // ["date_2016_02_01", "date_2016_02_02"] => 'date_2016_02_01', 'date_2016_02_02'
  strigify_bucket_ids: function(bid_range) {
    return JSON.stringify(bid_range).replace(/]|[[]/g, '').replace(/['"]+/g, "'")
  },

  // sleep method
  // utility.sleep(1000, () => { // do stuff });
  sleep: function(time, callback) {
      let stop = new Date().getTime();
      while(new Date().getTime() < stop + time) {;}
      callback();
  },

  // timeuuid to LocaleString()
  get_timestamp_from_timeuuid: function(timeuuid) {
    return this.get_date_obj_from_timeuuid(timeuuid).toLocaleString();
  },

  //
  // All method below this are mainly helper methods for above methods
  //
  // converts a bucket_id into date format
  // date_2016_02_01 => 2016-02-01
  get_date_from_bucket_id: function(bucket_id) {
    let bid = bucket_id;
    let y = bid.split("_");
    return y[1]+"-"+y[2]+"-"+y[3];
  },

  get_bucket_id_array_from_date_range: function(startDate, endDate) {
    let dates = [],
        currentDate = startDate,
        addDays = function(days) {
          let date = new Date(this.valueOf());
          date.setDate(date.getDate() + days);
          return date;
        };
    while (currentDate <= endDate) {
      dates.push("date_"+moment(currentDate).format('YYYY_MM_DD'));
      currentDate = addDays.call(currentDate, 1);
    }
    return dates;
  },

  get_time_int_from_timeuuid: function (uuid_str) {
      let uuid_arr = uuid_str.split( '-' ),
          time_str = [
              uuid_arr[ 2 ].substring( 1 ),
              uuid_arr[ 1 ],
              uuid_arr[ 0 ]
          ].join( '' );
      return parseInt( time_str, 16 );
  },

  get_date_obj_from_timeuuid: function (uuid_str) {
      let int_time = this.get_time_int_from_timeuuid( uuid_str ) - 122192928000000000,
          int_millisec = Math.floor( int_time / 10000 );
      return new Date( int_millisec );
  },

}

// Example:
// 'use strict';
// let utility = require('./services/utility_service.js');
// utility.sleep(1000, () => {
//   let bid_range = utility.strigify_bucket_ids(utility.get_bucket_id_range('date_2016_02_01','date_2016_05_25'));
//   console.log(bid_range);
// });
