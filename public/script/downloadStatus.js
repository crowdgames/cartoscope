/**
 * Created by kiprasad on 31/08/16.
 */
var app = angular.module('app', []);

var ctrl = app.controller('appController', ['$scope', '$http', '$interval', '$location',
  function($scope, $http, $interval, $location) {
    $scope.code = '';
    
    if ('id' in $location.search()) {
      $scope.code = $location.search().id;
    }
    
    $scope.doCall = function() {
      if ($scope.code) {
        var url = '/api/project/upload/status/' + $scope.code;
        $http.get(url).then(function(response) {
          $scope.result = response.data.status;
        }, function(response) {
          console.log(response);
          if (response && response.data) {
            alert(response.data.error);
          }
        });
        
      }
    };
    
    $interval(function() {
      if ($scope.code.length == 15) {
        $scope.doCall();
      }
    }, 30000);
    
    $scope.getText = function(code) {
      code = parseInt(code);
      if (code == 4) {
        return 'Successfully Downloaded';
      } else if (code < 0) {
        return 'Error with download';
      } else if (code == 1) {
        return 'Started downloading';
      } else if (code == 2) {
        return 'Downloaded';
      } else if (code == 3) {
        return 'Started unzipping';
      }
    };
  }]);

