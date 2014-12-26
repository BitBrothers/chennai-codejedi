angular.module('GoaHack', ['ngResource', 'ngMessages', 'ngRoute', 'ngAnimate',
						'mgcrea.ngStrap', 'multi-select', 'wu.masonry', 
						'angular-carousel', 'angularFileUpload', 
						'angular-flexslider', 'googlechart', 'ui.knob', 
						'angularTypewrite', 'uiGmapgoogle-maps'])
  .config(function ($routeProvider, $locationProvider) {
    $locationProvider.html5Mode(true);

    $routeProvider
      .when('/', {
        templateUrl: 'views/home.html',
        controller: 'HomeCtrl'
      })
      .when('/login', {
        templateUrl: 'views/login.html',
        controller: 'LoginCtrl'
      })
	  .when('/signup', {
        templateUrl: 'views/signup.html',
        controller: 'SignupCtrl'
      })
	  .when('/teams', {
        templateUrl: 'views/teams.html',
        controller: 'TeamsCtrl'
      })
	  .when('/teams/:id', {
        templateUrl: 'views/teamdetails.html',
        controller: 'TeamDetailsCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  })
  .config(function ($httpProvider) {
    $httpProvider.interceptors.push(function ($rootScope, $q, $window, $location) {
      return {
        request: function(config) {
          if ($window.localStorage.token) {
            config.headers.Authorization = 'Bearer ' + $window.localStorage.token;
          }
          return config;
        },
        responseError: function(response) {
          if (response.status === 401 || response.status === 403) {
            $location.path('/login');
          }
          return $q.reject(response);
        }
      }
    });
  });