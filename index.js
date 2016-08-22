require('newrelic');

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
  socket.on('add', function(data) {
    console.log('add', data);

    request
      .get(STATE_SERVER + '/add?' + require('querystring').stringify(data))
      .on('response', function(response) {
        console.log(response.statusCode);
       })
      .on('error', function(err) {
         console.log(err);
       });

    socket.broadcast.emit('add', data);
  });

  socket.on('del', function(data) {
    console.log('del', data);

    request
      .get(STATE_SERVER + '/del?' + require('querystring').stringify(data))
      .on('response', function(response) {
        console.log(response.statusCode);
       })
      .on('error', function(err) {
         console.log(err);
       });

    socket.broadcast.emit('del', data);
  });

  socket.on('bounce', function(data) {
    socket.broadcast.emit('bounce', data);
  });

  socket.on('move', function(data) {
    console.log('move', data);

    request
      .get(STATE_SERVER + '/move?' + require('querystring').stringify(data))
      .on('response', function(response) {
        console.log(response.statusCode);
       })
      .on('error', function(err) {
         console.log(err);
       });

    socket.broadcast.emit('move', data);
  });

  socket.on('disconnect', function() {
    console.log('disconnect');
  });

});

