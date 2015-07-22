describe('ChatController test', function () {

    describe('ChatController', function () {
        var mockSocketIo = {
                getMessage: function () {},
                userJoined: function () {},
                userErrors: function () {}
            },
            $controller;

        beforeEach(module('app.chat', function ($provide) {
            $provide.value('socketio', mockSocketIo);
        }));

        beforeEach(inject(function (_$controller_) {
            $controller = _$controller_;
        }));

        it('should set the default value of hideChat', function () {
            var $scope = {
                    hideChat: true
                },
                controller = $controller('ChatController', { $scope: $scope });
            expect($scope.hideChat).toBe(true);
        });
    });
});