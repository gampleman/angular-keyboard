'use strict';


  angular.module('exampleApp', [
  'ui.router'
  , 'angular-keyboard'
])
  .config(function ($stateProvider, $urlRouterProvider) {
    //delete $httpProvider.defaults.headers.common['X-Requested-With'];
    $urlRouterProvider.otherwise('/');
    $stateProvider
      .state('index', {
        url: '/',
        templateUrl: 'views/main.html',
        controller:'MainCtrl'
      })
      .state('overview', {
        url: '/overview',
        templateUrl: 'views/overview.html',
        controller:'MainCtrl'
      })
  })




