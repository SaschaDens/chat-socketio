(function () {
    'use strict';

    angular
        .module('app.service')
        .factory('socketio', Socketio);

    // @ngInject
    function Socketio ($rootScope) {

        var socket = window.io(),
            service = {
                connect: connect,
                disconnect: disconnect,
                setNickname: setNickname,
                getMessage: getMessage,
                sendMessage: sendMessage,
                userJoined: userJoined,
                userErrors: userErrors
            };

        return service;

        function on(eventName, callback) {
            socket.on(eventName, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    callback.apply(socket, args);
                });
            });
        }

        function emit(eventName, data, callback) {
            socket.emit(eventName, data, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    callback.apply(socket, args);
                });
            });
        }

        function connect() {
            socket.connect();
        }

        function disconnect() {
            socket.disconnect();
        }

        function setNickname(name) {
            var data = {
                nickname: name
            };
            emit('add user', data);
        }

        function getMessage(callback) {
            on('new message', callback);
        }

        function sendMessage(data) {
            emit('new message', data);
        }

        function userJoined(callback) {
            on('user joined', callback);
        }

        function userErrors(callback) {
            on('userError', callback);
        }
    }
})();