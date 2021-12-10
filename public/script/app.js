/**
 * Created by kiprasad on 12/09/16.
 */
var module = angular.module('app', ['ui.router', 'angucomplete-alt', 'ngAnimate','uiGmapgoogle-maps','configApp','ngFileUpload'])

    .config(['uiGmapGoogleMapApiProvider', function (GoogleMapApi) {
        GoogleMapApi.configure({
            key: 'AIzaSyAL32H2arSyCcBfcD49o1wG32pkHaNlOJE',
            // v: '3.20',
            libraries: 'weather,geometry,visualization'
        });
    }]);



// .config(['uiGmapGoogleMapApiProvider', function (GoogleMapApi) {
//     GoogleMapApi.configure({
//         key: 'AIzaSyCf3OMpW858s0Vs3oR6kVtiMo8vz_q_lwM',
//         // v: '3.20',
//         libraries: 'weather,geometry,visualization'
//     });
// }]);



module.run(['$state', '$rootScope', function($state, $rootScope) {
  $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
    event.preventDefault();
    if (toState.name.indexOf('root.projectEdit') != -1) {
      $state.go('root.projects');
    } else if (!fromState.views) {
      $state.go('root.home');
    }
  });
}]);

module.config(function($stateProvider, $urlRouterProvider, $httpProvider) {

   $httpProvider.interceptors.push('busyIndicator');

    $stateProvider.state({
        name: 'login',
        url: '/login',
        templateUrl: 'logon.html',
        controller: 'loginController'
    });

    $stateProvider.state({
        name: 'cmnh',
        url: '/museum',
        controller: function($scope, $window) {
            $window.location.href = '/algalBloom.html';
        }
    });

    $stateProvider.state({
        name: 'kioskProject',
        url: '/kioskProject/:pCode',
        controller: function($scope, $window, $stateParams) {
            $window.location.href = '/kioskProject.html#/kioskStart/' + $stateParams.pCode;
        }
    });

    $stateProvider.state({
        name: 'landlossProject',
        url: '/hglandloss',
        controller: function($scope, $window, $stateParams) {

            $window.location.href = '/kioskProject.html#/hg_landloss';
        }
    });

  $stateProvider.state({
    name: 'newHomePage',
    url: '/home',
    templateUrl: 'new_homepage.html',
    controller: ['$scope', '$http', '$location', '$window', function($scope, $http, $location,$window) {

      //Get all public projects:
      $http({
        method: 'GET',
        url: '/api/project/getProjects/public'
      }).then(function successCallback(response) {
        $scope.projects = response.data;

        //Filter out archived, unpublished and private projects:
        $scope.projects = $scope.projects.filter(function(project) { return (project.archived === 0 && project.published === 1 && project.access_type === 0)});
      }, function errorCallback(response) {
        $scope.projects = [];
      });
      $scope.getRandomClass = function() {

        var rand = Math.floor(Math.random() * 4);
        if(rand === 0){
          return "project-box-bkg1";
        } else if(rand === 1){
          return "project-box-bkg2";
        } else if(rand === 2){
          return "project-box-bkg3";
        } else {
          return "project-box-bkg4";
        }
      };

      //Go to featured project
      $scope.goToFeatured = function() {
          $window.location.href = '/api/featured'
      };

      //Go to project subpage
      $scope.goToProject = function(code) {
          $window.location.href = '/kioskProject.html#/kioskStart/' + code;
        };

      window.makeLinkActive = function(link){
        $("#nav-link").find(".active").removeClass("active");
        if(link === "top"){
          $("#top-link").addClass("active");
        }
        if(link === "projects"){
          $("#projects-link").addClass("active");
        }
        if(link === "abt-us"){
          $("#abt-us-link").addClass("active");
        }
        if(link === "contact-us"){
          $("#contact-us-link").addClass("active");
        }
      };

      var controller = new ScrollMagic.Controller();

      var topPanel = new ScrollMagic.Scene({
        triggerElement: "#logo-img",
        triggerHook: 0
      }).addTo(controller);

      topPanel.on("start", function() {
        window.makeLinkActive("top");
      });


      var projectPanel = new ScrollMagic.Scene({
        triggerElement: "#projects-panel",
        triggerHook: 0
      }).addTo(controller);

      projectPanel.on("start", function() {
        window.makeLinkActive("projects");
      });

      var abtUsPanel = new ScrollMagic.Scene({
        triggerElement: "#about-us-panel",
        triggerHook: 0
      }).addTo(controller);

      abtUsPanel.on("start", function() {
        window.makeLinkActive("abt-us");
      });

      var contactUsPanel = new ScrollMagic.Scene({
        triggerElement: "#contact-us",
        triggerHook: 0.75
      }).addTo(controller);

      contactUsPanel.on("start", function() {
        window.makeLinkActive("contact-us");
      });
    }]
  });

    $stateProvider.state({
        name: 'newHomePageAR',
        url: '/home_ar',
        templateUrl: 'new_homepage_ar.html',
        controller: ['$scope', '$http', '$location', '$window', function($scope, $http, $location,$window) {

            //Go to featured project
            $scope.goToAR = function() {
                //$window.location.href = '/ar'
                $window.open(
                    '/ar_apk',
                    '_blank' // <- This is what makes it open in a new window.
                );
            };

            //Go to tags pdf
            $scope.goToARTags = function() {
                //$window.location.href = '/ar'
                $window.open(
                    '/ar_tags',
                    '_blank' // <- This is what makes it open in a new window.
                );
            };


            //Go to featured project
            $scope.goToARGames = function() {
                //$window.location.href = '/ar'
                $window.open(
                    '/ar_games',
                    '_blank' // <- This is what makes it open in a new window.
                );
            };

            //Go to project subpage
            $scope.goToProject = function(code) {
                $window.location.href = '/kioskProject.html#/kioskStart/' + code;
            };



            var controller = new ScrollMagic.Controller();

            var topPanel = new ScrollMagic.Scene({
                triggerElement: "#logo-img",
                triggerHook: 0
            }).addTo(controller);

            topPanel.on("start", function() {
                window.makeLinkActive("top");
            });


            var projectPanel = new ScrollMagic.Scene({
                triggerElement: "#projects-panel",
                triggerHook: 0
            }).addTo(controller);

            projectPanel.on("start", function() {
                window.makeLinkActive("projects");
            });

            var abtUsPanel = new ScrollMagic.Scene({
                triggerElement: "#about-us-panel",
                triggerHook: 0
            }).addTo(controller);

            abtUsPanel.on("start", function() {
                window.makeLinkActive("abt-us");
            });

            var contactUsPanel = new ScrollMagic.Scene({
                triggerElement: "#contact-us",
                triggerHook: 0.75
            }).addTo(controller);

            contactUsPanel.on("start", function() {
                window.makeLinkActive("contact-us");
            });
        }]
    });

    $stateProvider.state({
        name: 'inatReportProject',
        url: '/inat_report_view/:session_id/:code',
        templateUrl: '../templates/inatReport.html',
        controller: 'inatReportController'
    });


    $stateProvider.state({
    name: 'noLoggedIn',
    url: '/login',
    templateUrl: 'logon.html',
    controller: 'loginController'
  });

  $stateProvider.state({
      name: 'noLoggedIn.about',
      url: '/about',
      templateUrl: 'templates/home/about.html'
  });
  $stateProvider.state({
      name: 'noLoggedIn.terms',
      url: '/terms',
      templateUrl: 'templates/home/tandc.html'
  });
  $stateProvider.state({
      name: 'noLoggedIn.contact',
      url: '/contact-us',
      templateUrl: 'templates/home/contact-us.html'
  });

  $stateProvider.state({
    name: 'root',
    abstract: true,
    resolve: {
      userData: ['$http', function($http) {
          /**
           * A frontend call to get the details of the user where id is provided from the session and details are returned from the users
           * table in database.
           */
        return $http.get('/api/user').then(function(data) {
          return data.data[0];
        }).catch(function() {
          return undefined;
        });
      }]
    },
    onEnter: function(userData, $state) {
      if (!userData) {
        $state.go('noLoggedIn');
      }
    },
    templateUrl: 'templates/userProfile/pageTemplate.html',
    //  templateUrl: 'templates/userProfile/welcomeTemplate.html',
    controller: 'appController'
  });

  $stateProvider.state({
    name: 'root.home',
    url: '/home/old',
    //templateUrl: 'templates/userProfile/appDefault.html',
    //controller: 'defaultController'
     templateUrl: 'templates/userProfile/showAllProjects.html',
     controller: 'projectsController',
     controllerAs: 'model',
  });

  $stateProvider.state({
    name: 'root.userProfile',
    url: '/profile',
    templateUrl: 'templates/userProfile/userProfileTemplate.html',
    controller: 'userProfileController'
  });

    $stateProvider.state({
        name: 'root.about',
        url: '/about',
        templateUrl: 'templates/userProfile/about.html'
    });
    $stateProvider.state({
        name: 'root.terms',
        url: '/terms',
        templateUrl: 'templates/userProfile/tandc.html'
    });
    $stateProvider.state({
        name: 'root.contact',
        url: '/contact-us',
        templateUrl: 'templates/userProfile/contact-us.html'
    });

  $stateProvider.state({
    name: 'root.projects',
    url: '/projects',
    templateUrl: 'templates/project/projectsPageTemplate.html',
    controller: 'projectsPageController',
    resolve: {
      projects: ['$http', function($http) {
        return $http.get('/api/user/projects').then(function(data) {
          return data.data;
        }).catch(function(error) {
          return undefined;
        });
      }]
    }
  });


  $stateProvider.state({
    name: 'root.project',
    url: '/project/view/:id',
    templateUrl: 'templates/project/projectPageTemplate.html',
    controller: 'projectPageController',
    resolve: {
      projectData: ['$http', '$stateParams', function($http, $stateParams) {
        return $http.get('/api/tasks/getInfoId/' + $stateParams.id).then(function(data) {
          return data.data;
        }).catch(function(error) {
          return undefined;
        });
      }]
    },
    onEnter: ['$state', 'projectData', '$timeout', function($state, projectData, $timeout) {
      $timeout(function() {
        if (!projectData) {
          $state.go('root.home');
        }
      }, 0);
    }]
  });

  $stateProvider.state({
    name: 'root.projectEdit',
    url: '/project/edit/:id',
    templateUrl: 'templates/userProfile/projectEditTemplate.html',
    params: {
      project: null
    },
    controller: 'projectEditController',
    abstract: true,
    resolve: {
      project: ['$stateParams', '$q', '$http', function($stateParams, $q, $http) {

        return $q(function(resolve, reject) {
          if ($stateParams.project && $stateParams.project.id) {
            resolve($stateParams.project);
          } else {
            $http.get('/api/tasks/getInfoId/' + $stateParams.id).then(function(data) {
              resolve(data.data);
            }).catch(function(error) {
              reject('server error');
            });
          }
        });
      }]
    }
  });

  $stateProvider.state({
    name: 'root.projectEdit.step1',
    url: '/step1',
    views: {
      'createProjChildView': {
        templateUrl: 'templates/userProfile/projectCreation/step1.html',
        controller: ['$scope','$http', 'project', 'swalService', function($scope, $http, project,swalService) {
          $scope.$on('validate', function(e) {
            $scope.validate();
          });


          if ($scope.project.hasOwnProperty('scistarter_link') && $scope.project.scistarter_link ){
              $scope.has_scistarter = true;
          }
          if ($scope.project.is_inaturalist) {
              $scope.project.is_inaturalist = true;
          }
          if ($scope.project.hasOwnProperty("external_sign_up") && $scope.project.external_sign_up){
                $scope.has_external_signup = true;
          }

          $scope.validate = function() {


                  var fd = new FormData();
                  if ($scope.coverPic) {
                      fd.append('file', $scope.coverPic);
                  }
                  fd.append('projectID', $scope.project.id);
                  fd.append('name', $scope.project.name);
                  fd.append('description', $scope.project.description);
                  fd.append('short_name', $scope.project.short_name);
                  fd.append('short_name_friendly', $scope.project.short_name_friendly);
                  fd.append('short_description', $scope.project.short_description);
                  fd.append('is_inaturalist', $scope.project.is_inaturalist ? 1 : 0);
                  if ($scope.has_scistarter){
                  fd.append('scistarter_link', $scope.project.scistarter_link);
                    }
                    if ($scope.has_external_signup){
                  fd.append('external_sign_up', $scope.project.external_sign_up);
                    }

                  console.log(fd)

                  $http.post('api/project/updateProjectInfoMain', fd, {
                      transformRequest: angular.identity,
                      headers: {'Content-Type': undefined}
                  }).then(function(dat) {
                  $scope.$emit('moveNext');
              }, function(response) {
                  var msg = response.data.error || 'couldn\'t save description at this time';
                  swalService.showErrorMsg(msg);
              })
              ;
          };
        }]
      }
    }
  });

  $stateProvider.state({
    name: 'root.projectEdit.step2',
    url: '/step2',
    views: {
      'createProjChildView': {
        templateUrl: 'templates/userProfile/projectCreation/step2.html',
        controller: 'stepTwoController'
      }
    }
  });

  $stateProvider.state({
    name: 'root.projectEdit.step3',
    url: '/step3',
    views: {
      'createProjChildView': {
        templateUrl: 'templates/userProfile/projectCreation/step3.html',
        controller: 'stepThreeController'
      }
    },
    resolve: {
      'admins': function($http, project) {
        return $http.get('/api/project/admins/' + project.id).then(function(data) {
          return data.data;
        }).catch(function(err) {
          return [];
        });
      }
    }
  });

  $stateProvider.state({
    name: 'root.projectEdit.step4',
    url: '/step4',
    views: {
      'createProjChildView': {
        templateUrl: 'templates/userProfile/projectCreation/step4.html',
        controller: 'stepFourController'
      }
    }
  });

  $stateProvider.state({
    name: 'root.projectEdit.step5',
    url: '/step5',
    views: {
      'createProjChildView': {
        templateUrl: 'templates/userProfile/projectCreation/step5.html',
        controller: 'stepFiveController'
      }
    }
  });

  $stateProvider.state({
    name: 'root.projectEdit.step6',
    url: '/step6',
    views: {
      'createProjChildView': {
        templateUrl: 'templates/userProfile/projectCreation/step6.html',
        controller: 'stepSixController'
      }
    }
  });

    $stateProvider.state({
        name: 'root.projectEdit.step7',
        url: '/step7',
        views: {
            'createProjChildView': {
                templateUrl: 'templates/userProfile/projectCreation/step7.html',
                controller: 'stepSevenController'
            }
        }
    });

  $stateProvider.state({
    name: 'root.projectCreation',
    url: '/project/new',
    templateUrl: 'templates/userProfile/newProjectTemplate.html',
    controller: 'projectCreationController',
    abstract: true
  });

  $stateProvider.state({
      name: 'root.getAllProjects',
      url: '/showAllProjects',
      templateUrl: 'templates/userProfile/showAllProjects.html',
      controller: 'projectsController',
      controllerAs : 'model'
  });

  $stateProvider.state({
      name: 'root.showProjectDetails',
      url: '/showProjectDetails',
      templateUrl: 'templates/userProfile/showProjectDetails.html',
      controller: 'projectController',
      params: {
          project: ''
      },
      controllerAs : 'model'
  });

    $stateProvider.state({
        name: 'root.showProjectResults',
        url: '/showProjectResults',
        templateUrl: 'templates/userProfile/showProjectResults.html',
        controller: 'projectController',
        params: {
            project: ''
        },
        controllerAs : 'model'
    });

  $stateProvider.state({
    name: 'root.projectCreation.step1',
    url: '/step1',
    views: {
      'createProjChildView': {
        templateUrl: 'templates/userProfile/projectCreation/step1.html',
        controller: 'stepOneController'
      }
    }
  });

  $stateProvider.state({
    name: 'root.projectCreation.step2',
    url: '/step2',
    views: {
      'createProjChildView': {
        templateUrl: 'templates/userProfile/projectCreation/step2.html',
        controller: 'stepTwoController'
      }
    },
    params: {
      project: null
    },
    resolve: {
      project: ['$stateParams', '$timeout', '$q', function($stateParams, $timeout, $q) {
        return $q(function(resolve, reject) {
          $timeout(function() {
            if ($stateParams.project && $stateParams.project.id) {
              resolve($stateParams.project);
            } else {
              reject('no id');
            }
          }, 50);
        });
      }]
    }
  });

  $stateProvider.state({
    name: 'root.projectCreation.step3',
    url: '/step3',
    views: {
      'createProjChildView': {
        templateUrl: 'templates/userProfile/projectCreation/step3.html',
        controller: 'stepThreeController'
      }
    },
    params: {
      project: null
    },
    resolve: {
      project: ['$stateParams', '$timeout', '$q', function($stateParams, $timeout, $q) {
        return $q(function(resolve, reject) {
          $timeout(function() {
            if ($stateParams.project && $stateParams.project.id) {
              resolve($stateParams.project);
            } else {
              reject('no id');
            }
          }, 50);
        });
      }],
      admins: function() {
        return [];
      }
    }
  });

  $stateProvider.state({
    name: 'root.projectCreation.step4',
    url: '/step4',
    views: {
      'createProjChildView': {
        templateUrl: 'templates/userProfile/projectCreation/step4.html',
        controller: 'stepFourController'
      }
    },
    params: {
      project: null
    },
    resolve: {
      project: ['$stateParams', '$timeout', '$q', function($stateParams, $timeout, $q) {
        return $q(function(resolve, reject) {
          $timeout(function() {
            if ($stateParams.project && $stateParams.project.id) {
              resolve($stateParams.project);
            } else {
              reject('no id');
            }
          }, 50);
        });
      }]
    }
  });

  $stateProvider.state({
    name: 'root.projectCreation.step5',
    url: '/step5',
    views: {
      'createProjChildView': {
        templateUrl: 'templates/userProfile/projectCreation/step5.html',
        controller: 'stepFiveController'
      }
    },
    params: {
      project: null
    },
    resolve: {
      project: ['$stateParams', '$timeout', '$q', function($stateParams, $timeout, $q) {
        return $q(function(resolve, reject) {
          $timeout(function() {
            if ($stateParams.project && $stateParams.project.id) {
              resolve($stateParams.project);
            } else {
              reject('no id');
            }
          }, 50);
        });
      }]
    }
  });

  $stateProvider.state({
    name: 'root.projectCreation.step6',
    url: '/step6',
    views: {
      'createProjChildView': {
        templateUrl: 'templates/userProfile/projectCreation/step6.html',
        controller: 'stepSixController'
      }
    },
    params: {
      project: null
    },
    resolve: {
      project: ['$stateParams', '$timeout', '$q', function($stateParams, $timeout, $q) {
        return $q(function(resolve, reject) {
          $timeout(function() {
            if ($stateParams.project && $stateParams.project.id) {
              resolve($stateParams.project);
            } else {
              reject('no id');
            }
          }, 50);
        });
      }]
    }
  });

  // HUB PROJECTS


  $stateProvider.state({
    name: 'root.hubs',
    url: '/hubs',
    templateUrl: 'templates/project/hubsPageTemplate.html',
    controller: 'hubsPageController',
    resolve: {
      hubs: ['$http', function($http) {
        return $http.get('/api/user/hubs').then(function(data) {
          return data.data;
        }).catch(function(error) {
          return undefined;
        });
      }]
    }
  });

  $stateProvider.state({
    name: 'root.hubProjectCreation',
    url: '/project/new',
    templateUrl: 'templates/userProfile/newHubProjectTemplate.html',
    controller: 'hubProjectCreationController',
    abstract: true
  });

  $stateProvider.state({
    name: 'root.hubProjectCreation.step1',
    url: '/hubStep1',
    views: {
      'createProjChildView': {
        templateUrl: 'templates/userProfile/hubProjectCreation/step1.html',
        controller: 'hubStepOneController'
      }
    }
  });

  $stateProvider.state({
    name: 'root.hubProjectCreation.step2',
    url: '/hubStep2',
    views: {
      'createProjChildView': {
        templateUrl: 'templates/userProfile/hubProjectCreation/step2.html',
        controller: 'hubStepTwoController'
      }
    }
  });

  $stateProvider.state({
    name: 'root.hubEdit',
    url: '/hub/edit/:hubCode',
    templateUrl: 'templates/userProfile/hubEditTemplate.html',
    params: {
      hub: null
    },
    controller: 'hubEditController',
    abstract: true,
    resolve: {
      hub: ['$stateParams', '$q', '$http', function($stateParams, $q, $http) {

        return $q(function(resolve, reject) {
          if ($stateParams.hub && $stateParams.hub.hub_unique_code) {
            resolve($stateParams.hub);
          } else {
            $http.get('/api/projects/getHubInfo/' + $stateParams.hub.hub_unique_code).then(function(data) {
              resolve(data.data);
            }).catch(function(error) {
              reject('server error');
            });
          }
        });
      }]
    }
  });


  $stateProvider.state({
    name: 'root.hubEdit.step1',
    url: '/hubStep1',
    views: {
      'createProjChildView': {
        templateUrl: 'templates/userProfile/hubProjectCreation/step1.html',
        controller: 'hubStepOneEditController'
      }
    }
  });

  $stateProvider.state({
    name: 'root.hubEdit.step2',
    url: '/hubStep2',
    views: {
      'createProjChildView': {
        templateUrl: 'templates/userProfile/hubProjectCreation/step2.html',
        controller: 'hubStepTwoEditController'
      }
    }
  });

  



  $urlRouterProvider.otherwise('/home');
});

