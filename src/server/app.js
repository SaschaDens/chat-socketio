'use strict';

var express = require('express'),
    app = express(),
    server = require('http').Server(app),
    io = require('socket.io')(server),
    cors = require('cors'),
    port = process.env.PORT || 8080,
    env = process.env.NODE_ENV,
    pkg = require('./../../package.json');

app.use(cors());

app.get('/ping', function (req, resp) {
    resp.send('pong');
});

var users = [];
io.on('connection', function (socket) {
    socket.on('add user', function (data) {
        var extendedData = {
            socket: socket,
            nickname: data.nickname
        };
        users.push(extendedData);

        console.log('User joined: ' + data.nickname);
        socket.broadcast.emit('user joined', data);
    });

    socket.on('new message', function (data) {
        console.log(data);
        socket.broadcast.emit('new message', data);
    });
});

switch (env) {
    case 'production':
        app.use('/', express.static(pkg.paths.production));
        break;
    case 'staging':
        app.use('/', express.static(pkg.paths.staging));
        break;
    default:
        app.use('/bower_components', express.static('./bower_components'));
        app.use('/', express.static(pkg.paths.client));
        break;
}

server.listen(port, function () {
    console.log('******************************');
    console.log('Running chat-socketIO server');
    console.log('Listening on port: ' + port);
    console.log('Environment: ' + env);
    console.log('******************************');
});