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

<b>Start server using:</b> `LOG_LEVEL=INFO node app.js`
<br>
In a separate tab, <b>start client using:</b> `node client.js`
