/**
 * Created by kiprasad on 23/10/16.
 */
var module = angular.module('surveyApp', ['ui.router','uiGmapgoogle-maps', 'configApp'])

 .config(['uiGmapGoogleMapApiProvider', function (GoogleMapApi) {
        GoogleMapApi.configure({
       key: 'AIzaSyAL32H2arSyCcBfcD49o1wG32pkHaNlOJE',
            // v: '3.20',
            libraries: 'weather,geometry,visualization'
        });
    }]);


module.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider.state({
    name: 'survey1',
    url: '/survey',
    templateUrl: 'templates/survey.html',
    controller: 'surveyController'
  });

  $stateProvider.state({
            name: 'surveyTLX',
            url: '/surveyTLX',
            templateUrl: 'templates/survey_tlx.html',
            controller: 'surveyTLXController'
  });

    $stateProvider.state({
        name: 'surveyGAMEontroller',
        url: '/surveyGAME',
        templateUrl: 'templates/survey_game.html',
        controller: 'surveyGAMEontroller'
    });





  $stateProvider.state({
    name: 'hitCode',
    url: '/hit',
    template: '<div class="col-md-12 text-center" style="margin-top: 100px;"><h1>Thank you very much for participating!</h1>' +
    '<br><h1>Return to Amazon Mechanical Turk and paste the following code to complete the survey</h1><br>' +
    '<h1><i><b>{{hitCode}}</b></i></h1></div>',
    controller: 'hitController',
    params: {
      hitCode: null
    }
  });

  $stateProvider.state({
      name: 'heatMap',
      url: '/heatmap',

      templateUrl: 'heatmap2.html',
      params: {
          workerId: '',
          project: ''
      },

      controller: function ($scope,$stateParams, $window, $http, heatMapProject1, heatMapProject2) {

          $scope.callSuccess = false;
          $scope.callSuccess1 = false;
          $scope.callSuccess2 = false;
          $scope.workerId = $stateParams.workerId;
          $scope.project = $stateParams.project;
          // console.log($scope.workerId , $scope.project, $stateParams.workerId, $stateParams.project);
          $scope.projectCodeForHeatMapHTML = heatMapProject2;
          $scope.showSource = false;
          $scope.showMarkers = false;


          $scope.exit = exit;
          function exit(){
              console.log('in exit');
              // $window.location.href='/algalBloom.html';
              $window.location.href='kioskProject.html#/kioskStart/' + $scope.project;
          }

          // $scope.icon_array =  ['http://maps.google.com/mapfiles/ms/icons/green-dot.png',
          //                       'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png',
          //                       'http://maps.google.com/mapfiles/ms/icons/orange-dot.png',
          //                       'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
          //                       'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
          //                       'http://maps.google.com/mapfiles/ms/icons/purple-dot.png'];

          $scope.icon_array =  ['/images/dots/cs_green_dot.svg',
              '/images/dots/cs_yellow_dot.svg',
              '/images/dots/cs_orange_dot.svg',
              '/images/dots/cs_red_dot.svg',
              '/images/dots/cs_blue_dot.svg',
              '/images/dots/cs_purple_dot.svg'];


          $scope.hex_array = ['#9cdc1f',
              '#FFF200',
              '#F7941D',
              '#ff0000',
              '#0072BC',
              '#8a2be2'
          ];

           $scope.point_array =  ['/images/markers/marker_green2.svg',
              '/images/markers/marker_yellow2.svg',
              '/images/markers/marker_orange2.svg',
              '/images/markers/marker_red2.svg',
              '/images/markers/marker_blue2.svg',
              '/images/markers/marker_purple2.svg',
              '/images/markers/marker_grey.svg'];

          var ans_colors =  {

              '1':'green',
              '2': 'yellow',
              '3': 'orange',
              '4' : 'red',
              '5': 'blue',
              '6' : 'purple',
              'all' : 'all'
          };
          var gradients = {
              red: [ 255,0,0],
              green: [ 0, 255,0],
              blue: [0,0,255],
              orange: [255,165,0],
              yellow: [255,255,0],
              purple: [138,43,226],
              all: [255,20,147]
          };

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

          //count unique items per key from object array
          function count_unique(arr, key){

              var flags = [], output = [], l = arr.length, i;
              for( i=0; i<l; i++) {

                  var itm = arr[i];
                  if( flags[itm[key]]) continue;
                  flags[itm[key]] = true;
                  output.push(itm[key]);
              }

              return output.length;
          }

          function get_unique(arr, key){

              var flags = [], output = [], l = arr.length, i;
              for( i=0; i<l; i++) {

                  var itm = arr[i];
                  if( flags[itm[key]]) continue;
                  flags[itm[key]] = true;
                  output.push(itm[key]);
              }

              return output;
          }



          $scope.update_heatmap = function (answer,mapno) {

              var geodata =[];

              if (answer != 'all') {

                  //Filter data based on answer clicked
                  var answer_results = filterResponses(
                      //$scope.results1, {answer: "\"" + answer + "\""});
                      $scope.results1, {color: parseInt(answer)});

              } else {
                  var answer_results = $scope.results1;
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

          $scope.update_Markers = function (answer,mapno){

              if (answer === "reset") {

                  $scope.pointMarkersVisible = $scope.totalMarkersVisible;

              } else {
                  //get the markers
                  $scope.pointMarkersVisible = [];

                  var target_icon = $scope.point_array[answer-1];
                  $scope.totalMarkersVisible.forEach(function(item){

                      if (item.icon === target_icon) {
                          $scope.pointMarkersVisible.push(item)
                      }
                  })
              }
          };

          $scope.update_selection = function (choice){

              if (choice == "user") {

                  $scope.pointMarkersVisible = $scope.pointMarkersUser;
                  $scope.totalMarkersVisible = $scope.pointMarkersUser;

              } else if (choice == "all") {
                  $scope.pointMarkersVisible = $scope.pointMarkersAll;
                  $scope.totalMarkersVisible = $scope.pointMarkersAll;

              }

          }


          //Function for Heatmap
          function HeatLayer(heatLayer,rdata,pointArray,answer) {

              //Create lat lng from array of objects
              var geodata = [];

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
          };

          $http.get('/api/tasks/getInfoFree/' + $scope.project).then(function(pdata) {


              $scope.proj_data = pdata.data[0];
              $scope.dataset_id = $scope.proj_data.dataset_id;

              $scope.image_source = $scope.proj_data.image_source;

                  if ($scope.image_source != null) {
                      $scope.showSource = true;
                  }


              //Get options from the template
              var templ = JSON.parse($scope.proj_data.template);
              var templ_opts = templ.options;
              $scope.projType = templ.selectedTaskType;
              //Make the legend:
              var legend = [];

              var opt = [];
              templ_opts.forEach(function (item){
                  //Make the option buttons
                  var opt_item = {'name': item.text, 'ncolor': item.color, 'color': $scope.hex_array[item.color -1] };
                  opt.push(opt_item);
                  //Make the legend
                  if ( $scope.projType == "tagging") {
                      legend.push({'key':item.text,'image': $scope.icon_array[item.color-1]})
                  } else {
                      legend.push({'key':item.text,'image': $scope.point_array[item.color-1]})
                  }

              });


              $scope.options = opt;
              $scope.legendObject = legend;
              $scope.callSuccess1 = true;

              // Question
              $scope.q1 = templ.question;
              //Unquote
              $scope.question1 = $scope.q1.replace(/\"/g, "");


              if ( $scope.projType == "mapping") {
                  $scope.showMarkers = true;

                  $http.get('/api/results/allMarkersUsers/' + $scope.project).then(function(data){


                      //Results from get
                      $scope.results1 = data.data;

                      //number of markers:
                      $scope.unique_pois = get_unique($scope.results1, 'key_item');

                      //Number of workers:
                      //$scope.unique_workers1 = count_unique($scope.results1, 'user_id');

                      //pick a random point as inital map center
                      var init_point = Math.floor(Math.random() * $scope.results1.length);


                      //Make the markers for the user:
                      $scope.workerResults = filterResponses(
                          $scope.results1, {user_id: $scope.workerId});


                      $scope.markerID = 0;
                      $scope.pointMarkersUser = [];
                      $scope.workerResults.forEach(function (item) {

                          var point_marker = {
                              latitude: parseFloat(item.center_lat) ,
                              longitude: parseFloat(item.center_lon) ,
                              title: $scope.markerID, //TODO: get poi name here
                              id: $scope.markerID,
                              icon: $scope.point_array[parseInt(item.response)-1]
                          };


                          point_marker.templateUrl = 'infowindowMarkers_template.html';
                          point_marker.templateParameter = {
                              id:   $scope.markerID,
                              title: {freq: 1, res:item.response} //TODO: something here
                          };

                          $scope.pointMarkersUser.push(point_marker);
                          $scope.markerID += 1;


                      });

                      //Initialize markers to user contributions
                      $scope.pointMarkersVisible = $scope.pointMarkersUser;
                      $scope.totalMarkersVisible = $scope.pointMarkersUser;


                      $scope.markerClick = function (data) {
                          alert(data);
                      };


                      //get the data for all
                      $scope.pointMarkersAll = [];
                      var pmarker = 0;

                      //get unique responses:
                      $scope.u_responses = get_unique($scope.results1, 'response');


                      $scope.unique_pois.forEach(function (item){

                          var max_res =  0;
                          var max_cnt = 0;

                          var marker_lat, marker_lon;

                          //get all the votes for that marker and find majority label
                          var marker_votes = [];
                          for (var j = 0; j < $scope.u_responses.length; j++) {

                              i = $scope.u_responses[j];
                              marker_votes = [];
                              marker_votes = filterResponses(
                                  $scope.results1, {key_item: item, response:i });


                              //get the lat/lon info
                              if (marker_votes.length > 0) {
                                  marker_lat = marker_votes[0].center_lat;
                                  marker_lon = marker_votes[0].center_lon;

                                  if (marker_votes.length > max_cnt) {
                                      max_res = i;
                                      max_cnt = marker_votes.length;
                                  }
                                  //push to totalMarkersAll

                                  if (max_res >0 && max_cnt > 0){
                                      var point_marker2 = {
                                          latitude: parseFloat(marker_lat) ,
                                          longitude: parseFloat(marker_lon) ,
                                          title: max_res, //TODO: get poi name here
                                          id: pmarker,
                                          icon: $scope.point_array[max_res-1]
                                      };


                                      point_marker2.templateUrl = 'infowindowMarkers_template.html';
                                      point_marker2.templateParameter = {
                                          id:   pmarker,
                                          title: {freq: max_cnt, res:max_res}//TODO: something here
                                      };

                                      $scope.pointMarkersAll.push(point_marker2);
                                      pmarker += 1;
                                  }

                              }


                          }


                      });



                      //generate first map
                      $scope.map1 = {
                          center: {
                              latitude: parseFloat($scope.results1[init_point].center_lat),
                              longitude: parseFloat($scope.results1[init_point].center_lon)
                          },
                          zoom: 7,
                          markers: $scope.pointMarkersVisible,
                          markersEvents: {
                              click: function(marker, eventName, model) {
                                  $scope.map1.window.model = model;
                                  $scope.map1.window.show = true;
                              }
                          },
                          window: {
                              marker: {},
                              show: false,
                              closeClick: function() {
                                  this.show = false;
                              },
                              options: {}
                          },
                          showHeat: false
                      };

                      $scope.callSuccess = true;

                  }).catch(function(error){

                      //Error with first http get
                      console.log(error);
                  });

              } else {
                  //Get the results of the project:


                  $http.get('/api/results/all/' + $scope.project).then(function(data){

                      //Results from get
                      $scope.results1 = data.data;


                      // Answer of first project
                      $scope.q1 = $scope.results1[0].question;
                      //Unquote
                      $scope.question1 = $scope.q1.replace(/\"/g, "");

                      //number of images:
                      $scope.unique_images1 = count_unique($scope.results1, 'task_id');
                      //Number of workers:
                      $scope.unique_workers1 = count_unique($scope.results1, 'workerid');


                      //Make the markers:
                      $scope.workerResults = filterResponses(
                          $scope.results1, {user_id: $scope.workerId});



                      $scope.markerID = 0;
                      $scope.workerResultsTransformed = [];
                      $scope.workerResults.forEach(function (item) {

                          var point_marker = {
                              latitude: parseFloat(item.x) ,
                              longitude: parseFloat(item.y) ,
                              title: '/api/tasks/getImage/' + $scope.dataset_id  + '/' + item.task_id,
                              id: $scope.markerID,
                              icon: $scope.icon_array[parseInt(item.color)-1]
                          };


                          point_marker.templateUrl = 'infowindow_template.html';
                          point_marker.templateParameter = {
                              id:   $scope.markerID,
                              title: '/api/tasks/getImage/' + $scope.dataset_id  + '/' + item.task_id
                          };

                          $scope.workerResultsTransformed.push(point_marker);
                          $scope.markerID += 1;


                      });

                      $scope.markerClick = function (data) {
                          alert(data);
                      };

                      $scope.pointMarkersVisible = $scope.workerResultsTransformed;


                      //generate first map
                      $scope.map1 = {
                          center: {
                              latitude: parseFloat($scope.results1[0].x),
                              longitude: parseFloat($scope.results1[0].y)
                          },
                          zoom: 7,
                          markers: $scope.pointMarkersVisible,
                          markersEvents: {
                              click: function(marker, eventName, model) {
                                  $scope.map1.window.model = model;
                                  $scope.map1.window.show = true;
                              }
                          },
                          window: {
                              marker: {},
                              show: false,
                              closeClick: function() {
                                  this.show = false;
                              },
                              options: {}
                          },
                          heatLayerCallback: function (layer) {
                              //set the heat layer from the data
                              $scope.pointArr1 = [];
                              $scope.htlayer1 = layer;
                              var htl1 = new HeatLayer($scope.htlayer1,$scope.results1,$scope.pointArr1,1);
                          },
                          showHeat: true
                      };

                      $scope.callSuccess = true;

                  }).catch(function(error){

                      //Error with first http get
                      console.log(error);
                  });
              }



          });





      }
  });
  $urlRouterProvider.otherwise('/survey');
});

//
// module.controller('infowindowTemplateController', infowindowTemplateController);
//
// infowindowTemplateController.$inject=['$scope'];
// function infowindowTemplateController ($scope) {
// }

module.controller('appController', ['$scope', '$location', function($scope, $location) {
  $scope.params = $location.search();
  $scope.response = {};
  if (!$scope.params.code) {
    alert('missing project code');
    window.location.replace('/');
  }
}]);

module.controller('hitController', ['$scope', '$stateParams', function($scope, $stateParams) {
  $scope.hitCode = $stateParams.hitCode;
}]);

module.controller('surveyController', ['$scope', '$http', '$state', '$location',function($scope, $http, $state, $location) {
  $scope.userType = $scope.params.userType;
  $scope.forms = {};

  $scope.survCh = {showChainQuestions : false};

  $scope.first_choice = "First";
  $scope.second_choice = "Second";

  if ( parseInt($location.search().showChainQuestions)  == 1) {
      $scope.survCh.showChainQuestions = true;
      $scope.survCh.showMapDiff = true;
  }
  //TOFIX: API CALL TO DECIDE ORDER OF CHOICES
   $scope.flight_last = parseInt($location.search().showFlight);




    if ($scope.flight_last) {
        $scope.first_choice = "No map";
        $scope.second_choice = "Map";
        $scope.survCh.showMapDiff = true;
    } else {
        $scope.first_choice = "Map";
        $scope.second_choice = "No map";
    }

  $scope.submit = function() {
    var data = $scope.transformData($scope.response, $scope.userType);

    if (data != -1) {
      $http.post('/api/project/' + $scope.params.code + '/survey', JSON.stringify(data)).then(function(data) {
        // console.log('data',data.data);
        //console.log(data.data.hitCode);
        if (data.data.hitCode) {
            $state.go('hitCode', {hitCode: data.data.hitCode});
        } else if (data.data.heatMap) {
            $state.go('heatMap', {project: $scope.params.code, workerId: data.data.workerId});
        }
      }, function(err) {
          if ($scope.userType == 'mTurk') {

              //if there is any other unexpected issue, use fallback code:
              var fallback = "c0b72bcf-39ac-40f5-99c4-d4016f510237";
              alert('Something unexpected occurred. Please use the following completion code to get compensated: ' + fallback);
          } else {
              alert('Something unexpected occurred.');
          }
      });
    }
  };

  $scope.transformData = function(response, userType) {

    if(userType == 'kiosk'){
        // if (!('local_diff' in response)) {
        //     return -1;
        // }

        // var whyMoreOptions = [];
        //
        // if (response.whymore1) {
        //     whyMoreOptions.push('instructions');
        // }
        // if (response.whymore2) {
        //     whyMoreOptions.push('paid');
        // }
        // if (response.whymore3) {
        //     whyMoreOptions.push('reject');
        // }

        return {
            'enjoy_task': response['enjoy_task'] || '',
            'enjoy_task_text': response['enjoy_task_text'] || '',
            'priorexp': response['priorexp'] || '',
            'priorexp_text': response['priorexp_text'] || '',
            'contribute': response['contribute'] || '',
            'contribute_text': response['contribute_text'] || '',
            'local_diff': response['local_diff'] || 0,
            'additional_feedback': response['additional_text'] || ''
        };

    } else {
        // if (!response['why_text'] || !('tech_diff' in response)) {
        //     return -1;
        // }



        //fixed survey questions
        // ULB stands for User Left Blank
        var ret_obj =  {
            'why_text': response['why_text'] || 'ULB',
            'tech_diff': response['tech_diff'] || 0,
            'tech_diff_text': response['tech_diff_text'] || 'ULB',
            'additional_feedback': response['additional_text'] || 'ULB'
        };

        // Update: Create one value for each checkbox for easier analysis
        //TOFIX: make it general for checkboxes
        var whyMoreOptions = [];
        if (response.whymore1) {
            whyMoreOptions.push('instructions');
            ret_obj['instructions_ckb'] = 1
        } else {
            ret_obj['instructions_ckb'] = 0
        }
        if (response.whymore2) {
            whyMoreOptions.push('paid');
            ret_obj['paid_ckb'] = 1
        } else {
            ret_obj['paid_ckb'] = 0
        }
        if (response.whymore3) {
            whyMoreOptions.push('reject');
            ret_obj['reject_ckb'] = 1
        } else {
            ret_obj['reject_ckb'] = 0
        }

        ret_obj['why_more'] = whyMoreOptions.join('|');


        //chaining questions
        if ($scope.survCh.showChainQuestions){

            ret_obj['pref_interface'] = response['pref_interface'] || -1;
            ret_obj['pref_interface_text'] = response['pref_interface_text'] || 'ULB';
            ret_obj['map_diff'] = response['map_diff'] || -1;
            ret_obj['map_diff_text'] = response['map_diff_text'] || 'ULB';
            ret_obj['image_desc'] = response['image_desc'] || 'ULB';
            ret_obj['image_location'] = response['image_location'] || 'ULB';
        }

        return ret_obj;

    }
    // if (!response['why_text'] || !('tech_diff' in response)) {
    //   return -1;
    // }

    var whyMoreOptions = [];
    if (response.whymore1) {
      whyMoreOptions.push('instructions');
    }
    if (response.whymore2) {
      whyMoreOptions.push('paid');
    }
    if (response.whymore3) {
      whyMoreOptions.push('reject');
    }

    return {
      'why_text': response['why_text'] || '',
      'why_more': whyMoreOptions.join('|'),
      'tech_diff': response['tech_diff'] || 0,
      'tech_diff_text': response['tech_diff_text'] || '',
      'additional_feedback': response['additional_text'] || ''
    };
  };

  // module.controller('heatMapController', function($scope, $window){
  //
  //     $scope.exit = function ($window) {
  //         console.log('in exit');
  //         $window.location.href='/consentForm.html#/kiosk';
  //     }
  //
  // });

}]);


module.controller('surveyTLXController', ['$scope', '$http', '$state', '$location','$timeout','$compile',function($scope, $http, $state, $location,$timeout,$compile) {


    //Generate numbers for radio buttons for TLX
    $scope.getNumber = function(){
        var ratings = [];
        for (var i = 0; i <= 100; i += 5){
            ratings.push(i)
        }
        return ratings;
    };

    $scope.req_answers = false;

    $scope.userType = $scope.params.userType;
    $scope.forms = {};

    if ($scope.userType == 'mTurk') {

        $scope.req_answers = true;
    }

    $scope.submit = function() {
        
        var data = $scope.transformDataTLX($scope.response, $scope.userType);

        if ($scope.userType == 'mTurk') {
            if (data.mental == 'ULB' || data.physical =='ULB' || data.temporal == 'ULB' ||
                data.effort == ' ULB' || data.performance == 'ULB' || data.frustration == 'ULB') {
                return alert("Please fill out all the required fields!")
            }
        }



        if (data != -1) {
            $http.post('/api/project/' + $scope.params.code + '/survey', JSON.stringify(data)).then(function(data) {
                // console.log('data',data.data);
                //console.log(data.data.hitCode);
                if (data.data.hitCode) {
                    $state.go('hitCode', {hitCode: data.data.hitCode});
                } else if (data.data.heatMap) {
                    $state.go('heatMap', {project: $scope.params.code, workerId: data.data.workerId});
                }
            }, function(err) {
                if ($scope.userType == 'mTurk') {

                    //if there is any other unexpected issue, use fallback code:
                    var fallback = "c0b72bcf-39ac-40f5-99c4-d4016f510237";
                    alert('Something unexpected occurred. Please use the following completion code to get compensated: ' + fallback);
                } else {
                    alert('Something unexpected occurred.');
                }
            });
        }
    };

    $scope.transformDataTLX = function(response, userType) {
            //fixed TLX questions
            // ULB stands for User Left Blank
            return ret_obj =  {
                'additional_feedback':  $scope.checkInput(response['additional_text']) || 'ULB',
                'mental':  $scope.checkInput(response['mental']),
                'physical':  $scope.checkInput(response['physical']),
                'temporal':  $scope.checkInput(response['temporal']),
                'performance':  $scope.checkInput(response['performance']),
                'effort':  $scope.checkInput(response['effort']),
                'frustration':  $scope.checkInput(response['frustration'])
            };
        };

        $scope.checkInput = function(input) {
            if(input != undefined) {  return input}
            else {return 'ULB'}
        }

}]);


module.controller('surveyGAMEontroller', ['$scope', '$http', '$state', '$location','$timeout','$compile',function($scope, $http, $state, $location,$timeout,$compile) {


    //Generate numbers for radio buttons for Likert (7 scales)
    $scope.getNumber = function(){
        var ratings = [];
        for (var i = 1; i <= 7; i ++){
            ratings.push(i)
        }
        return ratings;
    };

    $scope.req_answers = false;

    $scope.userType = $scope.params.userType;
    $scope.forms = {};

    if ($scope.userType == 'mTurk') {

        $scope.req_answers = true;
    }

    $scope.submit = function() {

        var data = $scope.transformDataGAME($scope.response, $scope.userType);

        if ($scope.userType == 'mTurk') {
            if (data.opinion == 'ULB') {
                return alert("Please fill out all the required fields!")
            }
        }



        if (data != -1) {
            $http.post('/api/project/' + $scope.params.code + '/survey', JSON.stringify(data)).then(function(data) {
                // console.log('data',data.data);
                //console.log(data.data.hitCode);
                if (data.data.hitCode) {
                    $state.go('hitCode', {hitCode: data.data.hitCode});
                } else if (data.data.heatMap) {
                    $state.go('heatMap', {project: $scope.params.code, workerId: data.data.workerId});
                }
            }, function(err) {
                if ($scope.userType == 'mTurk') {

                    //if there is any other unexpected issue, use fallback code:
                    var fallback = "c0b72bcf-39ac-40f5-99c4-d4016f510237";
                    alert('Something unexpected occurred. Please use the following completion code to get compensated: ' + fallback);
                } else {
                    alert('Something unexpected occurred.');
                }
            });
        }
    };

    $scope.transformDataGAME = function(response, userType) {
        //fixed TLX questions
        // ULB stands for User Left Blank
         var ret_obj =  {
            'opinion':  $scope.checkInput(response['opinion']) || 'ULB',
            'image_use':  $scope.checkInput(response['image_use']),
            'image_opinion':  $scope.checkInput(response['image_opinion']),
            'improve':  $scope.checkInput(response['improve']),
             'additional_feedback':  $scope.checkInput(response['additional_text']) || 'ULB'

         };
         //Add game questions game1 to game25
        for (var i = 1; i <= 25; i ++){
            var opt = "game" + i.toString();
            ret_obj[opt] = $scope.checkInput(response[opt]) || 'ULB'

        }

        return ret_obj;


    };

    $scope.checkInput = function(input) {
        if(input != undefined) {  return input}
        else {return 'ULB'}
    }

}]);
