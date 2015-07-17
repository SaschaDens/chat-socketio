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

var ERROR_MESSAGE_TIMEOUT = 10;

var users = [],
    usersConnected = 0,
    config = {
        maxPostPerTimeFrame: 4,
        timeFrame: (1000 * 30)
    };
io.on('connection', function (socket) {
    var d = new Date();

    socket.user = {
        id: socket.id,
        nickname: 'not set yet',
        connectedOn: +d,
        postPerTimeFrame: 0,
        startTimeFrame: 0
    };

    socket.on('add user', function (data) {
        users[socket.id] = socket.user;
        ++usersConnected;

        log('User joined: ' + data.nickname);
        socket.broadcast.emit('user joined', data);
    });

    socket.on('new message', function (data) {
        var user = socket.user,
            dateUnix = +(new Date()),
            endTimeFrame = user.startTimeFrame + config.timeFrame;

        if (dateUnix > endTimeFrame) {
            user.postPerTimeFrame = 0;
        }

        if (user.postPerTimeFrame < config.maxPostPerTimeFrame) {
            user.startTimeFrame = dateUnix;
            ++user.postPerTimeFrame;

            log(data);
            socket.broadcast.emit('new message', data);
            data.nickname = 'You'; // TODO: make this more clear + Translate
            socket.emit('new message', data);
        } else {
            broadcastUserError('new message', ERROR_MESSAGE_TIMEOUT, {
                timeoutEnds: endTimeFrame
            });
        }
    });

    socket.on('disconnect', function ( ) {
        --usersConnected;
        delete users[socket.id];

        socket.broadcast.emit('user left', {
            nickname: socket.user,
            usersConnected: usersConnected
        });
    });

    function broadcastUserError(eventName, errorCode, details) {
        var detailed = details || {};
        socket.emit('userError', {
            event: eventName,
            code: errorCode,
            details: detailed
        });
    }
});

app.get('/ping', function (req, resp) {
    resp.send('pong');
});

function log(msg) {
    console.log(msg);
}

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