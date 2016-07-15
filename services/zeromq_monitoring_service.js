'use strict';

class ZeromqMonitoringService {
  constructor(socket) {
    this.socket = socket;
  }

  initiateMonitoring(socket) {
    this.initiateEventListerners();
    // Handling monitor error
    this.socket.on('monitor_error', function(err) {
        log.error('Error in monitoring: %s, will restart monitoring in 5 seconds', err);
        setTimeout(function() { this.socket.monitor(500, 0); }, 5000);
    });
    // Call monitor, check for events every 500ms and get all available events.
    log.info('Monitoring initiated..');
    this.socket.monitor(500, 0);
  }

  initiateEventListerners() {
    // Register to monitoring events
    this.socket.on('connect', function(fd, ep) {log.info('connect, endpoint:', ep);});
    this.socket.on('connect_delay', function(fd, ep) {log.info('connect_delay, endpoint:', ep);});
    this.socket.on('connect_retry', function(fd, ep) {log.info('connect_retry, endpoint:', ep);});
    this.socket.on('listen', (fd, ep) => this.onListen(fd, ep));
    this.socket.on('bind_error', function(fd, ep) {log.info('bind_error, endpoint:', ep);});
    this.socket.on('accept', function(fd, ep) {log.info('accept, endpoint:', ep);});
    this.socket.on('accept_error', function(fd, ep) {log.info('accept_error, endpoint:', ep);});
    this.socket.on('close', function(fd, ep) {log.info('close, endpoint:', ep);});
    this.socket.on('close_error', function(fd, ep) {log.info('close_error, endpoint:', ep);});
    this.socket.on('disconnect', (fd, ep) => this.onDisconnect(fd, ep));
  }

  onDisconnect(fd, ep) {
    log.debug('disconnect, endpoint:', ep);
    log.info('Socket disconnected.');
  }

  onListen(fd, ep) {
    log.info('listen, endpoint:', ep);
  }
}

module.exports = ZeromqMonitoringService;
