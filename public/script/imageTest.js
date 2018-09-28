var app = angular.module('app', []);
app.controller('controller', ['$scope', '$http', function($scope, $http) {
  
  function handleImage(f) {
    var canvas = document.getElementById('imageCanvas');
    var ctx = canvas.getContext('2d');
    var reader = new FileReader();
    reader.onload = function(event) {
      var img = new Image();
      img.onload = function() {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(f);
  }
  
  $scope.myFile = null;
  
  $scope.$watch('myFile', function() {
    if ($scope.myFile) {
      handleImage($scope.myFile);
    }
  });
  $scope.fileUp = function() {
    console.log($scope.myFile);
    
    var fd = new FormData();
    fd.append('file', $scope.myFile);
    fd.append('username', 'Kisalaya');
    
    $http.post('http://localhost:8080/api/project/add', fd, {
        transformRequest: angular.identity,
        headers: {'Content-Type': undefined}
      })
      .success(function(data) {
        console.log(data);
        $http.post('http://localhost:8080/api/project/add', {data: 123, body: 1000});
      })
      .error(function() {
      });
  };
}]);

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
