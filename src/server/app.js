'use strict';

var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io')(server),
    cors = require('cors'),
    port = process.env.PORT || 8080,
    env = process.env.NODE_ENV,
    pkg = require('./../../package.json');

app.use(cors());

app.get('/ping', function (req, resp) {
    resp.send('pong');
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

app.listen(port, function () {
    console.log('******************************');
    console.log('Running chat-socketIO server');
    console.log('Listening on port: ' + port);
    console.log('Environment: ' + env);
    console.log('******************************');
});