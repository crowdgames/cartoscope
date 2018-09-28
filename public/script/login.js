/**
 * Created by kiprasad on 03/08/16.
 */
var app = angular.module('app', []);

app.controller('loginController', ['$scope', '$http', '$location', function($scope, $http, $location) {
  $scope.userRegData = {};
  $scope.loginData = {};
  
  $scope.checkLogin = function() {
    $http.get('/api/user/').then(function(response) {
      window.location.replace('/UserProfile.html');
    }, function(response) {
        console.log('Not Authenticated');
        window.location.replace('/logon.html');
    });
  };
  $scope.checkLogin();
  
  $scope.register = function() {
    var fd = new FormData();
    fd.append('profilePic', $scope.myFile);
    
    if (!$scope.userRegData.username) {
      
      swal({
        title: 'Error!',
        confirmButtonColor: '#9cdc1f',
        allowOutsideClick: true,
        text: 'Please enter a username',
        type: 'error',
        confirmButtonText: 'Back'
      });
      return;
    } else {
      fd.append('username', $scope.userRegData.username);
    }
    
    if (!$scope.userRegData.password) {
      swal({
        title: 'Error!',
        confirmButtonColor: '#9cdc1f',
        allowOutsideClick: true,
        text: 'Please enter a password',
        type: 'error',
        confirmButtonText: 'Back'
      });
      return;
    } else if ($scope.userRegData.password != $scope.userRegData.repPassword) {
      swal({
        title: 'Error!',
        confirmButtonColor: '#9cdc1f',
        allowOutsideClick: true,
        text: 'Passwords do not match',
        type: 'error',
        confirmButtonText: 'Back'
      });
      return;
    } else {
      fd.append('password', $scope.userRegData.password);
    }
    
    if (!validateEmail($scope.userRegData.email)) {
      swal({
        title: 'Error!',
        confirmButtonColor: '#9cdc1f',
        allowOutsideClick: true,
        text: 'Invalid/Missing Email',
        type: 'error',
        confirmButtonText: 'Back'
      });
      return;
    } else {
      fd.append('email', $scope.userRegData.email);
    }
    if ($scope.userRegData.profilePic) {
      fd.append('profilePic', $scope.userRegData.profilePic);
    }
    
    if (!$scope.userRegData.agreePrivacyPolicy) {
      swal({
        title: 'Error!',
        confirmButtonColor: '#9cdc1f',
        allowOutsideClick: true,
        text: 'Please agree to our privacy policy',
        type: 'error',
        confirmButtonText: 'Back'
      });
      return;
    }
    
    fd.append('agreeMail', $scope.userRegData.agreeMail);
    fd.append('agreeNewProject', $scope.userRegData.agreeNewProject);
    
    $http.post('/api/user/register', fd, {
      transformRequest: angular.identity,
      headers: {'Content-Type': undefined}
    }).then(function(response) {
      var data = response.data;
      if ('id' in data) {
        document.location.href = '/index.html';
      }
    }, function(response) {
      var msg = response.data.error || 'error';
      swal({
        title: 'Error!',
        confirmButtonColor: '#9cdc1f',
        allowOutsideClick: true,
        text: msg,
        type: 'error',
        confirmButtonText: 'Back'
      });
    });
  };
  
  $scope.login = function() {
    var data = {};
    data.username = $scope.loginData.email;
    data.rememberMe = $scope.loginData.rememberMe;
    if (!data.username) {
      swal({
        title: 'Error!',
        confirmButtonColor: '#9cdc1f',
        allowOutsideClick: true,
        text: 'Invalid Username',
        type: 'error',
        confirmButtonText: 'Back'
      });
      return;
    }
    data.password = $scope.loginData.password;
    
    if (!data.password) {
      swal({
        title: 'Error!',
        confirmButtonColor: '#9cdc1f',
        allowOutsideClick: true,
        text: 'Please enter a password',
        type: 'error',
        confirmButtonText: 'Back'
      });
      return;
    }
    
    $http.post('api/login', data).then(function(response) {
      var data = response.data;
      if ('id' in data) {
        document.location.href = '/UserProfile.html#/';
      }
    }, function(response) {
      var msg = response.data.error || 'error';
      swal({
        title: 'Error!',
        confirmButtonColor: '#9cdc1f',
        allowOutsideClick: true,
        text: msg,
        type: 'error',
        confirmButtonText: 'Back'
      });
    });
  };
  
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
  
  $scope.$watch('userRegData.profilePic', function() {
    if ($scope.userRegData.profilePic) {
      handleImage($scope.userRegData.profilePic);
    }
  });
  
  function validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }
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

app.directive('ngEnter', function() {
  return function(scope, element, attrs) {
    element.bind('keydown keypress', function(event) {
      if (event.which === 13) {
        scope.$apply(function() {
          scope.$eval(attrs.ngEnter);
        });
        event.preventDefault();
      }
    });
  };
});
