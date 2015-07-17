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

        socketio.userErrors(function (error){
            if (error.code === 10) {
                var expireDate = moment(error.details.timeoutEnds),
                    currentDate = moment(),
                    timeoutEnds = expireDate.subtract(currentDate);

                vm.messages.push({
                    nickname: 'Server',
                    message: 'You tried to submit multiple messages on a short ' +
                        'time. Try again in ' + moment.duration(timeoutEnds).humanize()
                });
            }
        });

        this.sendMessage = function () {
            var data = {
                nickname: vm.nickname,
                message: vm.message
            };

            vm.message = '';
            socketio.sendMessage(data);
        };

        this.setNickname = function () {
            this.hideChat = false;
            socketio.setNickname(vm.nickname);
        };
    }
})();