(function () {
    'use strict';

    angular
        .module('app')
        .config(appConfig);

    // @ngInject
    function appConfig($compileProvider) {
        $compileProvider.debugInfoEnabled(true);
    }
    appConfig.$inject = ['$compileProvider'];
})();