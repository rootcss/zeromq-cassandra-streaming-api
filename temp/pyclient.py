import socket
import sys
import json
import time

try:
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
except socket.error:
    print 'Failed to create socket'
    sys.exit()
print 'Socket Created'

host = '127.0.0.1';
port = 12345;

try:
    remote_ip = socket.gethostbyname( host )
except socket.gaierror:
    print 'Hostname could not be resolved. Exiting'
    sys.exit()

s.connect((remote_ip , port))
print 'Socket Connected to ' + host + ' on ip ' + remote_ip

message = json.dumps({  'domain': 'cassandra_query',
                        'query': "SELECT * FROM api_events LIMIT 4",
                        'fetchSize': 2
                    })
print message
try :
    s.sendall(message)
except socket.error:
    print 'Send failed'
    sys.exit()
print 'Message sent successfully'

def recv_timeout(the_socket,timeout=2):
    the_socket.setblocking(0)
    total_data=[];
    data='';
    begin=time.time()
    while 1:
        if total_data and time.time()-begin > timeout:
            break
        elif time.time()-begin > timeout*2:
            break
        try:
            data = the_socket.recv(8192)
            if data:
                total_data.append(data)
                begin=time.time()
            else:
                time.sleep(0.1)
        except:
            pass
    return ''.join(total_data)

print recv_timeout(s)
s.close()
