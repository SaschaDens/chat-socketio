(function () {
    'use strict';

    angular
        .module('app')
        .config(Routing);

    Routing.$inject = ['$routeProvider'];

    function Routing($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: './app/chat/chat.html'
            })
            .otherwise('/');
    }
})();