module.controller('appController', ['$scope', '$http', 'userData', '$window', function($scope, $http, userData, $window) {

  $scope.user = userData;
  /**
   * A get request is made to get the profile pic of the user provided the id, or else set the default profile pic
   */
  $scope.user.profilePic = '/api/user/getProfilePic/' + $scope.user['profile_photo'];

  $window.location.href = '/UserProfile.html#/profile'

  $scope.logout = function() {
      /**
       * A get request for logging the user out of the system and redirecting to login page.
       */
    $http.get('/api/logout').then(function() {
      //window.location = '/';
        window.location.href='/login';
    }, function() {
      alert('Couldn\'t sign you out');
    });
  };

    //Get points for user
    //Each image counts for 1 point
    //Each new project gives a bonus of 100
    $scope.gotPoints = false;
    /**
     * A get request for fetching the points of the user wherein user id is passed and points are calculated based on the projects
     * contributed by the user.
     */
    $http.get('/api/results/getUserStats/' + $scope.user.id).then(function(pdata) {
        var point_data = pdata.data;
        $scope.userPoints = 0;
        $scope.userPoints += point_data.length * 100; //bonus points for each project
        point_data.forEach(function (item) {
            $scope.userPoints+= item.count;
        });
        if ($scope.userPoints == 0) {
            $scope.userPoints = 10;
        }
        var next_per = 0;
        if ($scope.userPoints < 500) {
            $scope.userRank = 'NOVICE';
            next_per = Math.floor((parseInt($scope.userPoints) /500)*100);
            $scope.nextLevelThres  = $scope.userPoints.toString() + " / 500";

        }else if ($scope.userPoints > 500 && $scope.userPoints < 2000 ) {
            $scope.userRank = 'EXPLORER';
            next_per = Math.floor((parseInt($scope.userPoints) /2000)*100);
            $scope.nextLevelThres  = $scope.userPoints.toString() + " / 2000";
        } else {
            $scope.userRank = 'MASTER';
            next_per = 100;
            $scope.nextLevelThres  = $scope.userPoints;
        }
        $scope.barStyle = {"width" : next_per.toString() + "%"}
    });



}]);

