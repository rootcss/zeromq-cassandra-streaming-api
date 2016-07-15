var cluster = require('cluster')
  , zeromq = require('zmq')
  , port = 'tcp://127.0.0.1:12345';

var socket = zeromq.socket('dealer');
socket.identity = 'C-' + process.pid;
socket.connect(port);
console.log('Connected on '+port);


socket.send('get_me_stuff');
// receving the data from server
socket.on('message', function(data) {
  console.log('[' + socket.identity + ']: ' + data);
});



// var cluster = require('cluster')
//   , zeromq = require('zmq')
//   , port = 'tcp://127.0.0.1:12345';
//
// var socket = zeromq.socket('dealer');
// socket.identity = 'C-' + process.pid;
// socket.connect(port);
// console.log('Connected on '+port);
//
// //Asking for stuff
// setTimeout(function() {
//   socket.send('get_me_stuff');
//   // receving the data from server
//   socket.on('message', function(data) {
//     setTimeout(function() {
//       console.log('[' + socket.identity + ']: ' + data);
//     }, 300);
//   });
// }, 2000);
