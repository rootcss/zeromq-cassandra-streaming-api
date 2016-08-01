# zeromq-cassandra-streaming-api
Streaming Cassandra's query result over ZeroMQ sockets

<b>To start the server:</b><br>
Setup following env variables
<pre>
export NODE_ENV=development
export CASSANDRA_SERVER1=192.168.56.101
export CASSANDRA_SERVER2=192.168.56.101
export CASSANDRA_SERVER3=192.168.56.101
export CASSANDRA_USERNAME=
export CASSANDRA_PASSWORD=
export CASSANDRA_EVENTS_KEYSPACE_NAME=simpl_events_production
</pre>

<b>Start server using:</b> `LOG_LEVEL=INFO node server.js`
<br>
In a separate tab, <b>start client using:</b> `node client.js`
<br><br>
There are several ways you can request for data streams:<br>
1. <b>cassandra_query</b>
<pre>
var req_args = {
  'domain': 'cassandra_query',
  'query': "SELECT bucket_id, dateOf(event_timestamp) AS d FROM api_events LIMIT 200000",
  'fetchSize': 5,
}
socket.send(JSON.stringify(req_args));
</pre>
<br>
2. <b>cassandra_fetch</b>
<pre>
var req_args = {
  'domain': 'cassandra_fetch',
  'from': 'date_2016_02_01',
  'to': 'date_2016_05_25',
  'fetchSize': 10,
}
socket.send(JSON.stringify(req_args));
</pre>

Check out sample clients `client.js`, `client2.js`, `client_c_fetch.js` etc.
