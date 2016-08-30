var nr = require('newrelic');

var app = require('http').createServer();
var io = require('socket.io')(app);
var request = require('request');

var port = 5000 || process.env.PORT;

// TODO: Replace with Consul Lookup
const STATE_SERVER = `http://${process.env.STATE_SERVER}` || 'http://dancefloor:5001';

console.log('listening on port', port);
app.listen(port);

function handler (req, res) {
  res.writeHead(200);
  res.end('socket.io');
}

io.on('connection', function(socket) {
  socket.on('add', nr.createWebTransaction('websocket/add', function(data) {
    console.log('add', data);

    request
      .get(STATE_SERVER + '/add?' + require('querystring').stringify(data))
      .on('response', function(response) {
        socket.broadcast.emit('add', data);
        nr.endTransaction();
      })
      .on('error', function(err) {
         console.log(err);
         nr.endTransaction();
       });
  }));

  socket.on('del', nr.createWebTransaction('websocket/del', function(data) {
    console.log('del', data);

    request
      .get(STATE_SERVER + '/del?' + require('querystring').stringify(data))
      .on('response', function(response) {
        socket.broadcast.emit('del', data);
        nr.endTransaction();
       })
      .on('error', function(err) {
         console.log(err);
         nr.endTransaction();
      });
  }));

  socket.on('bounce', nr.createWebTransaction('websocket/bounce', function(data) {
    socket.broadcast.emit('bounce', data);
    nr.endTransaction();
  }));

  socket.on('move', nr.createWebTransaction('websocket/move', function(data) {
    request
      .get(STATE_SERVER + '/move?' + require('querystring').stringify(data))
      .on('response', function(response) {
        socket.broadcast.emit('move', data);
        nr.endTransaction();
       })
      .on('error', function(err) {
         console.log(err);
         nr.endTransaction();
       });
  }));

  socket.on('disconnect', function() {
     var data = {id: socket.id.substring(2)};
     console.log('disconnect:', data);

     request
      .get(STATE_SERVER + '/del?' + require('querystring').stringify(data))
      .on('response', function(response) {
        socket.broadcast.emit('del', data);
        nr.endTransaction();
       })
      .on('error', function(err) {
         console.log(err);
         nr.endTransaction();
      });
  });

});