module.controller('projectEditController', ['$scope', '$http', '$state','$timeout', 'swalService', 'project',
  function($scope, $http, $state,$timeout, swalService, project) {
    $scope.project = project;

    if (!$scope.project.editing) {
      $scope.project.editing = true;
      $scope.project.task = JSON.parse($scope.project.template);
      $scope.project.privacy = $scope.project['access_type'];
      delete $scope.project.template;
      delete $scope.project['access_type'];
    }

    $scope.goTo = function(to) {
      if ($scope.project.id) {
        $state.go(to);
      }
    };

    $scope.isActive = function(stateName) {
      return $state.current && $state.current.name == stateName;
    };

    $scope.getNextText = function() {
      return 'Save';
    };

    $scope.goNext = function() {



        if ($state.current && $state.current.name == 'root.projectCreation.step6') {
        $scope.openPublishPopup();
      } if ($state.current && $state.current.name == 'root.projectEdit.step6') {

            // $timeout( function(){
                $state.go('root.getAllProjects');
            // }, 100 );


        } else {
        $scope.$broadcast('validate');
      }
    };

    $scope.$on('moveNext', function(e, d) {
      var curr = $state.current.name;
      var stateMap = {
        'root.projectEdit.step1': '^.step2',
        'root.projectEdit.step2': '^.step3',
        'root.projectEdit.step3': '^.step4',
        'root.projectEdit.step4': '^.step5',
        'root.projectEdit.step5': '^.step6',
        'root.projectEdit.step6': '^.step7'
      };
      try {
        $state.go(stateMap[curr], {project: $scope.project});
      }
      catch (e) {

      }
    });
    $scope.verifyCanPublish = function() {
      return $scope.project.id && $scope.project.templateSaved && $scope.project.dataSetID;
    };

    $scope.verifyCanImportData = function() {
      return $scope.project.id && $scope.project.templateSaved;
    };

    $scope.openPublishPopup = function() {
      if ($scope.verifyCanPublish()) {
        $('#publishPopup').modal('show');
      } else {
        swalService.showErrorMsg('Please make sure you\'ve filled up the required details and created the ' +
          'task template before you try to publish.');
      }
    };

    $scope.publish = function($state) {
      if ($scope.project.id) {
          /**
           * A post request which is used to update the published status of the project.
           */
        $http.post('/api/project/publish', {projectID: $scope.project.id}).then(function(data) {
          $scope.showPublish = false;
          $scope.project.published = true;
          $('#publishPopup').modal('hide');

            $timeout( function(){
                $state.go('root.getAllProjects');
            }, 1000 );

        }, function(response) {
          var msg = response.data.error || 'Couldn\'t publish your project, please try again';
          swalService.showErrorMsg(msg);
          $('#publishPopup').modal('hide');
        });
      }
    };

  }]);

module.controller('projectCreationController', ['$scope', '$http', '$state', '$timeout', 'swalService', 'projectCreators',
  function($scope, $http, $state,$timeout, swalService, projectCreators) {
    $scope.goTo = function(to) {
      if ($scope.project.id) {
        $state.go(to);
      }
    };

    $scope.isActive = function(stateName) {
      return $state.current && $state.current.name == stateName;
    };

    $scope.getNextText = function() {
      if ($state.current && $state.current.name == 'root.projectCreation.step6') {
        return 'Publish';
      } else {
        return 'Next';
      }
    };

    $scope.goNext = function() {


      if ($state.current && $state.current.name == 'root.projectCreation.step6') {
        $scope.openPublishPopup();
      } else {
        $scope.$broadcast('validate');
      }
    };

    $scope.project = {};
    $scope.project.editing = false;
    $scope.project.task = {
      options: []
    };

    //start with private project by default
    $scope.project.privacy = 1;
    $scope.showPublish = true;
    $scope.$on('moveNext', function(e, d) {
      var curr = $state.current.name;
      var stateMap = {
        'root.projectCreation.step1': '^.step2',
        'root.projectCreation.step2': 'root.projectCreation.step3',
        'root.projectCreation.step3': 'root.projectCreation.step4',
        'root.projectCreation.step4': 'root.projectCreation.step5',
        'root.projectCreation.step5': 'root.projectCreation.step6',
        'root.projectCreation.step6': 'root.projectCreation.step7'
      };
      try {
        $state.go(stateMap[curr], {project: $scope.project});
      }
      catch (e) {

      }
    });
    $scope.verifyCanPublish = function() {
      return $scope.project.id && $scope.project.templateSaved && $scope.project.dataSetID;
    };

    $scope.verifyCanImportData = function() {
      return $scope.project.id && $scope.project.templateSaved;
    };

    $scope.openPublishPopup = function() {
      if ($scope.verifyCanPublish()) {
        $('#publishPopup').modal('show');
      } else {
        swalService.showErrorMsg('Please make sure you\'ve filled up the required details and created the ' +
          'task template before you try to publish.');
      }
    };

    $scope.publish = function() {
      if ($scope.project.id) {
        $http.post('/api/project/publish', {projectID: $scope.project.id}).then(function(data) {
          $scope.showPublish = false;
          $('#publishPopup').modal('hide');


            $timeout( function(){
                $state.go('root.getAllProjects');
            }, 1000 );

        }, function(response) {
          var msg = response.data.error || 'Couldn\'t publish your project, please try again';
          swalService.showErrorMsg(msg);
          $('#publishPopup').modal('hide');
        });
      }
    };


  }]);

module.controller('projectsController', ['$scope', '$state', '$http', '$location','projectCreators',
    function($scope, $state, $http, $location,projectCreators) {
        var vm = this;
        vm.showProjectDetails = showProjectDetails;
        vm.currentProject ={};
        console.log("into projects controller")
        /**
         * A get request to fetch all the projects for a specific user.
         */
        $http.get('/api/project/getProjects/public').then(function(response) {

            //Only show projects that are public and not archived and published
            vm.projects = filterResponses(response.data,{archived:0,published:1});
        }, function(error) {
            console.log('There was an error', error);
        });

        function showProjectDetails(project){
            vm.currentProject = project;
            $state.go('root.showProjectDetails', {project: project});
        }

        //Function filterResponses: filter results based on some criteria
        function filterResponses(array, criteria) {
            return array.filter(function (obj) {
                return Object.keys(criteria).every(function (c) {
                    return obj[c] == criteria[c];
                });})
        };


        //Allow project creation for selected user
       // if ($scope.user.username == projectCreators) {vm.allowProject = true}
       // else {vm.allowProject = false}

        if($scope.user.is_creator == 1) {vm.allowProject = true}
        else {vm.allowProject = false}

    }]);

module.controller('projectController', ['$scope', '$state', '$http', '$stateParams','$timeout','projectCreators',
    function($scope, $state, $http, $stateParams,$timeout,projectCreators) {
        var vm = this;
        vm.currentProject =  $stateParams.project;

        // get the template which contains questions and answers
        if (typeof vm.currentProject.template != 'undefined'){
            vm.template = JSON.parse(vm.currentProject.template)
        }

        //Allow project creation for selected user
        //if ($scope.user.username == projectCreators) {vm.allowProject = true}
        //else {vm.allowProject = false}

        if($scope.user.is_creator == 1) {vm.allowProject = true}
        else {vm.allowProject = false}


        $http.get('/api/project/getProjectOwner/'+vm.currentProject.creatorID).then(function(response) {
          vm.currentProject.user = response.data[0];
            if (typeof vm.currentProject.user != 'undefined'){
                $scope.owner_photo = '/api/user/getProfilePic/' + vm.currentProject.user.profile_photo;
            }

        }, function(error) {
            console.log('There was an error', error);
        });

        vm.showProjectDetails = showProjectDetails;
        vm.showtab = showtab;
        vm.update_heatmap = update_heatmap;

        //booleans for showing map and info
        vm.showInfobool = true;
        vm.showMapbool = false;

        function showProjectDetails(project){
            vm.currentProject = project;
            $state.go('root.showProjectDetails', {project: project});
        }

        function showtab(value){
            if (value ==='info') {
                vm.showInfobool = true;
                vm.showMapbool = false;
            } else{
                vm.showInfobool = false;
                vm.showMapbool = true;
            }
        }

        //Results details

        //gradients: initial colors
        var gradients = {
            red: [ 255,0,0],
            green: [ 0, 255,0],
            blue: [0,0,255],
            orange: [255,165,0],
            yellow: [255,255,0],
            purple: [138,43,226],
            all: [255,20,147]
        };
        var ans_colors =  {
            '1':'green',
            '2': 'yellow',
            '3': 'orange',
            '4' : 'red',
            '5': 'blue',
            '6' : 'purple',
            'all': 'all'
        };

        vm.button_colors = {
            '1': '#9cdc1f',
            '2': '#DC1F3A',
            '3': '#f7941d',
            '4': '#FFF200',
            '5': '#0072BC',
            '6': '#8A2BE2'
        };

      if(typeof vm.currentProject.unique_code !='undefined') {
          //Get the results of the first project:
          $http.get('/api/results/all/' + vm.currentProject.unique_code).then(function (data) {

              // Results of the project
              vm.results = data.data;
              if (typeof vm.results[0] !='undefined') {

                  vm.question = vm.template.question;

                  vm.options = vm.template.options;

              //generate first map
              $scope.map = {
                  center: {
                      latitude: parseFloat(vm.results[0].x),
                      longitude: parseFloat(vm.results[0].y)
                  },
                  zoom: 7,
                  streetViewControl: false,
                  heatLayerCallback: function (layer) {
                      //set the heat layer from the data
                      $scope.pointArr1 = [];
                      $scope.htlayer1 = layer;
                      var htl1 = new HeatLayer($scope.htlayer1, vm.results, $scope.pointArr1, 1);
                  },
                  showHeat: true
              };
              vm.successProject = true;
              } else {
                  vm.question = 'Results coming soon!'
              }

          }, function errorCallback(response) {
              // called asynchronously if an error occurs
              // or server returns response with an error status.
              vm.question = 'Results coming soon!'
          });
      }

        function update_heatmap(answer){

            var geodata = [];
            //Mapping of answers to colors:
                if (answer != 'all') {

                    //Filter data based on answer clicked
                    var answer_results = filterResponses(
                        //$scope.results1, {answer: "\"" + answer + "\""});
                        vm.results, {color: parseInt(answer)});

                } else {
                    var answer_results = vm.results
                }

                // Transform the data for the heatmap:
                answer_results.forEach(function (item) {
                    geodata.push(new google.maps.LatLng(parseFloat(item.x), parseFloat(item.y)));
                });

                //set the data for the heatmap
                $scope.pointArr1 = new google.maps.MVCArray(geodata);
                $scope.htlayer1.setData($scope.pointArr1);
                //Change the gradient
                var gradient = generate_gradient(gradients[ans_colors[answer]]);
                $scope.htlayer1.set('gradient', gradient);

        };

        //Function for Heatmap
        function HeatLayer(heatLayer,rdata,pointArray,answer) {

            //Create lat lng from array of objects
            var geodata = [];
            //Initial colors: Green
            //Filter data based on answer clicked
            var answer_results = filterResponses(
                // rdata, {answer: "\"" + answer + "\""});
                rdata, {color: parseInt(answer)});

            // Transform the data for the heatmap:
            answer_results.forEach(function (item) {
                geodata.push(new google.maps.LatLng(parseFloat(item.x), parseFloat(item.y)));
            });

            //set the data for the heatmap
            pointArray = new google.maps.MVCArray(geodata);
            heatLayer.setData(pointArray);
            //Set the gradient:
            var gradient = generate_gradient(gradients[ans_colors[answer]]);
            heatLayer.set('gradient', gradient);
            heatLayer.set('opacity',1);
            heatLayer.set('radius',20);
        };

        //Function filterResponses: filter results based on some criteria
        function filterResponses(array, criteria) {
            return array.filter(function (obj) {
                return Object.keys(criteria).every(function (c) {
                    return obj[c] == criteria[c];
                });})
        }

        //Function generate_gradient: gradient array based on rgb array
        //Different opacity
        function generate_gradient(color) {
            var g = [];
            var op = 0;
            //blue: 0,0,255 - 0,50,255 - 0,100,255 - 0,150,255 - 0,200,255
            for (i = 0; i < 6; i++) {
                g.push('rgba(' + color[0] + ' , ' + color[1] + ', ' + color[2] + ', ' + op + ')');
                op = op + 0.20;
            }
            return g;
        }

    }]);


