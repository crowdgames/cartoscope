/**
 * Created by kiprasad on 02/08/16.
 */
var app = angular.module('app', []);

app.controller('controller', function($scope, $http) {
  $http.get('/api/user').then(function(response) {
    console.log(response.data);
    $scope.data = response.data;
  }, function(response) {
    console.log(response);
    $scope.data = 'NOT LOGGED IN';
  });
  $scope.login = function() {
    console.log($scope.user);
    $http.post('/api/login', $scope.user);
  };

  $scope.call = function() {
    $http.get('/api/user').then(function(response) {
      console.log(response.data);
      $scope.data = response.data;
    }, function(response) {
      console.log(response);
      $scope.data = 'NOT LOGGED IN';
    });
  };

  $scope.logout = function($window) {
    $http.get('/api/logout').then(function(response) {
        $window.location.href='#/login';
    });
  };
});
