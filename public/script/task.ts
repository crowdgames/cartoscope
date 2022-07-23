/**
 * Created by kiprasad on 26/09/16.
 */
var taskApp = angular.module('taskApp', ['ui.router', 'ngMap','configApp','ngJuxtapose', 'ngSanitize']);
let shuffle = (inA: Array<any>) => {
  let a = inA.slice(0);
  for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

//change \n to br
taskApp.filter("textBreaks", ['$sce', function ($sce) {
    return function (x: any) {
        if (x){
            // var new_text = x.replace(new RegExp('\\n', 'g'), '<br/>');
            var new_text = x.replace(/\\n/g, "<br/>");
            // new_text = x.replace(/n/g, "<br/>");
            //trim first and last quote:
            new_text =  new_text.slice(1,-1);
            return $sce.trustAsHtml(new_text);
        } else {
            return(x)
        }
    }
}]);

var latCenter: any;
var lngCenter: any;
var dZoom = 15;

taskApp.config(['$locationProvider', function($locationProvider: any) {
  // $locationProvider.html5Mode({
  //   enabled: true,
  //   requireBase: false,
  // });
}]);

taskApp.config(function($stateProvider: any, $urlRouterProvider: any) {
  
  $stateProvider.state({
    name: 'tasks',
    url: '/',
    templateUrl: 'templates/tasks/taskTemplate.html',
    controller: 'taskController',
      controllerAs: 'model',
    resolve: {
      userData: ['$http', function($http: any) {
        return $http.get('/api/user').then(function(data: any) {
          return data.data[0];
        }).catch(function() {
          return null;
        });
      }]
    }
  });

    $stateProvider.state({
        name: 'tasks_genetic',
        url: '/genetic',
        templateUrl: 'templates/tasks/taskTemplateGenetic.html',
        controller: 'geneticTaskController',
        controllerAs: 'model',
        resolve: {
            userData: ['$http', function($http: any) {
                return $http.get('/api/user').then(function(data: any) {
                    return data.data[0];
                }).catch(function() {
                    return null;
                });
            }]
        }
    });
  
  $urlRouterProvider.otherwise('/');
  
});

taskApp.controller('defaultController', ['$scope', '$location', function($scope, $location) {
  $scope.uiMask = {};
  $scope.uiMask.show = false;
}]);

// I deleted commented out map controller code here, see git if you want to look at it