module.controller('stepOneController', ['$scope', '$state', '$http', 'swalService',
  function($scope, $state, $http, swalService) {


    var invalid_characters = ['\\','/',':','?','\"','<','>','|'];

    $scope.has_scistarter = false;
    $scope.has_external_signup = false;

    if ($scope.project.hasOwnProperty("scistarter_link")){
        $scope.has_scistarter = true;
    }
      if ($scope.project.hasOwnProperty("external_sign_up")){
          $scope.has_external_signup = true;
      }

    $scope.$on('validate', function(e) {
      $scope.validate();
    });

    $scope.validate = function() {


      if (!$scope.project.name || !$scope.project.description || !$scope.project.short_name || !$scope.project.short_name_friendly || !$scope.project.short_description) {
        $scope.showErr = true;
        swalService.showErrorMsg('Please enter a name, a short name and description for the project.');
      } else if (  invalid_characters.some(el => $scope.project.short_name.includes(el))) {
          $scope.showErr = true;
          swalService.showErrorMsg('Short name cannot contain the following characters: \n' + invalid_characters.join(','));
      } else if ($scope.has_scistarter && ($scope.project.scistarter_link === "" || !$scope.project.scistarter_link)){
          $scope.showErr = true;
          swalService.showErrorMsg('Please enter valid URL for SciStarter form.');
      } else if ($scope.has_external_signup && ($scope.project.external_sign_up === "" || !$scope.project.external_sign_up)){
          $scope.showErr = true;
          swalService.showErrorMsg('Please enter valid URL for external signup form.');
      }

      else {
        $scope.createProject();
      }
    };

    $scope.createProject = function() {
      if ($scope.project.id) {
        $scope.$emit('moveNext');
      } else {
        var fd = new FormData();
        if ($scope.coverPic) {
          fd.append('file', $scope.coverPic);
        }
        fd.append('name', $scope.project.name);
        fd.append('description', $scope.project.description);
          fd.append('short_name', $scope.project.short_name);
          fd.append('short_name_friendly', $scope.project.short_name_friendly);
          fd.append('short_description', $scope.project.short_description);
          fd.append('is_inaturalist', $scope.project.is_inaturalist ? 1 : 0);
          if ($scope.has_scistarter){
              fd.append('scistarter_link', $scope.project.scistarter_link);
          }
          if ($scope.has_external_signup){
              fd.append('external_sign_up', $scope.project.external_sign_up);
          }

          /**
           * A post request is made to post the new project details into the database created by the user.
           */
          $http.post('api/project/add', fd, {
          transformRequest: angular.identity,
          headers: {'Content-Type': undefined}
        }).then(function(response) {
          var data = response.data;
          $scope.project.id = data.id;
          $scope.project['unique_code'] = data.code;
          $scope.$emit('moveNext');
        }, function(response) {
          var msg = response.data.error || 'Couldn\'t create the project';
          //if we got a duplicate entry, it's because of the short name
          if (msg == "ER_DUP_ENTRY") {
            msg = 'A project with the same short name already exists!'
          }
          swalService.showErrorMsg(msg);
        });
      }
    };

    var handleImage = function(f) {
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
    };

    $scope.$watch('coverPic', function() {
      if ($scope.coverPic) {
        handleImage($scope.coverPic);
      }
    });

  }]);

module.controller('stepTwoController', ['$scope', '$state', '$stateParams', '$http', 'swalService',
  function($scope, $state, $stateParams, $http, swalService) {
    $scope.$on('validate', function() {
      $scope.validate();
    });
      //console.log("Before task Types", $scope.project, "|| ", $scope.taskTypes);


    $scope.taskTypes = {
      task1 : {name: 'Tagging label to images', value:'tagging', note: 'In this task you will ' +
      'select the appropriate label from a group of labels for an image'},
      task2 : {name: 'Mapping image to map', value:'mapping', note: 'In this task you will zoom ' +
      'in and drag a map on the left to match the image on the right'},
        task3 : {name: 'NGS Map', value:'ngs', note: 'In this task you will use a provided NGS map ' +
                'to answer questions regarding locations'},
        task4 : {name: 'Slider Task', value:'slider', note: 'In this task you will view before ' +
                'and after photos and answer questions regarding the after photo.'}
    };

      $scope.project.task.selectedTaskType = $scope.project.task.selectedTaskType || 'tagging';

    $scope.validate = function() {
      if (!$scope.project.task.selectedTaskType || !$scope.project.task.question || $scope.project.task.options.length <= 1) {
        swalService.showErrorMsg('Please make sure you have a question and two options for the task');
        return;
      }
      var data = {
        template: JSON.stringify($scope.project.task),
        projectID: $scope.project.id
      };
      $http.post('/api/project/updateTemplate', data).then(function(data) {
        $scope.project.templateSaved = true;
        $scope.$emit('moveNext');
      }, function(response) {
        var msg = response.data.error || 'couldn\'t save the template at this time';
        swalService.showErrorMsg(msg);
      })
      ;
    };

    $scope.addOption = function() {
      if ($scope.project.task.options.length < 10) {
        $scope.project.task.options.push({color: 1});
      }
    };

    $scope.removeOption = function(index) {
      $scope.project.task.options.splice(index, 1);
    };

  }
]);

module.controller('stepThreeController', ['$scope', '$templateCache', '$http', 'swalService', 'admins',
  function($scope, $templateCache, $http, swalService, admins) {
    $scope.project.admins = admins || [];
    var TEMPLATE_URL = 't1.html';

    // Set the default template for this directive
    $templateCache.put(TEMPLATE_URL,
      '<div class="angucomplete-holder" ng-class="{\'angucomplete-dropdown-visible\': showDropdown}">' +
      '  <input id="{{id}}_value" class="invite" name="{{inputName}}" tabindex="{{fieldTabindex}}" ' +
      'ng-class="{\'angucomplete-input-not-empty\': notEmpty}" ng-model="searchStr" ng-disabled="disableInput" ' +
      'type="{{inputType}}" placeholder="{{placeholder}}" maxlength="{{maxlength}}" ng-focus="onFocusHandler()" ' +
      'class="{{inputClass}}" ng-focus="resetHideResults()" ng-blur="hideResults($event)" autocapitalize="off" ' +
      'autocorrect="off" autocomplete="off" ng-change="inputChangeHandler(searchStr)"/>' +
      '  <div id="{{id}}_dropdown" class="angucomplete-dropdown" ng-show="showDropdown">' +
      '    <div class="angucomplete-searching" ng-show="searching" ng-bind="textSearching"></div>' +
      '    <div class="angucomplete-searching" ng-show="!searching && (!results || results.length == 0)" ' +
      'ng-bind="textNoResults"></div>' +
      '    <div class="angucomplete-row" ng-repeat="result in results" ng-click="selectResult(result)" ' +
      'ng-mouseenter="hoverRow($index)" ng-class="{\'angucomplete-selected-row\': $index == currentIndex}">' +
      '      <div class="angucomplete-title" ng-if="matchClass" ng-bind-html="result.title"></div>' +
      '      <div class="angucomplete-title" ng-if="!matchClass">{{ result.title }}</div>' +
      '      <div ng-if="matchClass && result.description && result.description != \'\'" ' +
      'class="angucomplete-description" ng-bind-html="result.description"></div>' +
      '      <div ng-if="!matchClass && result.description && result.description != \'\'" ' +
      'class="angucomplete-description">{{result.description}}</div>' +
      '    </div>' +
      '  </div>' +
      '</div>'
    );

    $scope.deleteAdmin = function(index) {
      var admin = $scope.project.admins[index];
        /**
         * A post request which is used to delete the admin for a particular project.
         */
      $http.post('/api/project/admin/delete',
        {
          userID: admin.id,
          projectID: $scope.project.id
        }).then(function(data) {
        $scope.project.admins.splice(index, 1);
      }).catch(function(err) {
        swalService.showErrorMsg('Couldn\'t Delete the admin, please try again');
      });
    };

    $scope.invite = function() {
      var userID = $scope.project.invite.selectedUser.originalObject.id;
        /**
         * A post request which is used to add users to a particular project.
         */
      $http.post('/api/project/admin/add',
        {
          userID: userID,
          projectID: $scope.project.id
        }).then(function() {
        $scope.project.admins.push($scope.project.invite.selectedUser.originalObject);
      }).catch(function() {
        swalService.showErrorMsg('Couldn\'t add this admin, please try again');
      });
    };

    $scope.$on('validate', function(e) {
      $scope.validate();
    });

    $scope.validate = function() {
      $scope.$emit('moveNext');
    };

  }]);

