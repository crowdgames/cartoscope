/**
 * Created by kiprasad on 26/09/16.
 */
var module = angular.module('taskApp', ['ui.router', 'ngMap','configApp','ngJuxtapose']);

//change \n to br
module.filter("textBreaks", ['$sce', function ($sce) {
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

module.config(['$locationProvider', function($locationProvider: any) {
  // $locationProvider.html5Mode({
  //   enabled: true,
  //   requireBase: false,
  // });
}]);

module.config(function($stateProvider: any, $urlRouterProvider: any) {
  
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

module.controller('defaultController', ['$scope', '$location', function($scope, $location) {
  $scope.uiMask = {};
  $scope.uiMask.show = false;
}]);




// module.controller('MapController', ['$scope','$timeout', 'NgMap', function($scope, $timeout, NgMap) {
//     var vm = this;
//     vm.centerChanged = centerChanged;
//     vm.zoomChanged = zoomChanged;
//     vm.fetchCenter = fetchCenter;
//     vm.map={};
//     vm.lat="";
//     vm.lang="";
//
//     //Map initialization
//     NgMap.getMap().then(function(map) {
//         vm.map = map;
//         var myLatlng = new google.maps.LatLng(Number($scope.getLat()),Number($scope.getLng()));
//         vm.map.setCenter(myLatlng);
//         latCenter = vm.map.getCenter().lat();
//         lngCenter = vm.map.getCenter().lng();
//         vm.lat= latCenter;
//         vm.lang = lngCenter;
//         //console.log(latCenter, lngCenter);
//     });
//
//     function fetchCenter(){
//         console.log('In get Center ');
//         var lng = $scope.getLng();
//         var lat = $scope.getLat();
//
//         var myLatlng = new google.maps.LatLng(Number($scope.getLat()),Number($scope.getLng()));
//         vm.map.setCenter(myLatlng);
//
//         return [lat,lng];
//     }
//
//     function centerChanged() {
//         console.log('IN center CHnaged' +vm.map.getCenter().lat(), vm.map.getCenter().lng() );
//         $scope.centerLat = vm.map.getCenter().lat();
//         $scope.centerLng = vm.map.getCenter().lng();
//         latCenter = vm.map.getCenter().lat();
//         lngCenter = vm.map.getCenter().lng();
//     }
//
//     function zoomChanged() {
//         console.log('IN ZOom CHnaged'+ vm.map.getCenter().lat(), vm.map.getCenter().lng());
//         $scope.centerLat = vm.map.getCenter().lat();
//         $scope.centerLng = vm.map.getCenter().lng();
//         latCenter = vm.map.getCenter().lat();
//         lngCenter = vm.map.getCenter().lng();
//     }
//
// }]);

module.controller('taskController', ['$scope', '$location', '$http', 'userData', '$window', '$timeout', 'NgMap','$q', '$sce',  'heatMapProject1', 'heatMapProject2',
  function($scope, $location, $http, userData,  $window, $timeout, NgMap, $q,$sce,  heatMapProject1, heatMapProject2) {
      $window.document.title = "Tasks";

      var vm: any = this;
      vm.centerChanged = centerChanged;
      vm.zoomChanged = zoomChanged;
      vm.fetchCenter = fetchCenter;
      vm.resetZoom = resetZoom;
      vm.showModal = showModal;
      vm.hideModal = hideModal;
      vm.getTasks = getTasks;
      vm.handleEnd = handleEnd;
      vm.handleFinish =handleFinish;
      vm.skipToSurvey = skipToSurvey;
      vm.getColourClass =getColourClass;
      vm.getLat = getLat;
      vm.getLng = getLng;
      vm.submit = submit;
      vm.getNextTask = getNextTask;
      vm.setCurrentPos = setCurrentPos;
      vm.showBiggerImg = showBiggerImg;
      vm.hideBiggerImg = hideBiggerImg;
      vm.addMarker = addMarker;
      vm.getFullIframe = getFullIframe;
      vm.injectMarkerInFrame = injectMarkerInFrame;


      vm.map={};
      vm.lat="";
      vm.lang="";
      vm.code = $location.search().code;
      vm.image = "";

      $scope.votedLat = "";
      $scope.votedLng = "";

      //for markers and flight path mode
      $scope.geoMarkers = [];
      $scope.icon_array =  ['/images/dots/cs_green_dot.svg',
          '/images/dots/cs_yellow_dot.svg',
          '/images/dots/cs_orange_dot.svg',
          '/images/dots/cs_red_dot.svg',
          '/images/dots/cs_blue_dot.svg',
          '/images/dots/cs_purple_dot.svg',
          '/images/dots/cs_grey_dot.svg'];

      //enable flight path for specific project
      vm.showFlightPath = false;

      //enable POI marker selection for specific project
      vm.showMarkerPoints = false;
      vm.viewMarkerPoints = false;

      $scope.point_array =  ['/images/markers/marker_green2.svg',
          '/images/markers/marker_yellow2.svg',
          '/images/markers/marker_orange2.svg',
          '/images/markers/marker_red2.svg',
          '/images/markers/marker_blue2.svg',
          '/images/markers/marker_purple2.svg',
          '/images/markers/marker_grey.svg'];


      //for chaining, look for the parameter:
      vm.chaining = $location.search().chain;
      //Disable chaining
      vm.chaining = -1;
      //progress bars
      $scope.next_per2 = 0;
      //enable required amount
      $scope.showSurvButton = false;
      //init slider obj
      vm.slider_obj = {};
      //if we do loop after we reach end
      vm.image_loop = $location.search().image_loop || 0;


      vm.showChainQuestions = 0;
      //if -1, then we never asked for chaining, do not show the questions
      if (vm.chaining != -1) {
          vm.showChainQuestions = 1;
          if (vm.chaining == 0) {
              $scope.cont_button = "GO TO SURVEY"
          } else {
              $scope.cont_button = "GO TO NEXT TASK"
          }

      } else {
          $scope.cont_button = "GO TO SURVEY"
      }
      vm.cairn_messages = [];
      vm.showCairnMessages = false;
      vm.submitCairn = function(msg){
          console.error("The old Cairn code is triggering, and this should not be happening. Disable it");
          /**
          vm.cairn_messages = [];

          vm.cairnTitle = "Great! See what others have left for you!";
          //store cairn
          var body = {
              projectID: vm.data.id,
              message: msg,
              progress: vm.data.progress
          };
          $http.post('/api/tasks/submitCairn', body).then(function(cairn_data){
              //we get back messages from others, prep and show!
              cairn_data.data.forEach(function(item){
                  vm.cairn_messages.push(item.message)
              });
              vm.showCairnMessages = true;
          })
          */
      };


      vm.cairnTitle = "Pick a message for others to find!";
      vm.fetchCairns = function() {

          vm.showCairnMessages = false;
         vm.cairn_options = [];
          //Read them from csv:
          d3.csv('/images/cairn_message_list.csv', function (csv_data) {
              d3.shuffle(csv_data);
              for(var i = 0, length = 4; i < length; i++){
                  vm.cairn_options.push(csv_data[i].message)
              }
          });
      };

      vm.resetCairnModal = function(){
          vm.fetchCairns();
          (<any>$("#cairnModal")).modal('hide');
      }

      /* ==============================
       * SOAPSTONE CODE
       * ============================== */ 
      
      vm.tasksToCompleteTillSoapstoneMsg      = 2;
      vm.tasksToCompleteTillPhysics           = 5;
      vm.tasksToCompleteTillSoapstoneCreation = 3;

      vm.handleSoapstones = () => {
          vm.timeCairnShownToPlayer = Math.floor(Date.now() / 1000);
          if (vm.data.progress % vm.tasksToCompleteTillSoapstoneCreation === 0) {
              // Show the create modal
              let soapstoneForm = document.getElementById("soapstone-form");
              let soapstone     = vm.randomSoapstone();
              vm.replaceFormElemsWithSoapstone(soapstoneForm, soapstone);
              (<any>$("#soapstoneCreateModal")).modal('show');
          }
          else if (vm.data.progress % vm.tasksToCompleteTillSoapstoneMsg === 0) {
              // Show a message someone else has left
              vm.showNewSoapstoneMsg();
          }
          else if (vm.data.progress % vm.tasksToCompleteTillPhysics === 0) {
              // Show a message someone else has left
              vm.showPhysicsDiv();
          }
      }

      vm.showNewSoapstoneMsg = () => {
          let body = { projectID: vm.data.id, cairnType: "soapstone" };
          // TODO this should be a get
          $http.post('api/tasks/getCairns', body).then((serverReturn: any) => {
              if (serverReturn.data.length > 0) {
                  let message: string = serverReturn.data[0].message;
                   Toastify({
                     text: message,
                     duration: 10000,
                     close: true,
                     gravity: "top", // `top` or `bottom`
                     positionLeft: true, // `true` or `false`
                     backgroundColor: "#4663ac"
                   }).showToast();
                   Toastify({
                     text: "Another user left you a message: ",
                     duration: 3000,
                     close: true,
                     gravity: "top", // `top` or `bottom`
                     positionLeft: true, // `true` or `false`
                     backgroundColor: "#CD6155"
                   }).showToast();
              }
              else {
                  console.error("No relevant soapstone messages found");
              }
          });
      }

      vm.randomSoapstone = () => {
          var soapStones = [["Hi there", ["Bob,", "Jeff,", "Sandra,"], "it's nice to meet you! I love your", ["hat", "french toast", "incredible pecs"]]];
          return soapStones[Math.floor(Math.random() * soapStones.length)];
      }

      vm.replaceFormElemsWithSoapstone = (form: HTMLElement, soapstone: (string | string[])[]) => {
          // clear form
          form.innerHTML = '';
          soapstone.forEach(function (elem) {
              if (typeof elem === "string") {
                  var label = document.createElement("form");
                  label.innerText = elem;
                  form.appendChild(label);
              }
              else {
                  var selector = document.createElement("select");
                  selector.setAttribute("class", "custom-select mr-sm-2");
                  elem.forEach(function (optionStr) {
                      var option = document.createElement("option");
                      option.setAttribute("value", optionStr);
                      option.innerText = optionStr;
                      selector.appendChild(option);
                  });
                  form.appendChild(selector);
              }
          });
      }
      $('#soapstoneCreateModal').on('hide.bs.modal', () => {
          vm.submitSoapstone();
      })

      vm.normalSoapstoneModalExit = false;
      vm.doNormalSoapstoneModalExit = () => {
          vm.normalSoapstoneModalExit = true;
      }

      vm.submitSoapstone = () => {
          let soapstoneFormValues = Array.from(document.getElementById("soapstone-form")!.children)
              .map((child) => 
                   child.localName === "select" 
                       ? (child as HTMLSelectElement).value
                       : (child as HTMLFormElement).innerText
                  )
              .join(" ");
          let cairnType: string;
          let message: string;
          if (vm.normalSoapstoneModalExit) {
              console.log("submitting: " + soapstoneFormValues);
              cairnType = "soapstone"
              message = soapstoneFormValues;
          }
          else {
              console.log("submitting empty soapstone");
              cairnType = "empty-soapstone"
              message = "";
          }
          let body = {
              projectID: vm.data.id,
              message: message,
              cairnType: cairnType,
              progress: vm.data.progress - 1,
              time_shown_to_player: vm.timeCairnShownToPlayer,
              task_name: vm.previousTaskName
          };
          $http.post('api/tasks/submitCairn', body).then((data: object) => console.log(data));
          vm.normalSoapstoneModalExit = false;
      }

      vm.submittedEmoji = "";
      vm.submitEmoji = (submittedEmoji: string) => {
          vm.submittedEmoji = submittedEmoji;
          vm.addEmojiToPhysics(submittedEmoji);
          $scope.isEmojiPickerHidden = true;
          // The actual sending of the emoji to the database happens in hidePhysicsDiv
      }

      vm.addEmojiToPhysics = (emojiToAdd: string) => {
          let newEmoji = Bodies.circle(Math.random() * 400 + 20, 100, 20, {
              render :{
                  sprite: {
                      texture: 'images/emojis/' + emojiToAdd + '.png',
                      xScale: 0.1,
                      yScale: 0.1
                  }
              },
              "restitution": 0.8
          });
          World.add(vm.engine.world, [newEmoji]);
      }

      vm.showPhysicsDiv = () => {
          vm.showModal();
          $scope.isMainTaskImgHidden = true;
          $scope.isMatterDivHidden   = false;
          $scope.isEmojiPickerHidden = false;
          Render.run(vm.render);
          vm.hideModal();
      }

      vm.hidePhysicsDiv = () => {
          $scope.isMainTaskImgHidden = false;
          $scope.isMatterDivHidden   = true;
          Render.stop(vm.render);
          let wasEmojiSubmitted = !(vm.submittedEmoji === "");
          let cairnType = wasEmojiSubmitted ? "emoji" : "empty-emoji";
          let message   = wasEmojiSubmitted ? vm.submittedEmoji : "";
          let body = {
              projectID: vm.data.id,
              message: message,
              cairnType: cairnType,
              progress: vm.data.progress - 1,
              time_shown_to_player: vm.timeCairnShownToPlayer,
              task_name: vm.previousTaskName
          };
          $http.post('api/tasks/submitCairn', body).then((data: object) => console.log(data));
          vm.submittedEmoji = "";
      }

      vm.showPhysicsModal = () => (<any>$("#physicsModal")).modal('show')
      vm.showEmojiModal   = () => {
          (<any>$("#emojiModal")).modal('show')
      }

      vm.submitPhysics = () => {
          console.log("Physics Submitted");
      }

      $scope.isMainTaskImgHidden = false;
      $scope.isMatterDivHidden = true;
      vm.handleDebug = () => {
          console.log("Debugging");
          console.log(vm.tasks);
          // $scope.isMainTaskImgHidden = !$scope.isMainTaskImgHidden;
          // $scope.isMatterDivHidden = !$scope.isMatterDivHidden;
      }

      let Engine          = Matter.Engine,
          Render          = Matter.Render,
          Runner          = Matter.Runner,
          World           = Matter.World,
          MouseConstraint = Matter.MouseConstraint,
          Mouse           = Matter.Mouse,
          Bodies          = Matter.Bodies;

      vm.initializePhysics = () => {
          console.log("Beginning creation of physics div");
          vm.isPhysicsModalCreated = true;
          // module aliases

          // create an engine
          vm.engine = Engine.create();

          let physicsHost = document.getElementById("physicsBody")!;

          // create a renderer
          vm.render = Render.create({
              element: physicsHost,
              engine: vm.engine,
              options: {
                  width: 465,
                  height: 600,
                  wireframes: false
              }
          });

          var mouse = Mouse.create(vm.render.canvas),
              mouseConstraint = MouseConstraint.create(vm.engine, {
              mouse: mouse,
              constraint: {
                  stiffness: 0.2,
                  render: {
                      visible: false
                  }
              }
          });

          var ground    = Bodies.rectangle(400 , 610 , 810 , 60  , { isStatic: true });
          var leftWall  = Bodies.rectangle(0   , 300 , 20  , 610 , { isStatic: true });
          var rightWall = Bodies.rectangle(465 , 300 , 20  , 610 , { isStatic: true });
          var topWall   = Bodies.rectangle(300 , 0   , 810  , 20 , { isStatic: true });

          // add all of the bodies to the world
          World.add(vm.engine.world, [ground, leftWall, rightWall, topWall]);
          World.add(vm.engine.world, mouseConstraint);

          // run the engine
          Runner.run(vm.engine);

          let body = { projectID: vm.data.id, cairnType: "emoji", number: 50 };
          $http.post('api/tasks/getCairns', body).then((serverReturn: object) => {
              if (serverReturn["data"].length > 0) {
                  serverReturn["data"].forEach((cairn: object, index: number) =>
                      setTimeout(() => {
                          let emojiFromDatabase = cairn["message"];
                          vm.addEmojiToPhysics(emojiFromDatabase);
                      }, index * 50))
              } 
              else console.error("No relevant emojis found");
          });
      }

      //for NGS tasks
      function getFullIframe(){

          var link = vm.data.image_source;
          var zoom = vm.defZoom;
          var x = vm.getLat();
          var y = vm.getLng();
          var url = link + '#' + zoom + '/'+  x + '/' + y;
          return  $sce.trustAsResourceUrl(url)
      };

      vm.alertText = function(text){
          if (text){
              //alert(text)

              swal({
                  title: "Explanation",
                  confirmButtonColor: '#9cdc1f',
                  allowOutsideClick: true,
                  html: true,
                  text: text,
                  confirmButtonText: 'Back'
              });
          } else {
              swal({
                  title: "Explanation",
                  confirmButtonColor: '#9cdc1f',
                  allowOutsideClick: true,
                  text: "No additional information available for this example.",
                  confirmButtonText: 'Back'
              });
          }
      };

      vm.alertLoop = function(){

          swal({
              title: "Reached End!",
              text: "Good job! Click continue to keep labeling images, or Survey to quit and go to the survey.",
              type: 'info',
              showCancelButton: true,
              confirmButtonColor: '#9cdc1f',
              cancelButtonColor: '#d33',
              confirmButtonText: 'Proceed to Survey',
              cancelButtonText: 'Continue Labeling',
              buttonsStyling: false
          }, function(){

              if (vm.userType == "kiosk") {
                  vm.handleEnd();
              } else {
                  vm.handleFinish();
              }
          })



      };


      vm.makeSliderObj = function(){
          var text_before = "Before";
          var text_after = "After";
          if (vm.data.slider_text){
              text_before = JSON.parse(vm.data.slider_text).before;
              text_after = JSON.parse(vm.data.slider_text).after;
          }
          vm.slider_obj.beforeImageUrl = vm.getNextTask();
          vm.slider_obj.beforeImageLabel = text_before;
          vm.slider_obj.beforeImageAlt = text_before + ' Image';

          vm.slider_obj.afterImageUrl = vm.getBeforeImage();
          vm.slider_obj.afterImageLabel = text_after;
          vm.slider_obj.afterImageAlt = text_after + ' Image';
      };


      //get before image, either
      vm.getBeforeImage = getBeforeImage;
      function getBeforeImage() {
          if (!vm.dataset || vm.tasks.length == 0) {
              return null;
          } else {
              vm.image = vm.tasks[0].name;
              return '/api/tasks/getImage/' + vm.dataset + '/before_' + vm.tasks[0].name;
          }
      };


      //Todo: try to inject marker
      function injectMarkerInFrame(){


      }

      function showModal() {
          $scope.uiMask.show = true;
      };

      function hideModal() {
          $scope.uiMask.show = false;
      };

      function showBiggerImg(){
          $scope.triggerClick('#showImModalButton');
      }

      function hideBiggerImg(){
          $scope.triggerClick('#hideImModalButton');
      }

      if (!$location.search().code) {
          alert('You seem to have a wrong link');
          window.location.replace('/');
          return;
      }

      vm.userType=$location.search().type;
      vm.tasks = [];
      vm.dataset = null;

      function getTasks() {
          showModal();

          var endpoint = '/api/tasks/gettask/';
          //if we want to keep going after hitting the end
          if (vm.image_loop) {
              endpoint = '/api/tasks/gettaskloop/';
          }

          $http.get(endpoint + vm.code).then(function(e) {
              vm.dataset = e.data.dataset;
              vm.tasks = e.data.items;


              if (e.data.finished && !vm.image_loop) {
                  vm.finished = true;

                  if (vm.userType == "kiosk") {
                      vm.handleEnd();
                  } else {
                      vm.handleFinish();
                  }

              }



              latCenter = vm.tasks[0].x;
              lngCenter = vm.tasks[0].y;
              if (vm.viewMarkerPoints){
                  vm.addMarker(vm.tasks[0].x,vm.tasks[0].y)
              }

              vm.hideModal();
              if (vm.showFlightPath && $scope.geoMarkers.length !=0 ) {
                  vm.setCurrentPos()
              }

          }, function(err) {
              vm.hideModal();
          });
      };


      function handleEnd($window){

          if (!userData) {
              //window.location.replace('/consentForm.html#!/kiosk');

              //if project has no survey, go to results
              if (!parseInt(vm.data.has_survey))  {
                  window.location.replace('/kioskProject.html#/results/' + vm.code);
              }
              else {
                  //if project codes for algal, go to algal survey else go to IMI (default survey)
                  if (vm.code == heatMapProject2 || vm.code == heatMapProject1) {
                      window.location.replace('/survey.html#/survey?code=' + vm.code+ '&userType=kiosk');
                  } else {

                      var hitID = $location.search().hitID || $location.search().trialID || "kiosk";

                      window.location.replace('/survey.html#/' + vm.survey_type + '?code=' + vm.code+ '&userType=kiosk&hitId=' + hitID);

                  }
              }


          } else {
              window.location.replace('/UserProfile.html');
          }
      };

      function handleFinish() {
          window.alert('Dataset complete!');
          if (!userData) {

              var flight_last = 0;
              if (vm.showFlightPath) {flight_last = 1}

              //if chaining, go to next task if needed
              if (vm.chaining !=-1) {

                  var workerID = $location.search().workerID || $location.search().participantID;

                  //get the next projects in the chain
                  $http.get('/api/project/getNextProjectChain/' + encodeURIComponent(workerID)).then(function(data) {

                      var next_codes = data.data;


                      //if out of projects, go to survey
                      if (next_codes.length == 0) {

                          window.location.replace('/survey.html#/'+ vm.survey_type + '?code=' + vm.code + '&userType=mTurk' + '&showChainQuestions=' + vm.showChainQuestions + '&showFlight=' + flight_last);

                      } else {

                          //pick the next at random
                          var random_pick = next_codes[Math.floor(Math.random() * next_codes.length)];
                          var next_code = random_pick.unique_code;
                          var parms = $location.search();
                          var qs = '';
                          for (i in parms) {

                              if (i =='code'){
                                  qs += '&' + i + '=' + next_code;
                                  continue;
                              }
                              else if (i== "chain") {
                                  if (next_codes.length == 1) {
                                      qs += '&' + i + '=0';
                                      continue;
                                  } else {
                                      qs += '&' + i + '=1';
                                      continue;
                                  }
                              } else {
                                  qs += '&' + i + '=' + parms[i];
                                  continue;
                              }
                          }
                          qs+= '&fromChain=1';
                          //go to next task
                          window.location.replace('/consentForm.html#/instruction?'+ qs.substr(1))
                      }

                  }, function(err) {
                      alert('Error trying to find next project in the chain.');
                  });


              } else {
                  //Add the chaining parameter to show relevant questions at the survey
                  window.location.replace('/survey.html#/'+ vm.survey_type + '?code=' + vm.code + '&userType=mTurk' + '&showChainQuestions=' + vm.showChainQuestions + '&showFlight=' + flight_last);
              }
          } else {
              window.location.replace('/UserProfile.html');
          }
      };

      function skipToSurvey() {

          //console.log('Scope code', $scope.code);
          var skip = confirm('Are you sure ?');
          if (skip == true) {
              if (!userData) {

                  var flight_last = 0;
                  if (vm.showFlightPath) {
                      flight_last = 1
                  }

                  //if no survey present, go to results
                  if (!parseInt(vm.data.has_survey))  {
                      window.location.replace('/kioskProject.html#/results/' + vm.code);
                  } else {
                      //if we have to chain, call DB to get the next project code
                      if (vm.chaining !=-1) {

                          var workerID = $location.search().workerID || $location.search().participantID ;

                          //get the next projects in the chain
                          $http.get('/api/project/getNextProjectChain/' + encodeURIComponent(workerID)).then(function(data) {

                              var next_codes = data.data;


                              //if out of projects, go to survey
                              if (next_codes.length == 0) {

                                  window.location.replace('/survey.html#/'+ vm.survey_type + '?code=' + vm.code + '&userType=mTurk' + '&showChainQuestions=' + vm.showChainQuestions + '&showFlight=' + flight_last);

                              } else {

                                  //pick the next at random
                                  var random_pick = next_codes[Math.floor(Math.random() * next_codes.length)];
                                  var next_code = random_pick.unique_code;

                                  var parms = $location.search();
                                  var qs = '';
                                  for (i in parms) {

                                      if (i =='code'){
                                          qs += '&' + i + '=' + next_code;
                                          continue;
                                      }
                                      else if (i== "chain") {
                                          if (next_codes.length == 1) {
                                              qs += '&' + i + '=0';
                                              continue;
                                          } else {
                                              qs += '&' + i + '=1';
                                              continue;
                                          }
                                      } else {
                                          qs += '&' + i + '=' + parms[i];
                                          continue;
                                      }
                                  }
                                  qs+= '&fromChain=1';
                                  //go to next task
                                  window.location.replace('/consentForm.html#/instruction?'+ qs.substr(1))

                              }

                          }, function(err) {
                              alert('Error trying to find next project in the chain.');
                          });


                      }
                      else {
                          //Add the chaining parameter to show relevant questions at the survey
                          window.location.replace('/survey.html#/'+ vm.survey_type + '?code=' + vm.code + '&userType=mTurk' + '&showChainQuestions=' + vm.showChainQuestions + '&showFlight=' + flight_last)

                      }
                  }

                  } else {
                  window.location.replace('/UserProfile.html');
              }
          }
      };


      function getNextTask() {
          if (!vm.dataset || vm.tasks.length == 0) {
              return null;
          } else {
              vm.getLat();
              vm.getLng();
              vm.defZoom = dZoom;
              vm.image = vm.tasks[0].name;
              return '/api/tasks/getImage/' + vm.dataset + '/' + vm.tasks[0].name;
          }
      };

      function getLat() {
          if (!vm.dataset || vm.tasks.length == 0) {
              return null;
          } else {
              //console.log('task:: ', vm.tasks);
              vm.centerLat = vm.tasks[0].x;
              return vm.centerLat;
          }
      };

      function getLng() {
          if (!vm.dataset || vm.tasks.length == 0) {
              return null;
          } else {
              //console.log('task:: ', vm.tasks);
              vm.centerLng = vm.tasks[0].y;
              return vm.centerLng;
          }
      };


      //Show Tutorial Hover functionality
      $scope.showTutorial = function (option) {

          $http.get('/api/project/getTutorial/' + vm.code).then(function(tdata) {


              // tutorial data
              var tutData = tdata.data;


              vm.tutorial = [];
              //TODO: Mapping
              vm.tutorialMapping = [];



              vm.data.template.options.forEach(function(item) {
                  if (item.text == option) {
                      vm.tutorial_button = item;
                  }
              });

              tutData.forEach(function(item) {


                  var tmpl = JSON.parse(item.template);
                  var opt = [];
                  var sel_col = '';
                  var sel_num = -1;

                  //get only the images of the button that is hovering
                  if (item.answer == option) {


                      var tutpath = '../../images/Tutorials/';

                      if (item.hasOwnProperty('in_dataset') &&  item.in_dataset == 1){
                          //tutpath = '../../../dataset/' + data.data[0].dataset_id + '/';
                          tutpath = '/api/tasks/getImageFree/' + tdata.data[0].dataset_id + '/'
                      }
                      var it_annot = tutpath + item.image_name;
                      if (item.image_annotation){
                          it_annot = '../../images/Tutorials/' + vm.code + '/' +  item.image_annotation;
                      }

                      var obj = {
                          image: it_annot,
                          answer: item.answer,
                          text: item.explanation,
                          color: sel_col,
                          lat: parseFloat(item.x),
                          lng: parseFloat(item.y),
                          zoom: item.zoom || 18,
                          heading: 0,
                          tilt: 0,
                          col_number: parseInt(sel_num),
                          poi_name: item.poi_name || '',
                          explanation: item.explanation
                      };

                      if( (vm.data.template.selectedTaskType == 'tagging') ||
                          (vm.data.template.selectedTaskType == 'slider') ||
                          (vm.data.template.selectedTaskType == 'ngs') || (
                              (vm.data.template.selectedTaskType == 'mapping') && (vm.data.point_selection == false)
                          )) {
                          if (parseInt(item.ask_user)){
                              vm.tutorial.push(obj)
                          }
                      } else {
                          vm.tutorialMapping.push(obj)
                      }
                  }
              });

              //activate modal
              $scope.triggerClick('#showTutModalButton');

          });
      };


      $scope.triggerClick = function (id) {
          $timeout(function() {
              angular.element(id).trigger('click');

          }, 100);
      };


      //change marker of current position to airplane, for flight_path projects
      function setCurrentPos() {

          var next_image = vm.tasks[0].name;
          var indx = $scope.geoMarkers.map(function(x) {return x.title; }).indexOf(next_image);
          var next_marker = $scope.geoMarkers[indx];
          next_marker.icon = '/images/dots/current_position.svg';
          next_marker.setZIndex(google.maps.Marker.MAX_ZINDEX + 1);
          next_marker.setMap(vm.flight_map);
      }

      //submit a dummy vote to indicate start of voting
      function submitStartTime(){
          var dummyTask = {name:"dummy"};
          var body = {
              projectID: vm.data.id,
              option: -1,
              taskID: dummyTask,
              mapCenterLat:  0.1,
              mapCenterLon:  0.1,
              multiple: 1
          };
          $http.post('/api/tasks/submit', body)
      }

      function submit(option,option_text) {

          // A player is attempting to submit when there is no task visible, just ignore
          if ($scope.isMainTaskImgHidden) return;
          vm.showModal();
          //if markers task, loop through all markers and submit the selected ones, ignore submit button option
          if (vm.showMarkerPoints) {


              var promiseArray = [];

              $scope.pointMarkers.forEach(function (item) {


                  //if marker has changed color, submit the answer with the color selected and the location of the marker
                  if (item.icon != $scope.point_array_filtered[$scope.point_array_filtered.length -1]) {

                      var item_lat = item.getPosition().lat();
                      var item_lng = item.getPosition().lng();
                      var submit_indx = $scope.point_array_filtered.indexOf(item.icon);
                      //prepare the item
                      var body = {
                          projectID: vm.data.id,
                          option: submit_indx +1,
                          taskID: vm.tasks[0],
                          mapCenterLat:  item_lat,
                          mapCenterLon:  item_lng,
                          multiple: vm.showMarkerPoints,
                          option_text: option_text
                      };

                      //regray the marker!
                      item.icon = $scope.point_array_filtered[$scope.point_array_filtered.length -1];
                      item.setIcon($scope.point_array_filtered[$scope.point_array_filtered.length -1]);
                      item.setMap(vm.map);

                      promiseArray.push($http.post('/api/tasks/submit', body));
                  }

              });

              //after all votes in, add dummy vote to increase the progress
              var body = {
                  projectID: vm.data.id,
                  option: -1,
                  taskID: vm.tasks[0],
                  mapCenterLat:  latCenter,
                  mapCenterLon:  lngCenter,
                  multiple: 0
              };
              promiseArray.push($http.post('/api/tasks/submit', body));

              //wait until all posts are completed then continue to next image
              $q.all(promiseArray).then(function(dataArray) {
                  latCenter = vm.tasks[0].x;
                  lngCenter = vm.tasks[0].y;
                  vm.defZoom = dZoom;
                  vm.tasks.shift();
                  vm.hideModal();
                  vm.data.progress = parseInt(vm.data.progress) + 1;
                  //update progress bar:



                  $scope.next_per = (vm.data.progress / vm.data.size).toFixed(2) *100;
                  $scope.mturkbarStyle = {"width" : $scope.next_per.toString() + "%"};

                  if (vm.data.progress ==1) {
                      $scope.next_per2 = 0;
                  } else {
                      $scope.next_per2 = Math.floor($scope.next_per);
                  }


                  if (vm.tasks.length == 0) {
                      vm.getTasks()
                  }
                  //if flight path, change color of marker for the image that was just voted
                  if (vm.showFlightPath) {
                      $scope.geoMarkers.some(function (item) {
                          found = false;
                          if (item.title === vm.image) {
                              var col = vm.data.template.options[option].color;
                              item.icon = $scope.icon_array[parseInt(col)-1];
                              // item.setZIndex(google.maps.Marker.MAX_ZINDEX + 1);
                              item.setMap(vm.flight_map);
                              vm.setCurrentPos();
                              found = true
                          }
                          return found;
                      })
                  }

              });


          } else {
              //all other types of tasks that submit only one response per image


              var body = {
                  projectID: vm.data.id,
                  option: option,
                  taskID: vm.tasks[0],
                  mapCenterLat:   $scope.votedLat,
                  mapCenterLon:   $scope.votedLng,
                  option_text: option_text

              };

              vm.previousTaskName = vm.tasks[0]["name"];

              $http.post('/api/tasks/submit', body).then(function() {

                  vm.defZoom = dZoom;
                  vm.tasks.shift();


                  //if out of tasks, fetch next group, else reset latCenter
                  if (vm.tasks.length == 0) {
                      vm.getTasks();
                  } else {
                      latCenter = vm.tasks[0].x;
                      lngCenter = vm.tasks[0].y;
                      if (vm.viewMarkerPoints){
                          vm.addMarker(vm.tasks[0].x,vm.tasks[0].y)
                      }
                  }

                  //reset vote location
                  $scope.votedLat = latCenter;
                  $scope.votedLng = lngCenter;


                  vm.hideModal();



                  //percentage complete
                  $scope.next_per2 = Math.floor($scope.next_per);


                  vm.data.progress = parseInt(vm.data.progress) + 1;
                  //update progress bar:
                  $scope.next_per = (vm.data.progress / vm.data.size).toFixed(2) *100;
                  $scope.mturkbarStyle = {"width" : $scope.next_per.toString() + "%"};

                  //if we are past the required amount for the project, show exit button
                  if (vm.data.progress > vm.req_amount ) {
                      $scope.showSurvButton = true;
                  }

                  if ((vm.data.progress == vm.data.size + 1) && vm.image_loop) {
                      console.log("Reached end")
                      vm.alertLoop();
                  }

                  //if flight path, change color of marker for the image that was just voted
                  if (vm.showFlightPath) {
                      $scope.geoMarkers.some(function (item) {
                          found = false;
                          if (item.title === vm.image) {
                              var col = vm.data.template.options[option].color;
                              item.icon = $scope.icon_array[parseInt(col)-1];
                              // item.setZIndex(google.maps.Marker.MAX_ZINDEX + 1);
                              item.setIcon($scope.icon_array[parseInt(col)-1])
                              item.setMap(vm.flight_map);
                              vm.setCurrentPos();
                              found = true
                          }
                          return found;
                      })
                  }

                  if (vm.show_cairns > 0  && vm.data.progress %  vm.show_cairns === 0) {
                      $("#cairnModal").modal('show')
                  }
                  vm.handleSoapstones();
              });
          }


      };

      vm.map_init = function(){
          //Map initialization for map tasks:
          NgMap.getMap({id:'main_map'}).then(function(map) {
              vm.map = map;
              var myLatlng = new google.maps.LatLng(getLat(),getLng());
              vm.map.setCenter(myLatlng);
              latCenter = vm.map.getCenter().lat();
              lngCenter = vm.map.getCenter().lng();
              vm.lat= latCenter;
              vm.lang = lngCenter;
              vm.defZoom = 15;
              //console.log(latCenter, lngCenter);
              vm.recenter();
          });
      };

      function fetchCenter(){
          //console.log('In get Center ');
          var lng = vm.getLng();
          var lat = vm.getLat();
          return [lat,lng];
      }
      function resetZoom(){
          //console.log('In get Zoom ');
          vm.map.setZoom(dZoom);
      }

      function centerChanged() {
          NgMap.getMap({id:'main_map'}).then(function(point_map) {
              vm.centerLat = point_map.getCenter().lat();
              vm.centerLng = point_map.getCenter().lng();
              // latCenter = point_map.getCenter().lat();
              // lngCenter = point_map.getCenter().lng();
              $scope.votedLat = point_map.getCenter().lat();
              $scope.votedLng = point_map.getCenter().lng();
          });
      }

      function zoomChanged() {
          //console.log('IN ZOom CHnaged'+ vm.map.getCenter().lat(), vm.map.getCenter().lng());
          NgMap.getMap({id:'main_map'}).then(function(point_map) {
              vm.centerLat = point_map.getCenter().lat();
              vm.centerLng = point_map.getCenter().lng();
              // latCenter = point_map.getCenter().lat();
              // lngCenter = point_map.getCenter().lng();
              $scope.votedLat = point_map.getCenter().lat();
              $scope.votedLng = point_map.getCenter().lng();
          })

      }

      vm.recenter = function() {
          var cntr = new google.maps.LatLng(latCenter,lngCenter);
          vm.map.panTo(cntr);
          vm.map.setZoom(dZoom);
      };


      function addMarker(m_lat,m_lon){
          NgMap.getMap({id:'main_map'}).then(function(point_map) {

              if (typeof $scope.pointMarkers!== 'undefined' && $scope.pointMarkers.length > 0) {
                  // unset previous marker
                  var prev_marker = $scope.pointMarkers.pop()
                  prev_marker.setMap(null);
              }

              var point_pos = {lat: parseFloat(m_lat)  , lng: parseFloat(m_lon) };
              var point_marker = new google.maps.Marker({
                  position: point_pos,
                  map: point_map,
                  title: "marker",
                  id: vm.data.progress,
                  // zIndex: pointId,
                  icon: $scope.point_array[$scope.point_array.length -1] //all unclicked markers are gray
              });
              $scope.pointMarkers.push(point_marker);
              //add marker on the map:
              point_marker.setMap(point_map);

          });
      }


      //Get project info:
      $http.get('/api/tasks/getInfo/' + vm.code).then(function(data) {

          vm.data = data.data;
          vm.data.template = JSON.parse(vm.data.template);
          vm.req_amount = vm.data.req_count;
          vm.survey_t = vm.data.survey_type || 'IMI';
          vm.survey_type = 'survey' +  vm.survey_t;
          vm.show_cairns = vm.data.show_cairns || 0; //if it has cairns

          if(vm.show_cairns){
              vm.fetchCairns();
          }

          if (vm.data.template.selectedTaskType === "ngs"){
              if (vm.data.ngs_zoom){
                  dZoom = vm.data.ngs_zoom
              }
          }


          if (parseInt(vm.req_amount) == 0) {

              $scope.req_text = "You may complete any number of subtasks before clicking the \"Go to Survey\" button to finish."
          } else {
              $scope.req_text = "You must complete at least " + vm.req_amount + " subtasks in order to continue to the survey."
          }


          //get the tasks
          vm.getTasks();

          //load map with minor timeout to make sure getTasks is done
          $timeout( function(){
              vm.map_init();
          }, 1000 );

          //record dummy vote for start of task
          submitStartTime();

          //if NGS, add marker to NGS map
          if (vm.data.template.selectedTaskType == "ngs"){
              vm.injectMarkerInFrame()
          }


          //if slider, make the slider obj
          if (vm.data.template.selectedTaskType == "slider"){
              vm.makeSliderObj()
          }


          //Set progress bar:
          $scope.next_per = (vm.data.progress / vm.data.size).toFixed(2) *100;
          $scope.mturkbarStyle = {"width" : $scope.next_per.toString() + "%"};
          $scope.next_per2 = Math.floor($scope.next_per);

          // required amount to be able to continue to survey
          if (vm.data.progress > vm.req_amount ) {
              $scope.showSurvButton = true;
          }


          //check if flight path enabled for project:
          if (vm.data.flight_path) {
              vm.showFlightPath = true;
          }

          //check if flight path enabled for project:
          if (vm.data.point_selection) {
              vm.showMarkerPoints = true;
              vm.point_csv_file = vm.data.points_file;
              //show the modal with extra info for the first time
              if (vm.userType == "mTurk") {$("#helpModal").modal('show')}

          } else if (vm.data.points_file != null){
              //zoom in on location
              dZoom = 17;
              vm.point_csv_file = vm.data.points_file;
              vm.viewMarkerPoints = true;

          }

          //if flight path enabled, prepare progress map with markers:
          if (vm.showFlightPath) {


              vm.flight_centerChanged = flight_centerChanged;

              function flight_centerChanged() {
                  //console.log('IN center CHnaged' +vm.map.getCenter().lat(), vm.map.getCenter().lng() );
                  var latCenter = vm.flight_map.getCenter().lat();
                  var lngCenter = vm.flight_map.getCenter().lng();
              }


              //Get all images from the project and set as grey markers
              $http.get('/api/project/getProjectPoints/' + vm.code ).then(function(data) {

                  var projectPoints = data.data;

                  if (userData) {
                      var queryline = '/api/results/all/' + vm.code + '/' + userData.id;
                  } else {
                      var workerID = $location.search().workerID || $location.search().participantID;
                      var hitID = $location.search().hitID || $location.search().trialID;
                      var queryline = '/api/results/all/' + vm.code + '/'  +  encodeURIComponent(workerID);
                  }

                  //Get all the user's votes so far on the project and change icon based on answer
                  $http.get(queryline ).then(function(vote_data) {

                      var userVotes = vote_data.data;

                      //Map initialization
                      NgMap.getMap({id:'flight_path'}).then(function(flight_map) {

                          //all unvisited points are gray
                          var markerID = 0;
                          vm.flight_map = flight_map;
                          projectPoints.forEach(function (item) {
                              var pos = {lat: parseFloat(item.x) , lng: parseFloat(item.y)};
                              var marker = new google.maps.Marker({
                                  position: pos,
                                  map: flight_map,
                                  title: item.name,
                                  id: markerID,
                                  zIndex: markerID,
                                  icon: $scope.icon_array[$scope.icon_array.length -1]
                              });
                              $scope.geoMarkers.push(marker);
                              markerID += 1;
                          });

                          //change icon color based on vote
                          userVotes.forEach(function (item) {
                              var indx = $scope.geoMarkers.map(function(x) {return x.title; }).indexOf(item.task_id);
                              $scope.geoMarkers[indx].icon = $scope.icon_array[parseInt(item.color)-1]
                          });
                          //set current position:
                          vm.setCurrentPos();

                          //get center
                          var midindex = Math.floor($scope.geoMarkers.length/2)
                          vm.map_center_latlng = $scope.geoMarkers[midindex].position;
                          vm.map_center_lat = $scope.geoMarkers[midindex].getPosition().lat();
                          vm.map_center_lng = $scope.geoMarkers[midindex].getPosition().lng();
                          //set map
                          vm.flight_map = flight_map;
                          vm.flight_map.setCenter(vm.map_center_latlng);
                          vm.flight_map_lat = vm.map_center_lat //- 0.015;
                          vm.flight_map_lng = vm.map_center_lng //+ 0.02;
                          // vm.defZoomFlight = 10;
                          //Put markers on the map
                          var bounds = new google.maps.LatLngBounds();
                          $scope.geoMarkers.forEach(function (item) {
                              item.setMap(vm.flight_map);
                              bounds.extend(item.getPosition());
                          });
                          vm.flight_map.setCenter(bounds.getCenter());
                          vm.flight_map.fitBounds(bounds);
                          vm.flight_map.setZoom(vm.flight_map.getZoom()+2);

                      });

                  });
              });
          }

          //if markers task, read points from csv, make markers, add listener, add them to the map
          if (vm.showMarkerPoints || vm.viewMarkerPoints) {

              // reject all colors that are not in the project creation options
              //reject dummy vote QQQ (allows for project creation with only one answer for markers)
              $scope.point_array_filtered = [];
              vm.data.template.options.forEach(function (item) {
                  if(item.text != 'QQQ'){
                      $scope.point_array_filtered.push($scope.point_array[item.color-1]);
                  }
              });
              $scope.point_array_filtered.push($scope.point_array[$scope.point_array.length -1]);



              //get map from task:
              NgMap.getMap({id:'main_map'}).then(function(point_map) {
                  // read CSV file content


                  $scope.pointMarkers = [];
                  var pointId = 0;
                  if (vm.showMarkerPoints){
                      d3.csv('/images/files/'+vm.point_csv_file, function(csv_data) {

                          for (var i = 0; i < csv_data.length; i++) {
                              // split content based on comma
                              var csv_obj = csv_data[i];
                              //make marker from csv point in csv_obj
                              var point_pos = {lat: parseFloat(csv_obj.latitude) , lng: parseFloat(csv_obj.longitude)};
                              var point_marker = new google.maps.Marker({
                                  position: point_pos,
                                  map: point_map,
                                  title: csv_obj.name,
                                  id: pointId,
                                  // zIndex: pointId,
                                  icon: $scope.point_array[$scope.point_array.length -1] //all unclicked markers are gray
                              });
                              //If markers clickable, add click listener to change color on click
                              if (vm.showMarkerPoints){
                                  google.maps.event.addListener(point_marker, 'click', function() {

                                      var col = this.icon;
                                      //get index of color from array
                                      var marker_indx = $scope.point_array_filtered.indexOf(col);
                                      marker_indx = (marker_indx + 1) % $scope.point_array_filtered.length;
                                      this.icon = $scope.point_array_filtered[marker_indx];
                                      this.setIcon($scope.point_array_filtered[marker_indx])
                                      this.setMap(point_map)
                                  });
                              }
                              $scope.pointMarkers.push(point_marker);
                              pointId += 1;

                          }//end of csv loop

                          //add markers on the map:
                          $scope.pointMarkers.forEach(function (item) {
                              item.setMap(point_map);
                          });

                          //Make the legend:
                          if (vm.showMarkerPoints) {

                              vm.legendObject = [];
                              vm.data.template.options.forEach(function (item) {

                                  //Ignore dummy 'QQQ' option
                                  if(item.text != 'QQQ') {
                                      vm.legendObject.push({
                                          key: item.text,
                                          image: $scope.point_array[item.color - 1]
                                      })
                                  }

                              });
                              vm.legendObject.push({
                                  key: 'Unselected',
                                  image: $scope.point_array[$scope.point_array.length -1]
                              })
                          }





                      }); //end of csv http get
                  } else {
                        //if viewMarkers, just show one marker
                      vm.addMarker(vm.fetchCenter()[0],vm.fetchCenter()[1])

                  }

              }); //end of map fetch




          } //end of if showPoints


      }, function(err) {
          alert('You seem to have a wrong/invalid link');
      });

      function getColourClass(color) {
          return 'c' + color;
      };

  }]);


module.controller('geneticTaskController', ['$scope', '$location', '$http', 'userData', '$window', '$timeout', 'NgMap','$q', '$sce', 'heatMapProject1', 'heatMapProject2',
    function($scope, $location, $http, userData,  $window, $timeout, NgMap, $q,$sce, heatMapProject1, heatMapProject2) {
        $window.document.title = "Tasks";

        var vm = this;
        vm.centerChanged = centerChanged;
        vm.zoomChanged = zoomChanged;
        vm.fetchCenter = fetchCenter;
        vm.resetZoom = resetZoom;
        vm.showModal = showModal;
        vm.hideModal = hideModal;
        vm.getTasks = getTasksGenetic;
        vm.handleEnd = handleEnd;
        vm.handleFinish =handleFinish;
        vm.skipToSurvey = skipToSurvey;
        vm.getColourClass =getColourClass;
        vm.getLat = getLat;
        vm.getLng = getLng;
        vm.submit = submit;
        vm.getNextTask = getNextTask;
        vm.setCurrentPos = setCurrentPos;
        vm.showBiggerImg = showBiggerImg;
        vm.hideBiggerImg = hideBiggerImg;
        vm.addMarker = addMarker;
        vm.map_init = map_init;
        vm.getFullIframe = getFullIframe;
        vm.checkSatisfiedSequence = checkSatisfiedSequence;
        var SEQ_DEPTH = 6; //TODO: Change from hardcoded to variable

        vm.alertText = function(text){
            if (text){
                alert(text)
            } else {
                alert('No information available.');
            }
        }

        //hide progress bar:
        vm.viewProgress = true;

        vm.map={};
        vm.lat="";
        vm.lang="";
        vm.code = $location.search().code;
        vm.image = "";


        $scope.votedLat = "";
        $scope.votedLng = "";

        //for markers and flight path mode
        $scope.geoMarkers = [];
        $scope.icon_array =  ['/images/dots/cs_green_dot.svg',
            '/images/dots/cs_yellow_dot.svg',
            '/images/dots/cs_orange_dot.svg',
            '/images/dots/cs_red_dot.svg',
            '/images/dots/cs_blue_dot.svg',
            '/images/dots/cs_purple_dot.svg',
            '/images/dots/cs_grey_dot.svg'];

        //enable flight path for specific project
        vm.showFlightPath = false;

        //enable POI marker selection for specific project
        vm.showMarkerPoints = false;
        vm.viewMarkerPoints = false;

        $scope.point_array =  ['/images/markers/marker_green2.svg',
            '/images/markers/marker_yellow2.svg',
            '/images/markers/marker_orange2.svg',
            '/images/markers/marker_red2.svg',
            '/images/markers/marker_blue2.svg',
            '/images/markers/marker_purple2.svg',
            '/images/markers/marker_grey.svg'];


        //for chaining, look for the parameter:

        vm.chaining = $location.search().chain;
        //Disable chaining

        vm.chaining = -1;

        //progress bars

        $scope.next_per2 = 0;

        //enable required amount
        $scope.showSurvButton = false;

        vm.showChainQuestions = 0;
        //if -1, then we never asked for chaining, do not show the questions
        if (vm.chaining != -1) {
            vm.showChainQuestions = 1;
            if (vm.chaining == 0) {
                $scope.cont_button = "GO TO SURVEY"
            } else {
                $scope.cont_button = "GO TO NEXT TASK"
            }

        } else {
            $scope.cont_button = "GO TO SURVEY"
        }


        //for NGS tasks
        function getFullIframe(){

            var link = vm.data.image_source;
            var zoom = vm.defZoom;
            var x = vm.getLat();
            var y = vm.getLng();
            var url = link + '#' + zoom + '/'+  x + '/' + y;
            return  $sce.trustAsResourceUrl(url)
        };


        //for slider tasks:

        //get before image, either
        vm.getBeforeImage = getBeforeImage;
        function getBeforeImage() {
            if (!vm.dataset || vm.tasks.length == 0) {
                return null;
            } else {
                vm.image = vm.tasks[0].name;
                return '/api/tasks/getImage/' + vm.dataset + '/before_' + vm.tasks[0].name;
            }
        };


        function showModal() {
            $scope.uiMask.show = true;
        };

        function hideModal() {
            $scope.uiMask.show = false;
        };

        function showBiggerImg(){
            $scope.triggerClick('#showImModalButton');
        }

        function hideBiggerImg(){
            $scope.triggerClick('#hideImModalButton');
        }

        if (!$location.search().code) {
            alert('You seem to have a wrong link');
            window.location.replace('/');
            return;
        }

        vm.userType=$location.search().type;
        vm.tasks = [];
        vm.dataset = null;

        function getTasksGenetic() {
            showModal();
            //make sure to register if 0


            $http.get('/api/tasks/gettask/' + vm.genetic_task_current + '/' + vm.genetic_tasks_to_load).then(function(e) {
                vm.dataset = e.data.dataset;
                vm.tasks = e.data.items;


                if (e.data.finished) {
                    vm.finished = true;

                    if (vm.userType == "kiosk") {
                        vm.handleEnd();
                    } else {
                        vm.handleFinish();
                    }

                }
                latCenter = parseFloat(vm.tasks[0].x);
                lngCenter = parseFloat(vm.tasks[0].y);
                if (vm.viewMarkerPoints){
                    vm.addMarker(vm.tasks[0].x,vm.tasks[0].y)
                }

                vm.hideModal();
                if (vm.showFlightPath && $scope.geoMarkers.length !=0 ) {
                    vm.setCurrentPos()
                }

                //init map if mapping type task
                if (vm.data.template.selectedTaskType == "mapping"){
                    vm.map_init()
                }


            }, function(err) {
                vm.hideModal();
            });
        };


        function handleEnd($window){
            if (!userData) {
                //window.location.replace('/consentForm.html#!/kiosk');

                //if project codes for algal, go to algal survey else go to TLX (default survey)
                //Custom survey page
                if (vm.code == heatMapProject2 || vm.code == heatMapProject1) {
                    window.location.replace('/survey.html#/survey?code=' + vm.code+ '&userType=kiosk');
                } else {
                    window.location.replace('/survey.html#/'+ vm.survey_type + '?code=' + vm.code+ '&userType=kiosk');
                }


            } else {
                window.location.replace('/UserProfile.html');
            }
        };

        function handleFinish() {
            window.alert('Dataset complete!');
            if (!userData) {

                var flight_last = 0;
                if (vm.showFlightPath) {flight_last = 1}

                //if chaining, go to next task if needed
                if (vm.chaining !=-1) {

                    var workerID = $location.search().workerID || $location.search().participantID;

                    //get the next projects in the chain
                    $http.get('/api/project/getNextProjectChain/' + encodeURIComponent(workerID)).then(function(data) {

                        var next_codes = data.data;


                        //if out of projects, go to survey
                        if (next_codes.length == 0) {
                            window.location.replace('/survey.html#/' + vm.survey_type + '?code=' + vm.code + '&userType=mTurk' + '&showChainQuestions=' + vm.showChainQuestions + '&showFlight=' + flight_last);

                        } else {

                            //pick the next at random
                            var random_pick = next_codes[Math.floor(Math.random() * next_codes.length)];
                            var next_code = random_pick.unique_code;
                            var parms = $location.search();
                            var qs = '';
                            for (i in parms) {

                                if (i =='code'){
                                    qs += '&' + i + '=' + next_code;
                                    continue;
                                }
                                else if (i== "chain") {
                                    if (next_codes.length == 1) {
                                        qs += '&' + i + '=0';
                                        continue;
                                    } else {
                                        qs += '&' + i + '=1';
                                        continue;
                                    }
                                } else {
                                    qs += '&' + i + '=' + parms[i];
                                    continue;
                                }
                            }
                            qs+= '&fromChain=1';
                            //go to next task
                            window.location.replace('/consentForm.html#/instruction?'+ qs.substr(1))
                        }

                    }, function(err) {
                        alert('Error trying to find next project in the chain.');
                    });


                } else {


                    //in genetic cases, check if user satisfied constraint
                    vm.checkSatisfiedSequence();
                    //Add the chaining parameter to show relevant questions at the survey
                    window.location.replace('/survey.html#/'+ vm.survey_type + '?code=' + vm.code + '&userType=mTurk' + '&showChainQuestions=' + vm.showChainQuestions + '&showFlight=' + flight_last);

                }
            } else {
                window.location.replace('/UserProfile.html');
            }
        };

        function skipToSurvey() {
            //console.log('Scope code', $scope.code);
            var skip = confirm('Are you sure ?');
            if (skip == true) {
                if (!userData) {

                    var flight_last = 0;
                    if (vm.showFlightPath) {
                        flight_last = 1
                    }


                    //in genetic cases, check if user satisfied constraint
                    vm.checkSatisfiedSequence();

                    //if we have to chain, call DB to get the next project code
                    if (vm.chaining !=-1) {

                        var workerID = $location.search().workerID || $location.search().participantID;

                        //get the next projects in the chain
                        $http.get('/api/project/getNextProjectChain/' + encodeURIComponent(workerID)).then(function(data) {

                            var next_codes = data.data;


                            //if out of projects, go to survey
                            if (next_codes.length == 0) {
                                window.location.replace('/survey.html#/'+ vm.survey_type + '?code=' + vm.code + '&userType=mTurk' + '&showChainQuestions=' + vm.showChainQuestions + '&showFlight=' + flight_last);
                            } else {

                                //pick the next at random
                                var random_pick = next_codes[Math.floor(Math.random() * next_codes.length)];
                                var next_code = random_pick.unique_code;

                                var parms = $location.search();
                                var qs = '';
                                for (i in parms) {

                                    if (i =='code'){
                                        qs += '&' + i + '=' + next_code;
                                        continue;
                                    }
                                    else if (i== "chain") {
                                        if (next_codes.length == 1) {
                                            qs += '&' + i + '=0';
                                            continue;
                                        } else {
                                            qs += '&' + i + '=1';
                                            continue;
                                        }
                                    } else {
                                        qs += '&' + i + '=' + parms[i];
                                        continue;
                                    }
                                }
                                qs+= '&fromChain=1';
                                //go to next task
                                window.location.replace('/consentForm.html#/instruction?'+ qs.substr(1))

                            }

                        }, function(err) {
                            alert('Error trying to find next project in the chain.');
                        });


                    } else {
                        //Add the chaining parameter to show relevant questions at the survey
                        window.location.replace('/survey.html#/'+ vm.survey_type + '?code=' + vm.code + '&userType=mTurk' + '&showChainQuestions=' + vm.showChainQuestions + '&showFlight=' + flight_last);
                    }

                } else {
                    window.location.replace('/UserProfile.html');
                }
            }
        };


        function getNextTask() {
            if (!vm.dataset || vm.tasks.length == 0) {
                return null;
            } else {
                vm.getLat();
                vm.getLng();
                vm.defZoom = dZoom;
                vm.image = vm.tasks[0].name;
                return '/api/tasks/getImage/' + vm.dataset + '/' + vm.tasks[0].name;
            }
        };

        function getLat() {
            if (!vm.dataset || vm.tasks.length == 0) {
                return null;
            } else {
                //console.log('task:: ', vm.tasks);
                vm.centerLat = vm.tasks[0].x;
                return vm.centerLat;
            }
        };

        function getLng() {
            if (!vm.dataset || vm.tasks.length == 0) {
                return null;
            } else {
                //console.log('task:: ', vm.tasks);
                vm.centerLng = vm.tasks[0].y;
                return vm.centerLng;
            }
        };



        //Show Tutorial Hover functionality
        $scope.showTutorial = function (option) {

            $http.get('/api/project/getTutorial/' + vm.code).then(function(tdata) {


                // tutorial data
                var tutData = tdata.data;

                vm.tutorial = [];
                //Mapping
                vm.tutorialMapping = [];

                vm.data.template.options.forEach(function(item) {
                    if (item.text == option) {
                        vm.tutorial_button = item;
                    }
                });

                tutData.forEach(function(item) {

                    var tmpl = JSON.parse(item.template);
                    var opt = [];
                    var sel_col = '';
                    var sel_num = -1;

                    //get only the images of the button that is hovering
                    if (item.answer == option) {

                        //if tutorial image in dataset, fetch from dataset
                        var tutpath = '../../images/Tutorials/';

                        if (item.hasOwnProperty('in_dataset') &&  item.in_dataset == 1){
                            //tutpath = '../../../dataset/' + data.data[0].dataset_id + '/';
                            tutpath = '/api/tasks/getImageFree/' + tdata.data[0].dataset_id + '/'
                        }
                        var it_annot = tutpath + item.image_name;
                        if (item.image_annotation){
                            it_annot = '../../images/Tutorials/' + vm.code + '/' +  item.image_annotation;
                        }

                        // console.log(it_annot);

                        var obj = {
                            image: it_annot,
                            answer: item.answer,
                            text: item.explanation,
                            color: sel_col,
                            lat: parseFloat(item.x),
                            lng: parseFloat(item.y),
                            zoom: item.zoom || 18,
                            heading: 0,
                            tilt: 0,
                            col_number: parseInt(sel_num),
                            poi_name: item.poi_name || ''
                        };

                        if( (vm.data.template.selectedTaskType == 'tagging') || (vm.data.template.selectedTaskType == 'slider') || (vm.data.template.selectedTaskType == 'ngs') ||   (
                                (vm.data.template.selectedTaskType == 'mapping') && (vm.data.point_selection == false)
                            )) {
                            vm.tutorial.push(obj)
                        } else {
                            vm.tutorialMapping.push(obj)
                        }
                    }
                });

                //activate modal
                $scope.triggerClick('#showTutModalButton');

            });
        };


        $scope.triggerClick = function (id) {
            $timeout(function() {
                angular.element(id).trigger('click');

            }, 100);
        };


        //change marker of current position to airplane, for flight_path projects
        function setCurrentPos() {

            var next_image = vm.tasks[0].name;
            var indx = $scope.geoMarkers.map(function(x) {return x.title; }).indexOf(next_image);
            var next_marker = $scope.geoMarkers[indx];
            next_marker.icon = '/images/dots/current_position.svg';
            next_marker.setZIndex(google.maps.Marker.MAX_ZINDEX + 1);
            next_marker.setMap(vm.flight_map);
        }

        //submit a dummy vote to indicate start of voting
        function submitStartTime(){
            var dummyTask = {name:"dummy"}
            var body = {
                projectID: vm.data.id,
                option: -1,
                taskID: dummyTask,
                mapCenterLat:  0.1,
                mapCenterLon:  0.1,
                multiple: 1
            };
            $http.post('/api/tasks/submit', body)
        }

        function submit(option,option_text) {


            //update overall progress so far
            vm.overall_progress_view += 1;

            vm.showModal();

            //if markers task, loop through all markers and submit the selected ones, ignore submit button option
            if (vm.showMarkerPoints) {

                var promiseArray = [];
                $scope.pointMarkers.forEach(function (item) {

                    //if marker has changed color, submit the answer with the color selected and the location of the marker
                    if (item.icon != $scope.point_array_filtered[$scope.point_array_filtered.length -1]) {

                        var item_lat = item.getPosition().lat();
                        var item_lng = item.getPosition().lng();
                        var submit_indx = $scope.point_array_filtered.indexOf(item.icon);
                        //prepare the item
                        var body = {
                            projectID: vm.data.id,
                            option: submit_indx +1,
                            taskID: vm.tasks[0],
                            mapCenterLat:  item_lat,
                            mapCenterLon:  item_lng,
                            multiple: vm.showMarkerPoints,
                            option_text: option_text
                        };

                        //regray the marker!
                        item.icon = $scope.point_array_filtered[$scope.point_array_filtered.length -1];
                        item.setIcon($scope.point_array_filtered[$scope.point_array_filtered.length -1])
                        item.setMap(vm.map);

                        promiseArray.push($http.post('/api/tasks/submit', body));
                    }

                });

                //after all votes in, add dummy vote to increase the progress
                var body = {
                    projectID: vm.data.id,
                    option: -1,
                    taskID: vm.tasks[0],
                    mapCenterLat:  latCenter,
                    mapCenterLon:  lngCenter,
                    multiple: 0
                };
                promiseArray.push($http.post('/api/tasks/submit', body));

                //wait until all posts are completed then continue to next image
                $q.all(promiseArray).then(function(dataArray) {

                    vm.defZoom = dZoom;
                    vm.tasks.shift();
                    vm.current_block_progress++;

                    //if out of tasks, fetch next group, else reset latCenter
                    if (vm.tasks.length == 0) {
                        //vm.getTasks();
                        vm.getGeneticInfo(function(){
                            //reset vote location
                            $scope.votedLat = latCenter;
                            $scope.votedLng = lngCenter;

                            vm.hideModal();

                            //percentage complete
                            vm.data.progress = parseInt(vm.data.progress) + 1;

                            if (vm.progress_type == "block"){
                                $scope.next_per = (vm.current_block_progress / vm.current_block_size).toFixed(2) *100;
                                if (vm.current_block_progress == 0){
                                    $scope.next_per = 0;
                                }
                                $scope.mturkbarStyle = {"width" : $scope.next_per.toString() + "%"};


                            } else {
                                //update progress bar:
                                $scope.next_per = (vm.data.progress / vm.data.size).toFixed(2) *100;
                                if (vm.data.progress == 1){
                                    $scope.next_per = 0;
                                }
                                $scope.mturkbarStyle = {"width" : $scope.next_per.toString() + "%"};
                            }
                            $scope.next_per2 = Math.floor($scope.next_per);


                            //if we are past the required amount for the project, show exit button
                            if (vm.data.progress > vm.req_amount ) {
                                $scope.showSurvButton = true;
                            }


                            //if flight path, change color of marker for the image that was just voted
                            if (vm.showFlightPath) {
                                $scope.geoMarkers.some(function (item) {
                                    found = false;
                                    if (item.title === vm.image) {
                                        var col = vm.data.template.options[option].color;
                                        item.icon = $scope.icon_array[parseInt(col)-1];
                                        item.setIcon($scope.icon_array[parseInt(col)-1]);
                                        // item.setZIndex(google.maps.Marker.MAX_ZINDEX + 1);
                                        item.setMap(vm.flight_map);
                                        vm.setCurrentPos();
                                        found = true
                                    }
                                    return found;
                                })
                            }
                        });
                    } else {
                        latCenter = vm.tasks[0].x;
                        lngCenter = vm.tasks[0].y;
                        if (vm.viewMarkerPoints){
                            vm.addMarker(vm.tasks[0].x,vm.tasks[0].y)
                        }
                    }

                    //reset vote location
                    $scope.votedLat = latCenter;
                    $scope.votedLng = lngCenter;


                    vm.hideModal();

                    //percentage complete
                    $scope.next_per2 = Math.floor($scope.next_per);


                    vm.data.progress = parseInt(vm.data.progress) + 1;
                    //update progress bar:


                    if (vm.progress_type == "block"){
                        $scope.next_per = (vm.current_block_progress / vm.current_block_size).toFixed(2) *100;
                        if (vm.current_block_progress == 0){
                            $scope.next_per = 0;
                        }
                        $scope.mturkbarStyle = {"width" : $scope.next_per.toString() + "%"};

                    } else {
                        //update progress bar:
                        $scope.next_per = (vm.data.progress / vm.data.size).toFixed(2) *100;
                        if (vm.data.progress == 1){
                            $scope.next_per = 0;
                        }
                        $scope.mturkbarStyle = {"width" : $scope.next_per.toString() + "%"};
                    }
                    $scope.next_per2 = Math.floor($scope.next_per);

                    //if we are past the required amount for the project, show exit button
                    if (vm.data.progress > vm.req_amount ) {
                        $scope.showSurvButton = true;
                    }


                    //if flight path, change color of marker for the image that was just voted
                    if (vm.showFlightPath) {
                        $scope.geoMarkers.some(function (item) {
                            found = false;
                            if (item.title === vm.image) {
                                var col = vm.data.template.options[option].color;
                                item.icon = $scope.icon_array[parseInt(col)-1];
                                item.setIcon($scope.icon_array[parseInt(col)-1])
                                // item.setZIndex(google.maps.Marker.MAX_ZINDEX + 1);
                                item.setMap(vm.flight_map);
                                vm.setCurrentPos();
                                found = true
                            }
                            return found;
                        })
                    }
                });


            } else {
                //all other types of tasks that submit only one response per image

                var body = {
                    projectID: vm.data.id,
                    option: option,
                    taskID: vm.tasks[0],
                    mapCenterLat:   $scope.votedLat,
                    mapCenterLon:   $scope.votedLng,
                    option_text: option_text
                };

                $http.post('/api/tasks/submit', body).then(function() {

                    vm.defZoom = dZoom;
                    vm.tasks.shift();
                    vm.current_block_progress++;

                    //if out of tasks, fetch next group, else reset latCenter
                    if (vm.tasks.length == 0) {
                        //vm.getTasks();
                        vm.getGeneticInfo(function(){
                            //reset vote location
                            $scope.votedLat = latCenter;
                            $scope.votedLng = lngCenter;

                            vm.hideModal();

                            //percentage complete
                            vm.data.progress = parseInt(vm.data.progress) + 1;

                            if (vm.progress_type == "block"){
                                $scope.next_per = (vm.current_block_progress / vm.current_block_size).toFixed(2) *100;
                                if (vm.current_block_progress == 0){
                                    $scope.next_per = 0;
                                }
                                $scope.mturkbarStyle = {"width" : $scope.next_per.toString() + "%"};


                            } else {
                                //update progress bar:
                                $scope.next_per = (vm.data.progress / vm.data.size).toFixed(2) *100;
                                if (vm.data.progress == 1){
                                    $scope.next_per = 0;
                                }
                                $scope.mturkbarStyle = {"width" : $scope.next_per.toString() + "%"};
                            }
                            $scope.next_per2 = Math.floor($scope.next_per);


                            //if we are past the required amount for the project, show exit button
                            if (vm.data.progress > vm.req_amount ) {
                                $scope.showSurvButton = true;
                            }


                            //if flight path, change color of marker for the image that was just voted
                            if (vm.showFlightPath) {
                                $scope.geoMarkers.some(function (item) {
                                    found = false;
                                    if (item.title === vm.image) {
                                        var col = vm.data.template.options[option].color;
                                        item.icon = $scope.icon_array[parseInt(col)-1];
                                        item.setIcon($scope.icon_array[parseInt(col)-1]);
                                        // item.setZIndex(google.maps.Marker.MAX_ZINDEX + 1);
                                        item.setMap(vm.flight_map);
                                        vm.setCurrentPos();
                                        found = true
                                    }
                                    return found;
                                })
                            }
                        });
                    } else {
                        latCenter = vm.tasks[0].x;
                        lngCenter = vm.tasks[0].y;
                        if (vm.viewMarkerPoints){
                            vm.addMarker(vm.tasks[0].x,vm.tasks[0].y)
                        }
                    }

                    //reset vote location
                    $scope.votedLat = latCenter;
                    $scope.votedLng = lngCenter;


                    vm.hideModal();

                    //percentage complete
                    $scope.next_per2 = Math.floor($scope.next_per);


                    vm.data.progress = parseInt(vm.data.progress) + 1;
                    //update progress bar:


                    if (vm.progress_type == "block"){
                        $scope.next_per = (vm.current_block_progress / vm.current_block_size).toFixed(2) *100;
                        if (vm.current_block_progress == 0){
                            $scope.next_per = 0;
                        }
                        $scope.mturkbarStyle = {"width" : $scope.next_per.toString() + "%"};

                    } else {
                        //update progress bar:
                        $scope.next_per = (vm.data.progress / vm.data.size).toFixed(2) *100;
                        if (vm.data.progress == 1){
                            $scope.next_per = 0;
                        }
                        $scope.mturkbarStyle = {"width" : $scope.next_per.toString() + "%"};
                    }
                    $scope.next_per2 = Math.floor($scope.next_per);

                    //if we are past the required amount for the project, show exit button
                    if (vm.data.progress > vm.req_amount ) {
                        $scope.showSurvButton = true;
                    }


                    //if flight path, change color of marker for the image that was just voted
                    if (vm.showFlightPath) {
                        $scope.geoMarkers.some(function (item) {
                            found = false;
                            if (item.title === vm.image) {
                                var col = vm.data.template.options[option].color;
                                item.icon = $scope.icon_array[parseInt(col)-1];
                                item.setIcon($scope.icon_array[parseInt(col)-1])
                                // item.setZIndex(google.maps.Marker.MAX_ZINDEX + 1);
                                item.setMap(vm.flight_map);
                                vm.setCurrentPos();
                                found = true
                            }
                            return found;
                        })
                    }
                });
            }


        };

        //Map initialization for map tasks:

        function map_init(){
            NgMap.getMap({id:'main_map'}).then(function(map) {
                vm.map = map;
                var myLatlng = new google.maps.LatLng(getLat(),getLng());
                vm.map.setCenter(myLatlng);
                latCenter = vm.map.getCenter().lat();
                lngCenter = vm.map.getCenter().lng();
                vm.lat= latCenter;
                vm.lang = lngCenter;
                vm.defZoom = 15;
                //console.log(latCenter, lngCenter);
            });
        }



        function fetchCenter(){
            //console.log('In get Center ');
            //first ng init map
            var lng = vm.getLng();
            var lat = vm.getLat();
            return [lat,lng];
        }
        function resetZoom(){
            //console.log('In get Zoom ');
            vm.map.setZoom(dZoom);
        }

        function centerChanged() {
            NgMap.getMap({id:'main_map'}).then(function(point_map) {
                vm.centerLat = point_map.getCenter().lat();
                vm.centerLng = point_map.getCenter().lng();
                // latCenter = point_map.getCenter().lat();
                // lngCenter = point_map.getCenter().lng();
                $scope.votedLat = point_map.getCenter().lat();
                $scope.votedLng = point_map.getCenter().lng();
            });
        }

        function zoomChanged() {
            //console.log('IN ZOom CHnaged'+ vm.map.getCenter().lat(), vm.map.getCenter().lng());
            NgMap.getMap({id:'main_map'}).then(function(point_map) {
                vm.centerLat = point_map.getCenter().lat();
                vm.centerLng = point_map.getCenter().lng();
                // latCenter = point_map.getCenter().lat();
                // lngCenter = point_map.getCenter().lng();
                $scope.votedLat = point_map.getCenter().lat();
                $scope.votedLng = point_map.getCenter().lng();
            })

        }

        vm.recenter = function() {
            var cntr = new google.maps.LatLng(latCenter,lngCenter);
            vm.map.panTo(cntr);
            vm.map.setZoom(dZoom);
        };


        function addMarker(m_lat,m_lon){
            NgMap.getMap({id:'main_map'}).then(function(point_map) {

                if (typeof $scope.pointMarkers!== 'undefined' && $scope.pointMarkers.length > 0) {
                    // unset previous marker
                    var prev_marker = $scope.pointMarkers.pop()
                    prev_marker.setMap(null);
                }

                var point_pos = {lat: parseFloat(m_lat)  , lng: parseFloat(m_lon) };
                var point_marker = new google.maps.Marker({
                    position: point_pos,
                    map: point_map,
                    title: "marker",
                    id: vm.data.progress,
                    // zIndex: pointId,
                    icon: $scope.point_array[$scope.point_array.length -1] //all unclicked markers are gray
                });
                $scope.pointMarkers.push(point_marker);
                //add marker on the map:
                point_marker.setMap(point_map);

            });
        }


        //Sequences in the form L3-M3-...
        //convert to LLLMMM...
        function decodeGeneticSequence(sq){
            var dec_seq = [];
            //split into segments
            var seg_list = sq.split('-');
            //for each segment, push the symbol:
            seg_list.forEach((function (segment){
                var icon = segment[0];
                var number = parseInt(segment[1]);
                for (var i=0; i < number;i++){
                    dec_seq.push(icon)
                }
            }));
            return dec_seq;
        }

        //decodes block of type XX00 into XX and 00
        //eg L7 -> L and 7
        function decodeBlock(bl){


            //start from end of string
            //while substring can be parsed to int, then digit and remaining is string
            var end = bl.length;
            var end_indx = end;
            while(true){
                end_indx--;
                digit = bl.substring(end_indx,end); //start with last one
                symbol = bl.substring(0,end_indx);
                    //if digit stops parsing, we hit a symbol
                    if (isNaN(parseInt(digit)) ||  end_indx <= 0 ) {
                        end_indx++;
                        digit = bl.substring(end_indx,end); //start with last one
                        symbol = bl.substring(0,end_indx);
                        break;
                    }
            }
            return {digit:parseInt(digit),symbol:symbol}
        }

        //based on where we are
        vm.getNextGeneticCode = function(){

            var blocks = vm.genetic_sequence.split('-');
            var b_length = blocks.length;
            var idx = 0;
            var sum = 0;
            while (true){
                var block = blocks[idx];
                var dec_b = decodeBlock(block);
                var symbol = dec_b.symbol;

                var digit = dec_b.digit;
                sum += digit;
                if (sum > vm.total_genetic_progress){
                    break;
                }
                idx++;
                if (idx >= b_length){
                    idx = 0;
                }
            }
            vm.genetic_task_current = vm.genetic_projects[symbol];
            vm.genetic_task_current_symbol = symbol;
            vm.genetic_tasks_to_load = sum - (vm.total_genetic_progress ) ;
            vm.current_block_size = digit;
            vm.current_block_progress = digit - vm.genetic_tasks_to_load;

        };


        vm.loadProjectInfo = function(callback){
            //get next genetic sequence
            vm.getNextGeneticCode();
                //Get project info based on the next genetic genetic:
                $http.get('/api/tasks/getInfoRegister/' + vm.genetic_task_current).then(function(data) {
                    vm.data = data.data;
                    vm.data.template = JSON.parse(vm.data.template);
                    vm.req_amount = vm.data.req_count;
                    if (parseInt(vm.req_amount) == 0) {
                        $scope.req_text = "You may complete any number of subtasks before clicking the \"Go to Survey\" button to finish."
                    } else {
                        $scope.req_text = "You must complete at least " + vm.req_amount + " subtasks in order to continue to the survey."
                    }

                    vm.survey_t = vm.data.survey_type || 'IMI';
                    vm.survey_type = 'survey' + vm.survey_t;

                    //get the tasks to show
                    vm.getTasks();

                    //Set progress bar:
                    if (vm.progress_type == "block"){
                        $scope.next_per = (vm.current_block_progress / vm.current_block_size).toFixed(2) *100;
                        $scope.mturkbarStyle = {"width" : $scope.next_per.toString() + "%"};
                        $scope.next_per2 = Math.floor($scope.next_per);

                    } else {
                        $scope.next_per = (vm.data.progress / vm.data.size).toFixed(2) *100;
                        $scope.mturkbarStyle = {"width" : $scope.next_per.toString() + "%"};
                        $scope.next_per2 = Math.floor($scope.next_per);
                    }

                    //add dummy vote for timestamp of first entry
                    submitStartTime();

                    // required amount to be able to continue to survey
                    if (vm.data.progress > vm.req_amount ) {
                        $scope.showSurvButton = true;
                    }


                    //check if flight path enabled for project:
                    if (vm.data.flight_path) {
                        vm.showFlightPath = true;
                    }

                    //check if flight path enabled for project:
                    if (vm.data.point_selection) {
                        vm.showMarkerPoints = true;
                        vm.point_csv_file = vm.data.points_file;
                        //show the modal with extra info for the first time
                        if (vm.userType == "mTurk") {$("#helpModal").modal('show')}

                    } else if (vm.data.points_file != null){
                        //zoom in on location
                        dZoom = 17;
                        vm.point_csv_file = vm.data.points_file;
                        vm.viewMarkerPoints = true;

                    }

                    //if flight path enabled, prepare progress map with markers:
                    if (vm.showFlightPath) {


                        vm.flight_centerChanged = flight_centerChanged;

                        function flight_centerChanged() {
                            //console.log('IN center CHnaged' +vm.map.getCenter().lat(), vm.map.getCenter().lng() );
                            var latCenter = vm.flight_map.getCenter().lat();
                            var lngCenter = vm.flight_map.getCenter().lng();
                        }


                        //Get all images from the project and set as grey markers
                        $http.get('/api/project/getProjectPoints/' + vm.code ).then(function(data) {

                            var projectPoints = data.data;

                            if (userData) {
                                var queryline = '/api/results/all/' + vm.code + '/' + userData.id;
                            } else {
                                var workerID = $location.search().workerID || $location.search().participantID ;
                                var hitID = $location.search().hitID || $location.search().trialID;
                                var queryline = '/api/results/all/' + vm.code + '/'  +  encodeURIComponent(workerID);
                            }

                            //Get all the user's votes so far on the project and change icon based on answer
                            $http.get(queryline ).then(function(vote_data) {

                                var userVotes = vote_data.data;

                                //Map initialization
                                NgMap.getMap({id:'flight_path'}).then(function(flight_map) {

                                    //all unvisited points are gray
                                    var markerID = 0;
                                    vm.flight_map = flight_map;
                                    projectPoints.forEach(function (item) {
                                        var pos = {lat: parseFloat(item.x) , lng: parseFloat(item.y)};
                                        var marker = new google.maps.Marker({
                                            position: pos,
                                            map: flight_map,
                                            title: item.name,
                                            id: markerID,
                                            zIndex: markerID,
                                            icon: $scope.icon_array[$scope.icon_array.length -1]
                                        });
                                        $scope.geoMarkers.push(marker);
                                        markerID += 1;
                                    });

                                    //change icon color based on vote
                                    userVotes.forEach(function (item) {
                                        var indx = $scope.geoMarkers.map(function(x) {return x.title; }).indexOf(item.task_id);
                                        $scope.geoMarkers[indx].icon = $scope.icon_array[parseInt(item.color)-1]
                                    });
                                    //set current position:
                                    vm.setCurrentPos();

                                    //get center
                                    var midindex = Math.floor($scope.geoMarkers.length/2)
                                    vm.map_center_latlng = $scope.geoMarkers[midindex].position;
                                    vm.map_center_lat = $scope.geoMarkers[midindex].getPosition().lat();
                                    vm.map_center_lng = $scope.geoMarkers[midindex].getPosition().lng();
                                    //set map
                                    vm.flight_map = flight_map;
                                    vm.flight_map.setCenter(vm.map_center_latlng);
                                    vm.flight_map_lat = vm.map_center_lat //- 0.015;
                                    vm.flight_map_lng = vm.map_center_lng //+ 0.02;
                                    // vm.defZoomFlight = 10;
                                    //Put markers on the map
                                    var bounds = new google.maps.LatLngBounds();
                                    $scope.geoMarkers.forEach(function (item) {
                                        item.setMap(vm.flight_map);
                                        bounds.extend(item.getPosition());
                                    });
                                    vm.flight_map.setCenter(bounds.getCenter());
                                    vm.flight_map.fitBounds(bounds);
                                    vm.flight_map.setZoom(vm.flight_map.getZoom()+2);

                                });

                            });
                        });
                    }

                    //if markers task, read points from csv, make markers, add listener, add them to the map
                    if (vm.showMarkerPoints || vm.viewMarkerPoints) {

                        // reject all colors that are not in the project creation options
                        //reject dummy vote QQQ (allows for project creation with only one answer for markers)
                        $scope.point_array_filtered = [];
                        vm.data.template.options.forEach(function (item) {
                            if(item.text != 'QQQ'){
                                $scope.point_array_filtered.push($scope.point_array[item.color-1]);
                            }
                        });
                        $scope.point_array_filtered.push($scope.point_array[$scope.point_array.length -1]);

                        //get map from task:
                        NgMap.getMap({id:'main_map'}).then(function(point_map) {
                            // read CSV file content

                            $scope.pointMarkers = [];
                            var pointId = 0;
                            if (vm.showMarkerPoints){
                                d3.csv('/images/files/'+vm.point_csv_file, function(csv_data) {

                                    for (var i = 0; i < csv_data.length; i++) {
                                        // split content based on comma
                                        var csv_obj = csv_data[i];
                                        //make marker from csv point in csv_obj
                                        var point_pos = {lat: parseFloat(csv_obj.latitude) , lng: parseFloat(csv_obj.longitude)};
                                        var point_marker = new google.maps.Marker({
                                            position: point_pos,
                                            map: point_map,
                                            title: csv_obj.name,
                                            id: pointId,
                                            // zIndex: pointId,
                                            icon: $scope.point_array[$scope.point_array.length -1] //all unclicked markers are gray
                                        });
                                        //If markers clickable, add click listener to change color on click
                                        if (vm.showMarkerPoints){
                                            google.maps.event.addListener(point_marker, 'click', function() {

                                                var col = this.icon;
                                                //get index of color from array
                                                var marker_indx = $scope.point_array_filtered.indexOf(col);
                                                marker_indx = (marker_indx + 1) % $scope.point_array_filtered.length;
                                                this.icon = $scope.point_array_filtered[marker_indx];
                                                this.setIcon($scope.point_array_filtered[marker_indx]);

                                                this.setMap(point_map)
                                            });
                                        }
                                        $scope.pointMarkers.push(point_marker);
                                        pointId += 1;

                                    }//end of csv loop

                                    //add markers on the map:
                                    $scope.pointMarkers.forEach(function (item) {
                                        item.setMap(point_map);
                                    });

                                    //Make the legend:
                                    if (vm.showMarkerPoints) {

                                        vm.legendObject = [];
                                        vm.data.template.options.forEach(function (item) {

                                            //Ignore dummy 'QQQ' option
                                            if(item.text != 'QQQ') {
                                                vm.legendObject.push({
                                                    key: item.text,
                                                    image: $scope.point_array[item.color - 1]
                                                })
                                            }

                                        });
                                        vm.legendObject.push({
                                            key: 'Unselected',
                                            image: $scope.point_array[$scope.point_array.length -1]
                                        })
                                    }





                                }); //end of csv http get
                            } else {
                                //if viewMarkers, just show one marker
                                vm.addMarker(vm.fetchCenter()[0],vm.fetchCenter()[1])

                            }

                        }); //end of map fetch


                    } //end of if showPoints
                    callback()

                }, function(err) {
                    alert('You seem to have a wrong/invalid link');
                });

        };


        vm.getGeneticInfo = function(callback){
            //get sequence info

            $http.get('/api/project/getGeneticInfo/' + vm.code).then(function(gen_seq_data) {

                vm.gen_data = gen_seq_data.data;
                //get the sequence
                vm.genetic_sequence =  vm.gen_data.genetic_info.seq;
                //get the progress type:
                vm.progress_type = vm.gen_data.genetic_info.progress_type;

                //hide progress if type of progress is none
                if (vm.progress_type && vm.progress_type == "none") {
                    vm.viewProgress = false;
                }

                //get the projects for each type
                //HANDLE MULTIPLE CODES OF SAME TYPE e.g L, LL etc if comma separaterd text
                extract_multiple_projects(vm.gen_data.genetic_info);

                // vm.genetic_projects = {
                //     L: vm.gen_data.genetic_info.label_project,
                //     M: vm.gen_data.genetic_info.map_project,
                //     A: vm.gen_data.genetic_info.marker_project
                // };
                // vm.genetic_projects_progress = {
                //     L: 0,
                //     M: 0,
                //     A: 0
                // };

                //get the progress for each subtask and total progress:
                vm.progress_genetic_data = vm.gen_data.progress_info;
                vm.total_genetic_progress = 0;
                vm.progress_genetic_data.forEach(function (gItem){
                    for (key in vm.genetic_projects){
                        if (vm.genetic_projects[key] == gItem.unique_code){
                            vm.genetic_projects_progress[key] =  gItem.progress -1;
                            vm.total_genetic_progress+= gItem.progress -1;
                            break;
                        }
                    }
                });
                vm.overall_progress_view = vm.total_genetic_progress;




                //from sequence, get next task to load
                vm.genetic_task_current = '';
                vm.genetic_task_current_symbol = '';
                vm.genetic_tasks_to_load = 0;

                //Get project info based on the next genetic genetic:
                vm.loadProjectInfo(function(){
                    callback()

                });

            });
        };


        //chedk if subsequence is satisfied
        function checkSatisfiedSequence(){

            //will need the sequence and the progress
            var dummyTask = {name:"dummy"}
            var body = {
                sequence: vm.genetic_sequence,
                progress: vm.total_genetic_progress + vm.current_block_progress,
                depth: SEQ_DEPTH
            };
            $http.post('/api/dynamic/checkSatisfiedSubsequence/' + vm.code , body)


        };



        //get genetic info then load project
        vm.getGeneticInfo(function(){});





        //extract codes for the multiple of same type case
        function extract_multiple_projects(dt){

            var project_columns = ['label_project','map_project','marker_project'];
            var project_shortcuts = ['L','M','A'];
            vm.genetic_projects = {};
            vm.genetic_projects_progress = {};


            //for every type, retrieve list of projects
            for (var i = 0; i < project_columns.length; i++) {

                var item = project_columns[i];
                var code = project_shortcuts[i];

                //ιf not null, break list and make a short code for each
                if (dt[item] != undefined){

                    var proj_list =  dt[item].split(',');
                    proj_list.forEach(function(item){
                        vm.genetic_projects[code] = item;
                        vm.genetic_projects_progress[code] = 0;
                        code += code;
                    })
                }
            }
        }


        function getColourClass(color) {
            return 'c' + color;
        };

    }]);

