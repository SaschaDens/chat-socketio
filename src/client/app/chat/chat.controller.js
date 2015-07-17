(function () {
    'use strict';

    angular
        .module('app.chat')
        .controller('ChatController', Chat);

    Chat.$inject = ['socketio'];

    function Chat(socketio) {
        var vm = this;

        this.nickname = '';
        this.hideChat = true;

        this.messages = [];
        this.message = '';

        socketio.getMessage(function (data) {
            vm.messages.push(data);
        });

        socketio.userJoined(function (data) {
            vm.messages.push({
                nickname: data.nickname,
                message: 'joined the chat'
            });
        });

        this.sendMessage = function () {
            var data = {
                nickname: vm.nickname,
                message: vm.message
            };

            vm.message = '';
            vm.messages.push({
                nickname: 'You',
                message: data.message
            });
            socketio.sendMessage(data);
        };

        this.setNickname = function () {
            this.hideChat = false;
            socketio.setNickname(vm.nickname);
        };
    }
})();