module.controller('stepFourController', ['$scope', '$state', '$http', 'swalService', 'Upload',
  function($scope, $state, $http, swalService, Upload) {


  $scope.showUploadProgress = false;
  $scope.project.hasLocation = true;
  $scope.project.ar_ready = false;

  $scope.uploadMethod = 1;

  $scope.update_hasLocation = function(){

      var data = {
          projectID: $scope.project.id,
          has_location: $scope.hasLocation || 0
      };
      /**
       * A post request to update the location for a specific project.
       */
      $http.post('/api/project/updateHasLocation', data).then(function(data) {
      }, function(response) {
          var msg = response.data.error || 'couldn\'t update location at this time';
          swalService.showErrorMsg(msg);
      })
  };
      $scope.update_ar_ready = function(){

          var data = {
              projectID: $scope.project.id,
              ar_ready: $scope.project.ar_ready
          };
          /**
           * A post request to update the AR attribute for a specific project.
           */
          $http.post('/api/project/updateARReady', data).then(function(data) {
          }, function(response) {
              var msg = response.data.error || 'couldn\'t update ar ready at this time';
              swalService.showErrorMsg(msg);
          })

      };

    $scope.sendDataSet = function() {
      if ($scope.project.dataSetLink) {
        $http.post('/api/test/upload', {
          'file': $scope.project.dataSetLink,
          'projectID': $scope.project.id,
          'regex': $scope.project.regex || '',
            'ar_ready': $scope.project.ar_ready
        }).then(function(data) {
          if (data.data.uniqueCode) {
            $scope.project.dataSetID = data.data.uniqueCode;
              //update location if unchecked
              $scope.update_hasLocation();
              $scope.update_ar_ready();


          }
        }, function(err) {
          alert('Something wrong with the uploaded data set');
        });
      } else {
        swalService.showErrorMsg('Please enter a data set url');
      }
    };

      $scope.sendDataSetLocal = function(is_slider) {
          if ($scope.file) {

            var url_link = '/api/test/uploadLocal';
            // if (is_slider){
            //     url_link = '/api/test/uploadLocalSlider'
            // }

              /**
               * Upload the dataset of the images in the database.
               */
              Upload.upload({
                  url: url_link,
                  method: 'POST',
                  data: {
                    'file': $scope.file,
                  'projectID': $scope.project.id,
                  'regex': $scope.project.regex || '',
                  'ar_ready': $scope.project.ar_ready,
                  'is_slider': is_slider}
              }).then(function (resp) {
                  //$scope.showUploadProgress = false;

                  console.log('Success! Dataset uploaded.');
                  if (resp.data.uniqueCode) {
                      $scope.project.dataSetID = resp.data.uniqueCode;
                      //update location if unchecked
                      $scope.update_hasLocation();
                      $scope.update_ar_ready();

                  }
              }, function (resp) {
                  $scope.showUploadProgress = false;

                  alert('Something wrong with the uploaded data set');
              }, function (evt) {
                  $scope.showUploadProgress = true;

                  $scope.progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                  $scope.uploadProgressStyle = {"width" : $scope.progressPercentage.toString() + "%"};

              });
          } else {
              swalService.showErrorMsg('Please enter a valid compressed folder');
          }
      };


      $scope.sendDataSetNGS = function() {
          if ($scope.file && $scope.project.dataSetLink) {
              Upload.upload({
                  url: '/api/test/uploadNGS',
                  method: 'POST',
                  data: {'file': $scope.file,
                      'projectID': $scope.project.id,
                      'map_link': $scope.project.dataSetLink,
                      'regex': $scope.project.regex || ''}
              }).then(function (resp) {
                  //$scope.showUploadProgress = false;

                  console.log('Success! Dataset uploaded.');
                  if (resp.data.uniqueCode) {
                      $scope.project.dataSetID = resp.data.uniqueCode;
                      //update location if unchecked
                      $scope.update_hasLocation();
                      //not possible to do ar with NGS!

                  }
              }, function (resp) {
                  $scope.showUploadProgress = false;

                  alert('Something wrong with the uploaded data set');
              }, function (evt) {
                  $scope.showUploadProgress = true;

                  $scope.progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                  $scope.uploadProgressStyle = {"width" : $scope.progressPercentage.toString() + "%"};

              });
          } else {
              swalService.showErrorMsg('Please enter a csv file and a link to the NGS map');
          }
      };


    $scope.$on('validate', function(e) {
      $scope.validate();
    });

    $scope.validate = function() {
      $scope.$emit('moveNext');
    };

    $scope.getProgressUrl = function() {
      return '/status.html#/?id=' + $scope.project.dataSetID;
    };
  }]);

module.controller('stepFiveController', ['$scope', '$state', '$http', function($scope, $state, $http) {
  $scope.$on('validate', function(e) {
    $scope.validate();
  });

  $scope.startTaskPath = window.location.protocol + '//' + window.location.host + '/api/tasks/startProject/';

    //send them to project page instead
    $scope.startTaskPath = window.location.protocol + '//' + window.location.host + '/kioskProject.html#/kioskStart/';



    $scope.getPathToStart = function() {
    return $scope.startTaskPath + '' + $scope.project['unique_code'];
  };

  $scope.validate = function() {
      /**
       * Update the privacy of the project by making it either public or private.
       */
    $http.post('/api/project/changePrivacy', {
      'projectID': $scope.project.id,
      'privacy': $scope.project.privacy
    }).then(function() {
      $scope.$emit('moveNext');
    }, function() {
      alert('couldn\'t update privacy at this time');
    });
  };
}]);

module.controller('stepSixController', ['$scope', '$state', '$http', 'Upload', 'swalService', function($scope, $state, $http, Upload, swalService) {

  $scope.$on('validate', function(e) {
    $scope.validate();
  });

  $scope.validate = function() {
    $scope.$emit('moveNext');
  };

    $scope.showUploadProgress = false;
    $scope.existingImages = 0;
    $scope.received_code = 0;
    $scope.tutorial_items = [];
    $scope.dataset_image_list = [];
    $scope.location_dict = {};

    $scope.add_tutorial_text = "Add tutorial";



    $scope.addTutorialItem = function(){
        var default_item = {
            unique_code: $scope.project.unique_code,
            image_name: null,
            answer: null,
            explanation: null,
            ask_user: 1,
            in_dataset: 1 };
        $scope.tutorial_items.push(default_item);
    };

    $scope.deleteTutorialItem = function(index) {
        $scope.tutorial_items.splice(index, 1);
    };

    $scope.moveUp = function(i){
        if (i > 0) {
            var temp = $scope.tutorial_items[i-1];
            $scope.tutorial_items[i-1] = $scope.tutorial_items[i];
            $scope.tutorial_items[i] = temp
        }
    };

    $scope.moveDown = function(i){
        if (i < $scope.tutorial_items.length - 1) {
            var temp = $scope.tutorial_items[i+1];
            $scope.tutorial_items[i+1] = $scope.tutorial_items[i];
            $scope.tutorial_items[i] = temp
        }
    };

    $scope.fetchTutorialItems = function(){

            $http.get('/api/project/getTutorial/' + $scope.project.unique_code).then(function (sdata) {
                $scope.tutorial_items = sdata.data;
                for (var i = 0; i < $scope.tutorial_items.length; i++) {
                    $scope.tutorial_items[i].explanation = $scope.tutorial_items[i].explanation.slice(1, -1);
                }
                if ($scope.tutorial_items.length){
                    $scope.add_tutorial_text = "Update tutorial";
                }
                }, function (err) {
                $scope.tutorial_items = [];
                $scope.add_tutorial_text = "Add tutorial";
            });

    };

    $scope.getTutorialImage = function(img, in_dataset){
        var link = '../../images/placeholder-image.png';
        if (img){
            link = '/api/tasks/getImage/' + $scope.project.dataset_id + '/' + img.replace(".jpg","");
            //if not in dataset, was externally uploaded
            if (!in_dataset){
                link = '../../images/Tutorials/'   + img
            }
        }
        return link
    };

    $scope.showBiggerImage = function(img,in_dataset){
        var link = '/api/tasks/getImage/' + $scope.project.dataset_id + '/' + img.replace(".jpg","");
        //if not in dataset, was externally uploaded
        if (!in_dataset){
            link = '../../images/Tutorials/'  + img
        }

        window.open(link);
    };

    $scope.showNGSPreview = function(obj){

        if ( !obj.hasOwnProperty("zoom")){
            obj.zoom = 16
        }
        //example: https://storms.ngs.noaa.gov/storms/laura/index.html#7/29.862/-93.567
        var link = $scope.project.image_source + "#" + obj.zoom +  '/' + obj.x + '/' + obj.y;


        window.open(link);
    };

    $scope.previewExplanation = function(explanation){
        swal({
            title: "Explanation Preview",
            confirmButtonColor: '#9cdc1f',
            allowOutsideClick: true,
            html: true,
            text: '<div>' + explanation + '</div>',
            type: 'info'
        });
    };



    $scope.fetchDatasetItems = function(){

        $http.get('/api/project/getProjectPoints/' + $scope.project.unique_code).then(function (sdata) {

            sdata.data.forEach(function(item){
                //here we also get x,y coordinates,we will need these for location tutorials
                //TODO: we will also need to set the zoom level.
                if ($scope.project.task.selectedTaskType !== "tagging"){

                    $scope.dataset_image_list.push(  item.name);
                    //default zoom here
                    $scope.location_dict[item.name] = {x: item.x, y: item.y, zoom:16} ;
                } else {
                    $scope.dataset_image_list.push(  item.name + '.jpg');
                }
``
            });
            //then see if we have anything already
            $scope.fetchTutorialItems();
        }, function (err) {

            //andle error!
            $scope.dataset_image_list = [];
            swalService.showErrorMsg("No images in dataset yet!");
        });
    };



    $scope.setTutorialItems = function(){

        //bring it to format we need for tutorial
        //$scope.project_template = JSON.stringify($scope.project.task);

        var tutorial_items_to_send = JSON.parse(JSON.stringify($scope.tutorial_items));

        for (var i = 0; i < $scope.tutorial_items.length; i++) {

            tutorial_items_to_send[i].ask_user = parseInt(tutorial_items_to_send[i].ask_user);
            tutorial_items_to_send[i].image_name = tutorial_items_to_send[i].image_name.replace($scope.project.unique_code + '/', "");
            delete tutorial_items_to_send[i].template;
            delete tutorial_items_to_send[i].points_file;
            delete tutorial_items_to_send[i].point_selection;
            delete tutorial_items_to_send[i].unique_code;
            delete tutorial_items_to_send[i].id;
            //if mapping, we need additional info
            if($scope.project.task.selectedTaskType !== "tagging"){
                tutorial_items_to_send[i].x = $scope.location_dict[tutorial_items_to_send[i].image_name].x;
                tutorial_items_to_send[i].y = $scope.location_dict[tutorial_items_to_send[i].image_name].y;
                tutorial_items_to_send[i].zoom = $scope.location_dict[tutorial_items_to_send[i].image_name].zoom
                tutorial_items_to_send[i].image_source = $scope.project.image_source;
            }

            //everything that was null before should be deleted!
            Object.keys(tutorial_items_to_send[i]).forEach(function(ky){
                if (tutorial_items_to_send[i][ky] == null) {
                    delete tutorial_items_to_send[i][ky]
                }
            })

        }
        $http.post('/api/project/addTutorialItems',
            {
                'unique_code': $scope.project.unique_code,
                'tutorial_items': tutorial_items_to_send
            }).then(function () {

            //send message we good
            swal({
                title: 'Success!',
                confirmButtonColor: '#9cdc1f',
                allowOutsideClick: true,
                text: 'Tutorial added!',
                type: 'success'
            });

        }, function (err) {
            swalService.showErrorMsg(err);
        })
    };

    $scope.sendTutorialLocal = function() {

        console.log("Sending Tutorial Items")
        if ($scope.file) {
            Upload.upload({
                url: '/api/test/uploadTutorialLocal',
                method: 'POST',
                data: {
                    'file': $scope.file,
                    'projectID': $scope.project.unique_code,
                    'existing': $scope.existingImages,
                    'ar_ready': $scope.project.ar_ready,
                    'dataset_id': $scope.project.dataset_id

                }
            }).then(function (resp) {
                //$scope.showUploadProgress = false;

                console.log('Success! Tutorial uploaded.');
                //TODO: RESPONSE
                if (resp.data.uniqueCode) {

                    $scope.received_code = 1;



                }
            }, function (resp) {
                $scope.showUploadProgress = false;

                alert('Something wrong with the uploaded data set');
            }, function (evt) {
                $scope.showUploadProgress = true;

                $scope.progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                $scope.uploadProgressStyle = {"width" : $scope.progressPercentage.toString() + "%"};

            });
        } else {
            swalService.showErrorMsg('Please enter a valid compressed folder');
        }
    };


    $scope.fetchDatasetItems();

}]);

