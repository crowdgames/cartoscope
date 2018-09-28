/**
 * Created by kiprasad on 18/08/16.
 */
var app = angular.module('app', []);

app.controller('controller', function($scope, $http) {
  // $http.get('http://localhost:8080/api/user').then(function(response) {
  //   console.log(response.data);
  //   $scope.data = response.data;
  // }, function(response) {
  //   console.log(response);
  //   $scope.data = 'NOT LOGGED IN';
  //   document.location.href = '/index.html';
  // });
  
  $scope.createProject = function() {
    
    var fd = new FormData();
    fd.append('photo', $scope.projectData.pic);
    fd.append('name', $scope.projectData.name);
    fd.append('description', $scope.projectData.desc);
    
    $http.post('api/project/test', fd, {
      transformRequest: angular.identity,
      headers: {'Content-Type': undefined}
    }).then(function(response) {
      //console.log(response);
      var data = response.data;
      
    }, function(response) {
      window.alert('error');
    });
  };
});

app.directive('fileModel', ['$parse', function($parse) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      var model = $parse(attrs.fileModel);
      var modelSetter = model.assign;
      
      element.bind('change', function() {
        scope.$apply(function() {
          modelSetter(scope, element[0].files[0]);
        });
      });
    }
  };
}]);
