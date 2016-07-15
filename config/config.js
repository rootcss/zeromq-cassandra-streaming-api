'use strict';

const Config = {

    cassandra: {
        contactPoints: [
            process.env.CASSANDRA_SERVER1,
            process.env.CASSANDRA_SERVER2,
            process.env.CASSANDRA_SERVER3
        ],
        creds: {
            username: process.env.CASSANDRA_USERNAME,
            password: process.env.CASSANDRA_PASSWORD
        },
        events_keyspace: process.env.CASSANDRA_EVENTS_KEYSPACE_NAME
    },

    zeromq_server: {
      connection_url: 'tcp://127.0.0.1:12345',

    }
}

module.exports = Config;