module.controller('stepSevenController', ['$scope', '$state', '$http', 'Upload', 'swalService', function($scope, $state, $http, Upload, swalService) {

    $scope.$on('validate', function(e) {
        $scope.validate();
    });

    $scope.validate = function() {
        $scope.$emit('moveNext');
    };

    $scope.custom_description = null;

    $scope.add_survey_text = "Add Survey";

    $scope.question_options_list = ["textarea","radio","checkbox","likert","external","title","text"];


    $scope.survey_questions = [];

    $scope.moveUp = function(i){
        if (i > 0) {
            var temp = $scope.survey_questions[i-1];
            $scope.survey_questions[i-1] = $scope.survey_questions[i]
            $scope.survey_questions[i] = temp
        }
    };

    $scope.moveDown = function(i){
        if (i < $scope.survey_questions.length - 1) {
            var temp = $scope.survey_questions[i+1];
            $scope.survey_questions[i+1] = $scope.survey_questions[i];
            $scope.survey_questions[i] = temp
        }
    };


    $scope.addSurveyItem = function() {
        var default_item = {question: "", question_type: "textarea" };
        $scope.survey_questions.push(default_item);
    };

    $scope.deleteSurveyItem = function(index) {
        $scope.survey_questions.splice(index, 1);
    };

    //mode : 1 -> go from text to array
    //mode : 0 -> go from array to text
    $scope.parseSurveyItems = function(mode){

        for (var i = 0; i < $scope.survey_questions.length; i++) {

            if (mode) {
                if  ($scope.survey_questions[i].question_type == "radio" || $scope.survey_questions[i].question_type == "checkbox" ){
                    $scope.survey_questions[i].options = $scope.survey_questions[i].options_raw.split(",");
                }
            } else {
                if  ($scope.survey_questions[i].question_type == "radio" || $scope.survey_questions[i].question_type == "checkbox" ){
                    $scope.survey_questions[i].options_raw = $scope.survey_questions[i].options.join(",");
                }
            }

        }

    }

    $scope.showMoreInfoSurveyItem = function(type) {

        var info_types = {
            textarea : "A simple question that allows users to input free responses. Simply type the question you want to ask in the question field.",
            radio : "Give users select options to answer your question. Only one option can be picked. Simply add all the options you want to give users, separated by commas.",
            checkbox : "Give users multiple options to answer your question. More than one option can be picked. Simply add all the options you want to give users, separated by commas.",
            likert : "Allow users to answer on a scale. Pick the size of the scale (minimum 4, maximum 10). and add a label for the text to appear in the leftmost position and rightmost.",
            external : "Do you have a website you want to embed in the exit survey? Use the external option and provide the link. Useful when you want users to complete external surveys. " +
                "Data provided in external questions are not stored on Cartoscope.",
            title : "Want to add a title in your survey flow? Use this option.",
            text : "Want to add more text in your survey flow? Use this option."
        };

        var path_icon = "images/survey_icons/" + type + "_icon.png";

        var html_text = "<img  src=\"" + path_icon +"\" style=\"width: 120px;border: 1px solid\">" +
            "<p>" + info_types[type] + "</p>"

        swal({
            title: type,
            confirmButtonColor: '#9cdc1f',
            allowOutsideClick: true,
            html: true,
            text: html_text,
            type: 'info'
        });

    }

    $scope.fetchSurveyItems = function() {


        $http.get('/api/project/surveyItems/' + $scope.project.unique_code).then(function (sdata) {

            var survey_items_all = JSON.parse(sdata.data.survey_form);
            $scope.survey_questions = survey_items_all.questions;
            console.log($scope.survey_questions)
            $scope.parseSurveyItems(0)
            if ($scope.survey_questions.length){
                $scope.add_survey_text = "Update Survey";
            }

        }, function () {
            $scope.survey_questions = [];
        });
    }

    $scope.setSurveyItems = function() {

        console.log("Sending Survey Items");
        $scope.parseSurveyItems(1)

        $scope.survey = {
                questions: $scope.survey_questions
            }

            if ($scope.custom_description){
                $scope.survey.description = $scope.custom_description
            }

        $http.post('/api/project/createSurvey',
            {
                'unique_code': $scope.project.unique_code,
                'survey_type': $scope.project.survey_type,
                'survey': $scope.survey
            }).then(function () {

            //send message we good
            swal({
                title: 'Success!',
                confirmButtonColor: '#9cdc1f',
                allowOutsideClick: true,
                text: 'Survey added!',
                type: 'success'
            });

            }, function () {

                swalService.showErrorMsg('Something went wrong!');
            })
    };

    $scope.fetchSurveyItems();
}]);

module.controller('defaultController', ['$scope', 'userData', '$window', function($scope, userData, $window) {
    $window.location.href = '/UserProfile.html#/profile'
}]);

module.controller('projectPageController', ['$scope', 'userData', 'projectData',
  function($scope, userData, projectData) {

  }]);

module.controller('projectsPageController', ['$scope', 'userData', 'projects', '$timeout', '$http', 'swalService',
  '$state', 'projectCreators', function($scope, userData, projects, $timeout, $http, swalService, $state, projectCreators) {

    $scope.projects = projects;
    // console.log('$scope.projects ', $scope.projects);

    $scope.toggleArchive = function(project) {
      if (project.archived) {
        $scope.unArchiveProject(project);
      } else {
        $scope.archiveProject(project);
      }
    };

    $scope.archiveProject = function(project) {
      $http.get('/api/project/' + project.id + '/archive').then(function() {
        project.archived = 1;
      }).catch(function(error) {
        swalService.showErrorMsg(error.code || 'Couldn\'t archive the project, please try again.');
      });
    };

    $scope.unArchiveProject = function(project) {
      $http.get('/api/project/' + project.id + '/unarchive').then(function() {
        project.archived = 0;
      }).catch(function(error) {
        swalService.showErrorMsg(error.code || 'Couldn\'t archive the project, please try again.');
      });
    };

    var startTaskPath = window.location.protocol + '//' + window.location.host + '/api/tasks/startProject/';

    var getPathToStart = function(code) {
      return startTaskPath + code;
    };

    var showLinkModal = $('#show-link-modal');
    $scope.showLink = function(project) {
      if (project.published) {
        $scope.link = getPathToStart(project['unique_code']);
        showLinkModal.modal('show');
      }
    };

    $scope.copyToClip = function() {
      $('#link-text-inp').select();
      try {
        document.execCommand('copy');
        $scope.showCopiedMsg = true;
        $timeout(function() {
          $scope.showCopiedMsg = false;
          showLinkModal.modal('hide');
        }, 2000);
      } catch (err) {
        alert('Your browser doesn\'t support this feature yet. Please press ctrl+c to copy');
      }
    };

    $scope.goToEdit = function(project) {
      $state.go('root.projectEdit.step1', {project: project, id: project.id});
    };

    $scope.duplicateProject = function(project){
        $http.get('/api/project/duplicateProject/' + project.unique_code).then(function(data) {
            swal({
                title: 'Success!',
                confirmButtonColor: '#9cdc1f',
                allowOutsideClick: true,
                text: 'Project duplicated successfully',
                type: 'success',
                timer: 1500
            });
            //proceed to edit page
            $timeout( function(){

                //duplicate tutorial here:
                $http.get('/api/project/duplicateTutorial/' + data.data.old_code + "/" + data.data.new_code).then(function(tdt) {
                    console.log("Tutorial duplicated successfully")
                });


                //get project info first and then go to edit:
                $http.get('/api/tasks/getInfoFree/' + data.data.new_code).then(function(npdata) {
                    var new_project = npdata.data[0];

                    console.log(new_project)

                    //TODO: if survey is custom, we need to duplicate that as well.
                    if ( new_project.survey_type == "CUSTOM"){
                        //duplicate survey here:
                        $http.get('/api/project/duplicatesurveyItems/' + data.data.old_code + "/" + data.data.new_code).then(function(tdt) {
                            console.log("Survey duplicated successfully")
                        });
                    }

                    $scope.goToEdit(new_project)
                });




            }, 5000 );



        }, function(error){
            swal({
                title: 'Error!',
                confirmButtonColor: '#9cdc1f',
                allowOutsideClick: true,
                text: 'Error duplicating project',
                type: 'error',
                confirmButtonText: 'Back'
            });

          console.log(error)

        });
    }

        //Allow project creation for selected user
        // if ($scope.user.username == projectCreators) {$scope.allowProject = true}
        // else {$scope.allowProject = false}

        if($scope.user.is_creator == 1) {$scope.allowProject = true}
        else {$scope.allowProject = false}




  }]);


module.controller('hubsPageController', ['$scope', 'userData', 'hubs', '$timeout', '$http', 'swalService',
  '$state', 'projectCreators', function($scope, userData, hubs, $timeout, $http, swalService, $state, projectCreators) {

    $scope.hubs = hubs;
  
    var startTaskPath = window.location.protocol + '//' + window.location.host + '/hub/';

    var getPathToStart = function(code) {
      return startTaskPath + code;
    };

    var showLinkModal = $('#show-link-modal');
    $scope.showLink = function(hub) {
        $scope.link = getPathToStart(hub['url_name']);
        showLinkModal.modal('show');
    };

    $scope.copyToClip = function() {
      $('#link-text-inp').select();
      try {
        document.execCommand('copy');
        $scope.showCopiedMsg = true;
        $timeout(function() {
          $scope.showCopiedMsg = false;
          showLinkModal.modal('hide');
        }, 2000);
      } catch (err) {
        alert('Your browser doesn\'t support this feature yet. Please press ctrl+c to copy');
      }
    };

    //Edit Hubs
    $scope.goToHubEdit = function(hub) {
      $state.go('root.hubEdit.step1', {hub: hub});
    };


        if($scope.user.is_creator == 1) {$scope.allowProject = true}
        else {$scope.allowProject = false}




  }]);


module.controller('hubProjectCreationController', ['$scope', '$http', '$state', '$timeout', 'swalService', 'projectCreators',
  function($scope, $http, $state,$timeout, swalService, projectCreators) {
    
    
    $scope.goTo = function(to) {
      if ($scope.hub.id) {
        $state.go(to);
      }
    };

    $scope.isActive = function(stateName) {
      return $state.current && $state.current.name == stateName;
    };

    $scope.getNextText = function() {
      if ($state.current && $state.current.name == 'root.hubProjectCreation.step2') {
        return 'Publish';
      } else {
        return 'Next';
      }
    };

    $scope.goNext = function() {

      if ($state.current && $state.current.name == 'root.hubProjectCreation.step2') {
        $scope.openPublishPopup();
      } else {
        $scope.$broadcast('validate');
      }
    };

    $scope.hub = {};
    $scope.hub.editing = false;
    $scope.hub.task = {
      options: []
    };

    
    $scope.showPublish = true;
    $scope.$on('HubMoveNext', function(e, d) {
      var curr = $state.current.name;
      var stateMap = {
        'root.hubProjectCreation.step1': 'root.hubProjectCreation.step2'
        
      };
      try {
        $state.go(stateMap[curr], {hub: $scope.hub});
      }
      catch (e) {

      }
    });
    $scope.verifyCanPublish = function() {
      return $scope.hub.can_be_published  ;
    };


    $scope.openPublishPopup = function() {
      if ($scope.verifyCanPublish()) {
        $('#publishPopup').modal('show');
      } else {
        swalService.showErrorMsg('Please make sure you\'ve filled up the required details before you try to publish.');
      }
    };

    $scope.publish = function() {
      if ($scope.hub.hub_unique_code) {
        $http.post('/api/hub/publish', {hub_unique_code: $scope.hub.hub_unique_code}).then(function(data) {
          $scope.showPublish = false;
          $('#publishPopup').modal('hide');
            $timeout( function(){
                $state.go('root.hubs');
            }, 1000 );

        }, function(response) {
          var msg = response.data.error || 'Couldn\'t publish your hub, please try again';
          swalService.showErrorMsg(msg);
          $('#publishPopup').modal('hide');
        });
      }
    };


  }]);


module.controller('hubStepOneController', ['$scope', '$state', '$http', 'swalService',
  function($scope, $state, $http, swalService) {


    var invalid_characters = ['\\','/',':','?','\"','<','>','|'];
    $scope.has_external_signup = false;

    if ($scope.hub.hasOwnProperty("external_sign_up")){
        $scope.has_external_signup = true;
    }

    $scope.$on('validate', function(e) {
      $scope.validate();
    });

    $scope.validate = function() {
      if (!$scope.hub.name || !$scope.hub.description || !$scope.hub.url_name) {
        $scope.showErr = true;
        swalService.showErrorMsg('Please enter a name, a url name and description for the  hub project.');
      } else if (  invalid_characters.some(el => $scope.hub.url_name.includes(el))) {
          $scope.showErr = true;
          swalService.showErrorMsg('URL shortcut cannot contain the following characters: \n' + invalid_characters.join(','));
      } else if ($scope.has_external_signup && ($scope.hub.external_sign_up === "" || !$scope.hub.external_sign_up)){
          $scope.showErr = true;
          swalService.showErrorMsg('Please enter valid URL for external signup form.');
      }

      else {
        $scope.createHubProject();
      }
    };

    

    $scope.createHubProject = function() {
      if ($scope.hub.id ) {
        $scope.$emit('moveNext');
      } else {
        var fd = new FormData();
        if ($scope.coverPic) {
          fd.append('file', $scope.coverPic);
        }
        fd.append('name', $scope.hub.name);
        fd.append('description', $scope.hub.description);
          fd.append('url_name', $scope.hub.url_name);
          if ($scope.has_external_signup){
              fd.append('external_sign_up', $scope.hub.external_sign_up);
          }

          var link = '/api/hub/add'
          $http.post(link, fd, {
          transformRequest: angular.identity,
          headers: {'Content-Type': undefined}
        }).then(function(response) {
          var data = response.data;
          $scope.hub.id = data.id;
          $scope.hub['hub_unique_code'] = data.hub_unique_code;
          //console.log($scope.hub)
          $scope.$emit('HubMoveNext');
        }, function(response) {
          var msg = response.data.error || 'Couldn\'t create the hub project';
          //if we got a duplicate entry, it's because of the short name
          if (msg == "ER_DUP_ENTRY") {
            msg = 'A project with the same url name already exists!'
          }
          console.log(response)
          swalService.showErrorMsg(msg);
        });
      }
    };

    var handleImage = function(f) {
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
    };

    $scope.$watch('coverPic', function() {
      if ($scope.coverPic) {
        handleImage($scope.coverPic);
      }
    });

  }]);



  module.controller('hubStepTwoController', ['$scope', '$state', '$http', 'swalService', function($scope, $state, $http, swalService) {

    $scope.$on('validate', function(e) {
      $scope.validate();
    });
  
    $scope.validate = function() {
      $scope.$emit('HubMoveNext');
    };

    $scope.subproject_list = [];
    $scope.hub_subproject_items = []
    $scope.options_dictionary = {}
  
  
      $scope.add_tutorial_text = "Add Subprojects to Hub";

      $scope.visitSubProjectPage = function(subproject_id){
        var project_code = $scope.options_dictionary[parseInt(subproject_id)].unique_code
        var link = "kioskProject.html#/kioskStart/" + project_code;
        window.open(link); 
      }
        
      //Add subproject info
      $scope.addSubProjectItem = function(){
          $scope.hub_subproject_items.push({
            subproject_id: null,
            category:null
          });
          console.log($scope.hub_subproject_items);
      };
  
      $scope.deleteSubProjectItem = function(index) {
          $scope.hub_subproject_items.splice(index, 1);
      };
  
      //get the list of subprojects to choose from
      $scope.fetchSubProjectList = function(){
              $http.get('/api/user/projects' ).then(function (sdata) {
                $scope.subproject_list  = sdata.data;
                $scope.subproject_list.forEach(function(item){
                  var templ  = JSON.parse(item.template);
                  delete item.template;
                  item.template = templ;
                  $scope.options_dictionary[item.id] = item;
                })
              });
      };
  
      //TODO: Store project codes
      $scope.setSubProjectItems = function(){

        if ($scope.hub_subproject_items.length < 2){
          swalService.showErrorMsg("You will need at least two subprojects to make a hub!");
        } else {
          var projects_to_send = [];
          var categories_to_send = [];
          $scope.hub_subproject_items.forEach(function(item){
            projects_to_send.push($scope.options_dictionary[parseInt(item.subproject_id)])
            if (item.category){
              categories_to_send.push(item.category)
            }
          })  
          if (categories_to_send.length != $scope.hub_subproject_items.length){
            swalService.showErrorMsg("You have to select one category for each subproject.");
          } else {
            $http.post('/api/hub/addSubprojectItems',
            {
                'hub_unique_code': $scope.hub.hub_unique_code,
                'subproject_items': projects_to_send,
                'categories_items': categories_to_send
            }).then(function () {

            //send message we good
            swal({
                title: 'Success!',
                confirmButtonColor: '#9cdc1f',
                allowOutsideClick: true,
                text: 'Subprojects added!',
                type: 'success'
            });
            $scope.hub.can_be_published = true;
            

        }, function (err) {
            swalService.showErrorMsg(err);
        })
    }
          }
            

      };
  
    
  
  
      $scope.fetchSubProjectList();
  
  }]);


  module.controller('hubEditController', ['$scope', '$http', '$state','$timeout', 'swalService', 'hub',
  function($scope, $http, $state,$timeout, swalService, hub) {
    $scope.hub = hub;

    if (!$scope.hub.editing) {
      $scope.hub.editing = true;
    }

    $scope.goTo = function(to) {
      if ($scope.hub.id) {
        $state.go(to);
      }
    };

    $scope.isActive = function(stateName) {
      return $state.current && $state.current.name == stateName;
    };

    $scope.getNextText = function() {
      return 'Save';
    };
    $scope.goNext = function() {

      if ($state.current && $state.current.name == 'root.hubEdit.step2') {
        $scope.openPublishPopup();
      } else {
        $scope.$broadcast('validate');
      }
    };

    $scope.$on('HubMoveNext', function(e, d) {
      var curr = $state.current.name;
      console.log(curr)
      var stateMap = {
        'root.hubEdit.step1': 'root.hubEdit.step2',
      };
      try {
        $state.go(stateMap[curr], {hub: $scope.hub});
      }
      catch (e) {
        console.log(e)

      }
    });
    
    $scope.verifyCanPublish = function() {
      return $scope.hub.can_be_published  ;
    };


    $scope.openPublishPopup = function() {
      if ($scope.verifyCanPublish()) {
        $('#publishPopup').modal('show');
      } else {
        swalService.showErrorMsg('Please make sure you\'ve filled up the required details before you try to publish.');
      }
    };

    $scope.publish = function() {
      if ($scope.hub.hub_unique_code) {
        $http.post('/api/hub/publish', {hub_unique_code: $scope.hub.hub_unique_code}).then(function(data) {
          $scope.showPublish = false;
          $('#publishPopup').modal('hide');
            $timeout( function(){
                $state.go('root.hubs');
            }, 1000 );

        }, function(response) {
          var msg = response.data.error || 'Couldn\'t publish your hub, please try again';
          swalService.showErrorMsg(msg);
          $('#publishPopup').modal('hide');
        });
      }
    };

  }]);


  module.controller('hubStepTwoEditController', ['$scope', '$state', '$http', 'swalService', 'hub', function($scope, $state, $http, swalService, hub) {


    $scope.hub = hub;

    $scope.$on('validate', function(e) {
      $scope.validate();
    });
  
    $scope.validate = function() {
      $scope.$emit('HubMoveNext');
    };

    $scope.subproject_list = [];
    $scope.hub_subproject_items = []
    $scope.options_dictionary = {}
  
  
      $scope.add_tutorial_text = "Update Hub Subprojects";

      $scope.visitSubProjectPage = function(subproject_id){
        var project_code = $scope.options_dictionary[parseInt(subproject_id)].unique_code
        var link = "kioskProject.html#/kioskStart/" + project_code;
        window.open(link); 
      }
        
      //Add subproject info
      $scope.addSubProjectItem = function(){
          $scope.hub_subproject_items.push({
            subproject_id: null,
            category:null
          });
          console.log($scope.hub_subproject_items);
      };
  
      $scope.deleteSubProjectItem = function(index) {
          $scope.hub_subproject_items.splice(index, 1);
      };
  
      //get the list of subprojects to choose from
      $scope.fetchSubProjectList = function(){
              $http.get('/api/user/projects' ).then(function (sdata) {
                $scope.subproject_list  = sdata.data;
                $scope.subproject_list.forEach(function(item){
                  var templ  = JSON.parse(item.template);
                  delete item.template;
                  item.template = templ;
                  $scope.options_dictionary[item.id] = item;
                })
              });
      };
  
      //TODO: Store project codes
      $scope.setSubProjectItems = function(){

        if ($scope.hub_subproject_items.length < 2){
          swalService.showErrorMsg("You will need at least two subprojects to make a hub!");
        } else {
          var projects_to_send = [];
          var categories_to_send = [];
          $scope.hub_subproject_items.forEach(function(item){
            projects_to_send.push($scope.options_dictionary[parseInt(item.subproject_id)])
            if (item.category){
              categories_to_send.push(item.category)
            }
          })  
          if (categories_to_send.length != $scope.hub_subproject_items.length){
            swalService.showErrorMsg("You have to select one category for each subproject.");
          } else {
            $http.post('/api/hub/addSubprojectItems',
            {
                'hub_unique_code': $scope.hub.hub_unique_code,
                'subproject_items': projects_to_send,
                'categories_items': categories_to_send
            }).then(function () {

            //send message we good
            swal({
                title: 'Success!',
                confirmButtonColor: '#9cdc1f',
                allowOutsideClick: true,
                text: 'Subprojects added!',
                type: 'success'
            });
            $scope.hub.can_be_published = true;
            

        }, function (err) {
            swalService.showErrorMsg(err);
        })
    }
          }
            

      };
      $scope.fetchSubProjectList();
      //we are in editing, we already have info, let's populate the fields:
      var existingCodes = $scope.hub.project_codes.split(",");
      var existingCategories = $scope.hub.results_labels.split(",");
      console.log(existingCodes)
      for (var i = 0; i < existingCodes.length; i++) {
        $scope.hub_subproject_items.push({
          subproject_id: existingCodes[i],
          category:existingCategories[i]
        });
      }
      console.log($scope.hub_subproject_items)

  
  }]);

  module.controller('hubStepOneEditController', ['$scope', '$state', '$http', 'swalService', 'hub',
  function($scope, $state, $http, swalService, hub) {

    $scope.hub = hub;
    console.log(hub);
    var invalid_characters = ['\\','/',':','?','\"','<','>','|'];
    $scope.has_external_signup = false;

    if ($scope.hub.hasOwnProperty("external_sign_up") && $scope.hub.external_sign_up ){
        $scope.has_external_signup = true;
    }

    $scope.$on('validate', function(e) {
      $scope.validate();
    });

    $scope.validate = function() {
      if (!$scope.hub.name || !$scope.hub.description || !$scope.hub.url_name) {
        $scope.showErr = true;
        swalService.showErrorMsg('Please enter a name, a url name and description for the  hub project.');
      } else if (  invalid_characters.some(el => $scope.hub.url_name.includes(el))) {
          $scope.showErr = true;
          swalService.showErrorMsg('URL shortcut cannot contain the following characters: \n' + invalid_characters.join(','));
      } else if ($scope.has_external_signup && ($scope.hub.external_sign_up === "" || !$scope.hub.external_sign_up)){
          $scope.showErr = true;
          swalService.showErrorMsg('Please enter valid URL for external signup form.');
      }

      else {
        $scope.createHubProject();
      }
    };

    

    $scope.createHubProject = function() {
      
        var fd = new FormData();
        if ($scope.coverPic) {
          fd.append('file', $scope.coverPic);
        }
        fd.append('hub_unique_code', $scope.hub.hub_unique_code);
        fd.append('name', $scope.hub.name);
        fd.append('description', $scope.hub.description);
        fd.append('url_name', $scope.hub.url_name);
          if ($scope.has_external_signup){
              fd.append('external_sign_up', $scope.hub.external_sign_up);
          }

          var link = '/api/hub/edit' 
          $http.post(link, fd, {
          transformRequest: angular.identity,
          headers: {'Content-Type': undefined}
        }).then(function(response) {
          //console.log($scope.hub)
          $scope.$emit('HubMoveNext');
        }, function(response) {
          var msg = response.data.error || 'Couldn\'t create the hub project';
          //if we got a duplicate entry, it's because of the short name
          if (msg == "ER_DUP_ENTRY") {
            msg = 'A project with the same url name already exists!'
          }
          console.log(response)
          swalService.showErrorMsg(msg);
        });
      
    };

    var handleImage = function(f) {
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
    };

    $scope.$watch('coverPic', function() {
      if ($scope.coverPic) {
        handleImage($scope.coverPic);
      }
    });

  }]);
  
module.controller('userProfileController', ['$scope','$http', '$state', 'projectCreators', function($scope, $http, $state, projectCreators) {
    $scope.projects = {};

    $scope.showProjectDetails = showProjectDetails;

    // console.log('user' , $scope.user);
    /**
     * A get request to fetch all the projects created by a user.
     */
    $http.get('/api/user/projects/').then(function(data) {
        $scope.projects = data.data;
        // console.log('projects' , data.data);
    }).catch(function(error) {
        return undefined;
    });

    function showProjectDetails(project){
        $scope.currentProject = project;
        $state.go('root.showProjectDetails', {project: project});
    }

  $scope.editProfile = function() {
     $('#editModal').modal('show');
  };


    //Allow project creation for selected user
    //if ($scope.user.username == projectCreators) {$scope.allowProject = true}
    //else {$scope.allowProject = false}

    if($scope.user.is_creator == 1) {$scope.allowProject = true}
    else {$scope.allowProject = false}


    $scope.update = function() {
        var fd = new FormData();

        fd.append('username', $scope.user.username);
        fd.append('userId', $scope.user.id);
        var password =  $scope.user.password;

        if ($scope.user.password!== '' &&  $scope.user.password !== $scope.user.repPassword) {
            swal({
                title: 'Error!',
                confirmButtonColor: '#9cdc1f',
                allowOutsideClick: true,
                text: 'Passwords do not match',
                type: 'error',
                confirmButtonText: 'Back'
            });
            return;
        } else if(typeof password !== "undefined"){
            fd.append('password', password);
        }

        if ($scope.user.email!= '' && !validateEmail($scope.user.email)) {
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
            fd.append('email', $scope.user.email);
        }
        if ($scope.user.profilePic != '') {
            fd.append('profilePic', $scope.user.profilePic);
        }
        if ($scope.user.bio != '') {
            fd.append('bio',$scope.user.short_bio);
        }
        /**
         * A post request is made for posting the new details of the user whenever the user wants to edit the profile.
         */
        $http.post('/api/user/editUser/', fd, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        }).then(function(response) {
            var data = response.data;
            if ('id' in data) {
                document.location.href = '/UserProfile.html';
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

        $scope.$watch('user.profilePic', function() {

            if ($scope.user.profilePic) {
                handleImage($scope.user.profilePic);
            }
        });

        function validateEmail(email) {
            var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(email);
        }
    };


}]);




module.controller('inatReportController',
    function($scope, $http, $state,$stateParams) {


        $scope.reported_so_far = 0;

        $scope.have_images = 0;
        $scope.progress_b = 0;
        $scope.reporting = 0;
        $scope.success_report = 0;
        $scope.session_id = $stateParams.session_id;
        $scope.access_token = $stateParams.code;

        //header for posting identifications added here
        var auth_header = {
            "Authorization": "Bearer " + $scope.access_token,
            "Content-Type": "application/json"};



        //get images from this session_id that will have to be reported back
        $http.get('/api/inat/getAvailableImagesReport/' +  $scope.session_id).then(function(pdata) {

            $scope.report_data = pdata.data;

            if ($scope.report_data.length){
                //TODO: make an array that has state of checkbox (start it at checked, image, and category
                $scope.have_images = 1;
            }
        });


        $scope.reportToINAT = function(){
            console.log("Will report");

            $scope.reporting = 1;
            $scope.identifications = [];
            $scope.carto_ids = [];
            //how many will we report?
            $scope.report_count = $scope.report_data.filter((obj) => obj.checked === true).length;

            $scope.report_data.forEach(function(item){

                console.log(item);

                if (item.checked){
                    $scope.sendReport({
                        "observation_id": item.observation_id,
                        "taxon_id": item.taxon_id,
                        "current": true,
                        "body": "Identified using Cartoscope."
                    },item.id);
                    $scope.carto_ids.push(item.id);
                }

            });


        }

        $scope.sendReport = function(bd,id){
            var body = {'identification': bd};

            //post to iNaturalist:
            $http.post('https://api.inaturalist.org/v1/identifications', body, {headers: auth_header}).then(function(data){
                console.log(data);
                $scope.reported_so_far = $scope.reported_so_far + 1;
                var pb = $scope.reported_so_far / $scope.report_count;
                $scope.progress_b = Math.round((pb * 100)) ;

                var ident_id = data.data.id;
                //report that we have it now
                $http.post('/api/inat/updateReportedRecords',
                    {
                        'identification_id': ident_id,
                        'session_id': $scope.session_id,
                        'report_id': id

                });



                if ($scope.reported_so_far == $scope.report_count) {
                    $scope.success_report = 1;

                }


            }, function (err) {
                console.log(err)
            })
        }


    });


module.directive('fileModel', ['$parse', '$timeout', function($parse, $timeout) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      var model = $parse(attrs.fileModel);
      var setter = model.assign;

      element.bind('change', function() {
        $timeout(function() {
          setter(scope, element[0].files[0]);
        });
      });
    }
  };
}]);

module.directive("fileread", [function () {
    return {
        scope: {
            fileread: "="
        },
        link: function (scope, element, attributes) {
            element.bind("change", function (changeEvent) {
                var reader = new FileReader();
                reader.onload = function (loadEvent) {
                    scope.$apply(function () {
                        scope.fileread = loadEvent.target.result;
                    });
                }
                reader.readAsDataURL(changeEvent.target.files[0]);
            });
        }
    }
}]);

module.factory('busyIndicator', ['$q', '$rootScope', function($q, $rootScope) {
  var numLoadings = 0;
  return {
    request: function(config) {
      numLoadings++;
      $rootScope.$broadcast('loader_show');
      return config || $q.when(config);
    }, response: function(response) {
      if ((--numLoadings) === 0) {
        $rootScope.$broadcast('loader_hide');
      }
      return response || $q.when(response);
    }, responseError: function(response) {
      if (!(--numLoadings)) {
        $rootScope.$broadcast('loader_hide');
      }
      return $q.reject(response);
    }
  };
}]);

module.directive('loader', function() {
  return function($scope, element) {
    $scope.$on('loader_show', function() {
      element.addClass('loader').removeClass('hidden');
    });
    return $scope.$on('loader_hide', function() {
      element.removeClass('loader').addClass('hidden');
    });
  };
});

module.directive('csTooltip', function($rootScope) {
  return function($scope, element, attrs) {
    $(element).tooltip();
  };
});

module.factory('swalService', function() {
  var service = {};

  service.showErrorMsg = function(errorMsg) {
    swal({
      title: 'Error!',
      confirmButtonColor: '#9cdc1f',
      allowOutsideClick: true,
      text: errorMsg,
      type: 'error',
      confirmButtonText: 'Back'
    });
  };
  return service;
});


// login module

module.controller('loginController', ['$scope', '$http', '$state',
    function($scope, $http,$state) {

    $scope.userRegData = {};
    $scope.loginData = {};

    $scope.checkLogin = function() {
        $http.get('/api/user').then(function(response) {
             window.location.replace('/UserProfile.html');
            //window.location.replace('/userProfile/showAllProjects.html');
        }, function(response) {

        });
    };
    $scope.checkLogin();

    $scope.register = function() {
        var fd = new FormData();
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
        if ($scope.userRegData.bio) {
            fd.append('bio', $scope.userRegData.bio);
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

        // for (var pair of fd.entries()) {
        //     console.log(pair[0]+ ', ' + pair[1]);
        // }
        /**
         * A post request is made for posting the new user to the server by giving the user details.
         */
        $http.post('/api/user/add', fd, {
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

        /**
         * A request which posts the username and password of the user to update the last login of the user.
         */
        $http.post('api/login', data).then(function(response) {
            var data = response.data;
            if ('id' in data) {
                //redirect to old home
                //document.location.href = '/UserProfile.html#/';
                $state.go('root.home');

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

module.directive('fileModel', ['$parse', function($parse) {
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

module.directive('ngEnter', function() {
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


module.directive('scrollTo', function() {
  return function($scope, element, attrs) {
    var bodyElem = $("html,body");

    if(attrs['scrollTo'] === "end"){
      $(element).click(function() {
        bodyElem.animate({scrollTop:$(document).height()},100);
        return false;
      });
    }
    else if(attrs['scrollTo'] === "top"){
      $(element).click(function() {
        bodyElem.animate({scrollTop:0},100);
        return false;
      });
    }
    else {
      $(element).click(function() {
        var currentTop = bodyElem.scrollTop();
        var top = $(attrs['scrollTo']).offset().top;

        if(currentTop > top){
          top -=20;
        }

        bodyElem.animate({scrollTop:top},100);
        return false;
      });
    }

  };
});
