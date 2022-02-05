var module = angular.module('consentApp', ['ui.router', 'ngAnimate', 'ngRoute', 'uiGmapgoogle-maps','ngCookies', 'ngMap', 'configApp'])

    // .config(['uiGmapGoogleMapApiProvider', function (GoogleMapApi, googleMapAPIKey) {
    //     GoogleMapApi.configure({
    //         key: 'AIzaSyAL32H2arSyCcBfcD49o1wG32pkHaNlOJE',
    //         // v: '3.20',
    //         libraries: 'weather,geometry,visualization'
    //     });
    // }]);



//change \n to br
module.filter("textBreaks", ['$sce', function ($sce) {
    return function (x) {
        if (x){
            // var new_text = x.replace(new RegExp('\\n', 'g'), '<br/>');
            var new_text = x.replace(/\\n/g, "<br/>");
            // new_text = x.replace(/n/g, "<br/>");
            //trim first and last quote:
            if (new_text.charAt(0) === "'") {
                new_text =  new_text.slice(1,-1);
            }


            return $sce.trustAsHtml(new_text);
        } else {
            return(x)
        }


    }
}]);


module.config(function($stateProvider, $urlRouterProvider, $cookiesProvider) {

    var n = new Date();
    $cookiesProvider.defaults.expires = new Date(n.getFullYear()+10, n.getMonth(), n.getDate());

    $stateProvider.state({
        name: 'consent',
        url: '/consent',
        templateUrl: 'templates/kiosk/consent.html',
        controller: 'consentController'
    });
    $stateProvider.state({
        name: 'instruction',
        url: '/instruction',
        templateUrl: 'templates/kiosk/instructions.html',
        params: {
            pCode: '',
            workerId:'',
            kioskId:'',
            assignmentId:'',
            hitId:'',
            submitTo:''
        },
        controller: 'instructionController'
    });

    $stateProvider.state({
        name: 'examples',
        url: '/examples/:pCode',
        views: {
            content: {
                templateUrl: 'templates/kiosk/example.html',
            }
        },
        params: {
            pCode: '',
            workerId:'',
            kioskId:'',
            assignmentId:'',
            hitId:'',
            submitTo:'',
            projectType: ''
        },
        controller: 'exampleController'
    });

    $stateProvider.state({
        name: 'about',
        url: '/about',
        views: {
            nav: {
                templateUrl: '../navbar.html'
            },
            content: {
                templateUrl: '../about.html',
            },
            footer: {
                templateUrl: '../footer.html'
            },
        },
        controller: 'AboutController'
    });

    $stateProvider.state({
        name: 'aboutProject',
        url: '/about/:pCode',
        views: {
            nav: {
                templateUrl: '../navbar.html'
            },
            content: {
                templateUrl: '../about.html',
            },
            footer: {
                templateUrl: '../footer.html'
            },
        },
        controller: 'AboutController'
    });

    $stateProvider.state({
        name: 'termsOfUse',
        url: '/termsOfUse',
        views: {
            nav: {
                templateUrl: '../navbar.html'
            },
            content: {
                templateUrl: '../termsOfUse.html',
            },
            footer: {
                templateUrl: '../footer.html'
            },
        },
        controller: 'TermsController'
    });

    $stateProvider.state({
        name: 'termsOfUseProject',
        url: '/termsOfUse/:pCode',
        views: {
            nav: {
                templateUrl: '../navbar.html'
            },
            content: {
                templateUrl: '../termsOfUse.html',
            },
            footer: {
                templateUrl: '../footer.html'
            },
        },
        controller: 'TermsController'
    });

    $stateProvider.state({
        name: 'mturk',
        url: '/mturk/:pCode',
        templateUrl: 'templates/kiosk/welcome.html',
        controller: 'mTurkController'
    });
    $stateProvider.state({
        name: 'kiosk',
        url: '/',
        views: {
            nav: {
                templateUrl: './navbar.html'
            },
            content: {
                templateUrl: 'templates/kiosk/appDefault.html',
            },
            footer: {
                templateUrl: '../footer.html'
            }
        },
        //templateUrl: 'templates/kiosk/appDefault.html',
        controller: 'kioskController'
    });

    $stateProvider.state({
        name: 'kioskProject',
        url: '/kioskStart/:pCode',
        views: {
            nav: {
                templateUrl: './navbar.html'
            },
            content: {
                templateUrl: 'templates/kiosk/appModular.html',
            },
            footer: {
                templateUrl: '../footer.html'
            }
        },
        //templateUrl: 'templates/kiosk/appDefault.html',
        controller: 'kioskProjectController'
    });

    $stateProvider.state({
        name: 'results',
        url: '/results',
        views: {
            nav: {
                templateUrl: './navbar.html'
            },
            content: {
                templateUrl: 'heatmap.html'
            },
            footer: {
                templateUrl: '../footer.html'
            }
        },
        controller: 'heatMapController'
    });

    $stateProvider.state({
        name: 'resultsProject',
        url: '/results/:pCode',
        views: {
            nav: {
                templateUrl: './navbar.html'
            },
            content: {
                templateUrl: 'gridMapProject.html'
            },
            footer: {
                templateUrl: '../footer.html'
            }
        },
        controller: 'heatMapProjectController'
    });

    $stateProvider.state({
        name: 'resultsLandLossProject',
        url: '/resultsHG',
        params: {
            landloss: true
        },
        views: {
            nav: {
                templateUrl: './navbar.html'
            },
            content: {
                templateUrl: 'landlossResultsProject.html'
            },
            footer: {
                templateUrl: '../footer.html'
            }
        },
        controller: 'landlossResultsController'
    });


    $stateProvider.state({
        name: 'hgProject',
        url: '/hg_landloss',
        params: {
            landloss: true
        },
        views: {
            nav: {
                templateUrl: './navbar.html'
            },
            content: {
                templateUrl: 'templates/kiosk/appLandLoss.html',
            },
            footer: {
                templateUrl: '../footer.html'
            }
        },
        //templateUrl: 'templates/kiosk/appDefault.html',
        controller: 'landlossController'
    });

    $stateProvider.state({
        name: 'hubProject',
        url: '/hubPage/:hub_code',
        params: {
            hub_project: true
        },
        views: {
            nav: {
                templateUrl: './navbar.html'
            },
            content: {
                templateUrl: 'templates/kiosk/appHubProject.html',
            },
            footer: {
                templateUrl: '../footer.html'
            }
        },
        controller: 'hubProjectController'
    });


    $stateProvider.state({
        name: 'resultsHubProject',
        url: '/resultsHub/:hub_code',
        params: {
            hub_project: true
        },
        views: {
            nav: {
                templateUrl: './navbar.html'
            },
            content: {
                templateUrl: 'hubResults.html'
            },
            footer: {
                templateUrl: '../footer.html'
            }
        },
        controller: 'resultsHubController'
    });




    $urlRouterProvider.otherwise('/');
});

module.controller('heatMapController', function($scope, $http, $window,heatMapProject1, heatMapProject2){

    $scope.successProject1 = false;
    $scope.successProject2 = false;
    $window.document.title ="Results";

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

    // var ans_colors =  {
    //
    //     'Green':'green',
    //     'Blue': 'blue',
    //     'Brown': 'orange',
    //     'Yes' : 'green',
    //     'No' : 'red',
    //     'Maybe': 'yellow'
    // };

    var ans_colors =  {

        '1':'green',
        '2': 'yellow',
        '3': 'orange',
        '4' : 'red',
        '5': 'blue',
        '6' : 'purple',
        'all': 'all'
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



    // Exit button to front page:
    $scope.exit = exit;
    function exit(){
        $window.location.href='/algalBloom.html';
    }


    //Function for Heatmap
    function HeatLayer(heatLayer,rdata,pointArray,answer) {


        //Create lat lng from array of objects
        var geodata = [];


        //Filter the data
        //Initial project 1: Only Green votes
        //Initial project 2: Only Yes votes
        //Initial colors: Green


        //Filter data based on answer clicked
        var answer_results = filterResponses(
            // rdata, {answer: "\"" + answer + "\""});
            rdata, {color: parseInt(answer)});


        // Transform the data for the heatmap:
        answer_results.forEach(function (item) {
            geodata.push(new google.maps.LatLng(parseFloat(item.x), parseFloat(item.y)));
        });

        //console.log(answer_results.length);


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



    //First project code:
    $scope.projectCode1 = heatMapProject1;

    //Second project code;
    $scope.projectCode2 = heatMapProject2;


    $scope.update_heatmap = function (answer,mapno){

        var geodata = [];

        //Mapping of answers to colors:

        if (mapno =='map1') {


            if (answer != 'all') {

                //Filter data based on answer clicked
                var answer_results = filterResponses(
                    //$scope.results1, {answer: "\"" + answer + "\""});
                    $scope.results1, {color: parseInt(answer)});


            } else {
                var answer_results = $scope.results1;
            }

            //console.log(answer_results.length);

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




        } else {


            if (answer != 'all') {

                //Filter data based on answer clicked
                var answer_results = filterResponses(
                    //$scope.results2, {answer: "\"" + answer + "\""});
                    $scope.results2, {color: parseInt(answer)});


            } else {
                var answer_results = $scope.results2;
            }

            // Transform the data for the heatmap:
            answer_results.forEach(function (item) {
                geodata.push(new google.maps.LatLng(parseFloat(item.x), parseFloat(item.y)));
            });


            //console.log(answer_results.length);

            //set the data for the heatmap
            $scope.pointArr2 = new google.maps.MVCArray(geodata);
            $scope.htlayer2.setData($scope.pointArr2);

            //Change the gradient:

            //Get the gradients based on the color
            var gradient = generate_gradient(gradients[ans_colors[answer]]);
            // //Set the gradient
            $scope.htlayer2.set('gradient', gradient);



        }

    };

    //Function filterResponses: filter results based on some criteria
    function filterResponses(array, criteria) {
        return array.filter(function (obj) {
            return Object.keys(criteria).every(function (c) {
                return obj[c] == criteria[c];
            });})
    };

    //Get the results of the first project:
    $http.get('/api/results/' + $scope.projectCode1).then(function(data){

        // console.log("Results from first project", data.data);
        $scope.results1 = data.data;
        //console.log($scope.results1);


        //number of images:
        $scope.unique_images1 = count_unique($scope.results1, 'task_id');
        //Number of workers:
        $scope.unique_workers1 = count_unique($scope.results1, 'workerid');


        // Answer of first project
        $scope.q1 = $scope.results1[0].question;
        //Unquote
        $scope.question1 = $scope.q1.replace(/\"/g, "");
        //Buttons for the heatmap
        $scope.options1 = [{'name':'Green','color': '#9cdc1f','ncolor': 1},
            {'name':'Blue','color': '#0072BC','ncolor': 5},
            {'name':'Brown','color': '#f7941d','ncolor': 3}];


        //generate first map
        $scope.map1 = {
            center: {
                latitude: parseFloat($scope.results1[0].x),
                longitude: parseFloat($scope.results1[0].y)
            },
            zoom: 7,
            streetViewControl: false,
            heatLayerCallback: function (layer) {
                //set the heat layer from the data
                $scope.pointArr1 = [];
                $scope.htlayer1 = layer;
                var htl1 = new HeatLayer($scope.htlayer1,$scope.results1,$scope.pointArr1,1);
            },
            showHeat: true
        };
        $scope.successProject1 = true;
        //generate second heatmap
        $http.get('/api/results/' + $scope.projectCode2).then(function(data){

            //console.log("Results from second project", data.data);
            $scope.results2 = data.data;
            //console.log($scope.results2);

            //number of images:
            $scope.unique_images2 = count_unique($scope.results2, 'task_id');
            //Number of workers:
            $scope.unique_workers2 = count_unique($scope.results2, 'workerid');


            //Second Question
            $scope.q2 = $scope.results2[0].question;
            // Unquote question
            $scope.question2 = $scope.q2.replace(/\"/g, "");

            //Buttons for project 2:
            $scope.options2 = [{'name':'Yes','color': '#9cdc1f','ncolor': 1},
                {'name':'No','color': '#DC1F3A','ncolor': 4},
                {'name':'Maybe','color': '#FFF200','ncolor': 2}];

            //generate first map
            $scope.map2 = {
                center: {
                    latitude: parseFloat($scope.results2[0].x),
                    longitude: parseFloat($scope.results2[0].y)
                },
                zoom: 7,
                streetViewControl: false,
                heatLayerCallback: function (layer) {
                    //set the heat layer from the data
                    $scope.pointArr2 = [];
                    $scope.htlayer2 = layer;
                    var htl2= new HeatLayer($scope.htlayer2,$scope.results2,$scope.pointArr2,1);
                },
                showHeat: true
            };

            $scope.successProject2 = true;
        }).catch(function(error){
            //Error with second http get
            console.log(error);
        });


    }).catch(function(error){

        //Error with first http get
        console.log(error);
    });
});

module.controller('heatMapProjectController', function($scope, $http, $window,$stateParams, $sce){

    $scope.successProject1 = false;
    $window.document.title ="Results";
    $scope.project = $stateParams.pCode;
    $scope.showMarkers = false;
    $scope.showPoiName = false;
    $scope.isMarkerTask = false;

    $scope.getExternalFrame = function(link){
        return  $sce.trustAsResourceUrl(link)
    }

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

    $scope.hex_array = ['#9cdc1f',
        '#FFF200',
        '#F7941D',
        '#ff0000',
        '#0072BC',
        '#8a2be2'
    ];


    var ans_colors =  {

        '1':'green',
        '2': 'yellow',
        '3': 'orange',
        '4' : 'red',
        '5': 'blue',
        '6' : 'purple',
        'all': 'all'
    };

    $scope.point_array =  ['/images/markers/marker_green2.svg',
        '/images/markers/marker_yellow2.svg',
        '/images/markers/marker_orange2.svg',
        '/images/markers/marker_red2.svg',
        '/images/markers/marker_blue2.svg',
        '/images/markers/marker_purple2.svg',
        '/images/markers/marker_grey.svg'];


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


    //CSV Download Project
    $scope.downloadCSV = downloadCSV;
    function downloadCSV(){
        //Download the results
        location.href='/api/results/csv/' + $stateParams.pCode;
    }

    // Exit button to front page:
    $scope.exit = exit;
    function exit(){
        // $window.location.href='/algalBloom.html';
        $window.location.href='kioskProject.html#/kioskStart/' + $stateParams.pCode;
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

        //console.log(answer_results.length);

        //set the data for the heatmap
        pointArray = new google.maps.MVCArray(geodata);
        heatLayer.setData(pointArray);
        //Set the gradient:
        var gradient = generate_gradient(gradients[ans_colors[answer]]);
        heatLayer.set('gradient', gradient);
        heatLayer.set('opacity',1);
        heatLayer.set('radius',20);

    };



    $scope.update_heatmap = function (answer,mapno){

        var geodata = [];

        //Mapping of answers to colors:

            if (answer != 'all') {

                //Filter data based on answer clicked
                var answer_results = filterResponses(
                    //$scope.results1, {answer: "\"" + answer + "\""});
                    $scope.results1, {color: parseInt(answer)});

            } else {
                var answer_results = $scope.results1;
            }

            //console.log(answer_results.length);

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

            $scope.pointMarkers = $scope.totalMarkers;

        } else {
            //get the markers
            $scope.pointMarkers = [];

            var target_icon = $scope.point_array[answer-1];
            $scope.totalMarkers.forEach(function(item){

                if (item.icon === target_icon) {
                    $scope.pointMarkers.push(item)
                }
            })
        }
    };

    //Function filterResponses: filter results based on some criteria
    function filterResponses(array, criteria) {
        return array.filter(function (obj) {
            return Object.keys(criteria).every(function (c) {
                return obj[c] == criteria[c];
            });})
    };


    $http.get('/api/tasks/getInfoFree/' + $stateParams.pCode).then(function(pdata) {

        $scope.proj_data = pdata.data[0];

        if ($scope.proj_data["point_selection"] ==1 && $scope.proj_data["points_file"] != null){
            $scope.isMarkerTask = true;
        }


        //Buttons for the heatmap
        //Get options from the template
        var templ = JSON.parse($scope.proj_data.template);
        var templ_opts = templ.options;
        $scope.projType = templ.selectedTaskType;
        // Answer of first project
        $scope.q1 = templ.question;
        //Unquote
        $scope.question1 = $scope.q1.replace(/\"/g, "");


        //build options and legendobject
        var opt = [];
        $scope.legendObject = [];
        templ_opts.forEach(function (item){
            //Make the option buttons
            var opt_item = {'name': item.text, 'ncolor': item.color, 'color': $scope.hex_array[item.color -1] };
            opt.push(opt_item);

            $scope.legendObject.push({
                key: item.text,
                image: $scope.point_array[item.color -1]
            })
        });



        $scope.options1 = opt;

        $scope.project_poi_name = $scope.proj_data.poi_name;
        if ($scope.project_poi_name){
            $scope.showPoiName = true;
        };


        if ($scope.projType == "tagging" || $scope.projType == "ngs" ||
            ($scope.proj_data["point_selection"] ==0 && $scope.projType == "mapping") ) {
             $http.get('/api/results/all/majority/' + $stateParams.pCode).then(function(data){

            //$http.get('/api/results/csv_heatmap/' + $stateParams.pCode).then(function(data){


                // console.log(data.data)

                // console.log("Results from first project", data.data);
                $scope.results1 = data.data;
                //number of images:
                $scope.unique_images1 = count_unique($scope.results1, 'task_id');
                //Number of workers:
                $scope.unique_workers1 = count_unique($scope.results1, 'workerid');

                //generate first map
                $scope.map1 = {
                    center: {
                        latitude: parseFloat($scope.results1[0].x),
                        longitude: parseFloat($scope.results1[0].y)
                    },
                    streetViewControl: false,
                    zoom: 7,
                    heatLayerCallback: function (layer) {
                        //set the heat layer from the data
                        $scope.pointArr1 = [];
                        $scope.htlayer1 = layer;
                        var htl1 = new HeatLayer($scope.htlayer1,$scope.results1,$scope.pointArr1,1);
                    },
                    showHeat: true
                };
                $scope.successProject1 = true;

            }).catch(function(error){

                //Error with first http get
                console.log(error);
            });
        } else {

            //Markers task
            if($scope.projType == "mapping" && $scope.proj_data["point_selection"] ==1 && $scope.proj_data["points_file"] != null) {
                // Answer of first project
                $scope.q1 = templ.question;
                //Unquote
                $scope.question1 = $scope.q1.replace(/\"/g, "");
                $http.get('/api/results/allMarkers/' + $stateParams.pCode).then(function(data){

                    // console.log("Results from first project", data.data);
                    $scope.results1 = data.data;
                    //number of Pois:
                    $scope.pois = get_unique($scope.results1, 'key_item');
                    // //Number of workers:
                    // $scope.unique_workers1 = count_unique($scope.results1, 'workerid');

                    //pick a random point as inital map center
                    var init_point = Math.floor(Math.random() * $scope.results1.length);
                    //process data for markers:

                    $scope.pointMarkers = [];
                    var pointId = 0;
                    for (var i = 0; i < $scope.pois.length; i++) {

                        //for each Unique marker, get all the votes
                        var poi_item =  $scope.pois[i];
                        var marker_votes = filterResponses(
                            $scope.results1, {key_item: poi_item});

                        //get location
                        var point_pos = {lat: parseFloat(marker_votes[0].center_lat) , lng: parseFloat(marker_votes[0].center_lon)};

                        //find vote with majority
                        var max_cnt = 0;
                        var max_response = 0;
                        marker_votes.forEach(function (item){
                            if (item.cnt > max_cnt) {
                                max_cnt = item.cnt;
                                max_response = item.response;
                            }
                        });
                        if (max_response > 0 && max_cnt >0) {
                            var point_marker = {
                                latitude: parseFloat(marker_votes[0].center_lat) ,
                                longitude: parseFloat(marker_votes[0].center_lon) ,
                                title: max_response, //TODO: CHANGE THIS TO POI NAME!
                                id: pointId,
                                icon: $scope.point_array[max_response-1]
                            };

                            point_marker.templateUrl = 'infowindowMarkers_template.html';
                            point_marker.templateParameter = {
                                id:   pointId,
                                title: {freq: max_cnt, res:max_response} //Show the max number of votes for this type
                            };
                            $scope.pointMarkers.push(point_marker);
                            pointId += 1;
                        }

                    }//end of markers loop

                    $scope.showMarkers = true;
                    $scope.totalMarkers = $scope.pointMarkers;


                    // //add markers on the map:
                    // $scope.pointMarkers.forEach(function (item) {
                    //     item.setMap(point_map);
                    // });

                    //generate first map
                    $scope.map1 = {
                        center: {
                            latitude: parseFloat($scope.results1[init_point].center_lat),
                            longitude: parseFloat($scope.results1[init_point].center_lon)
                        },
                        streetViewControl: false,
                        zoom: 7,
                        markers: $scope.pointMarkers,
                        markersEvents: {
                            click: function (marker, eventName, model) {
                                $scope.map1.window.model = model;
                                $scope.map1.window.show = true;
                            }
                        },
                        window: {
                            marker: {},
                            show: false,
                            closeClick: function () {
                                this.show = false;
                            },
                            options: {}
                        }
                    };
                    $scope.successProject1 = true;

                }).catch(function(error){

                    //Error with first http get
                    console.log(error);
                });
            }

        }

    });

});


module.controller('gridMapProjectController',
    function($scope, $http, $window,$stateParams,$timeout,$location,$sce,NgMap) {



    //change this if we want gridMap instead of heatMap
    $scope.gridMap = false;

    $scope.successProject1 = false;
    $window.document.title ="Results";
    $scope.project = $stateParams.pCode;
    $scope.showMarkers = false;
    $scope.showPoiName = false;
    $scope.isMarkerTask = false;
    $scope.rectArr=[]; //holds the grid array
    $scope.geodata = [];

    //read source from url, if from tileoscope games, then show user contributions as well as dots!

    var url_params = $location.search();
    $scope.fromTileARUser = 0;

    if (url_params.hasOwnProperty('source') && url_params.hasOwnProperty('user_code')  ){
        $scope.game_source = url_params.source;
        $scope.fromTileARUser = url_params.user_code;
    }

        $scope.getExternalFrame = function(link){
            return  $sce.trustAsResourceUrl(link)
        }



    //function that adds user points here:
    $scope.plot_tileoscope_user_points = function (map,callback){

        console.log("Getting user points")

        //get the points from the backend:
        var post_body = {
            project_code: $stateParams.pCode,
            user_code : $scope.fromTileARUser
        }
        $http.post('/api/tileoscope/getTileoscopeUserVotes',post_body).then(function(uvotes) {

            var user_votes = uvotes.data;

            //add markers to map:

            $scope.userMarkers = [];
            var pointId = 0;
            for (var i = 0; i < user_votes.length; i++) {

                    var vote_item = user_votes[i];
                    var plat = parseFloat(vote_item.x);
                    var plng = parseFloat(vote_item.y);
                    var point_marker = new google.maps.Marker({
                        position: new google.maps.LatLng(plat,plng),
                        title: "Image name: " + vote_item.task_id,
                        id: pointId,
                        icon: $scope.point_array[parseInt(vote_item.color)-1]
                    });
                    $scope.userMarkers.push(point_marker);
                    point_marker.setMap(map);
                    pointId += 1;


            }//end of markers loop
            callback(user_votes);
        })

    };




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

    $scope.hex_array = ['#9cdc1f',
        '#FFF200',
        '#F7941D',
        '#ff0000',
        '#0072BC',
        '#8a2be2'
    ];


    var ans_colors =  {

        '1':'green',
        '2': 'yellow',
        '3': 'orange',
        '4' : 'red',
        '5': 'blue',
        '6' : 'purple',
        'all': 'all'
    };

    $scope.point_array =  ['/images/markers/marker_green2.svg',
        '/images/markers/marker_yellow2.svg',
        '/images/markers/marker_orange2.svg',
        '/images/markers/marker_red2.svg',
        '/images/markers/marker_blue2.svg',
        '/images/markers/marker_purple2.svg',
        '/images/markers/marker_grey.svg'];


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

    //Function generate_gradient: gradient array based on rgb array
        // Different opacity
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



    //CSV Download Project
    $scope.downloadCSV = downloadCSV;
    function downloadCSV(){
        //Download the results
        location.href='/api/results/csv/' + $stateParams.pCode;
    }

    // Exit button to front page:
    $scope.exit = exit;
    function exit(){
        // $window.location.href='/algalBloom.html';
        $window.location.href='kioskProject.html#/kioskStart/' + $stateParams.pCode;
    }

    $scope.toggleGridMap = toggleGridMap;
    function toggleGridMap(){
            $scope.gridMap = !$scope.gridMap;
    }

    $scope.recenterMap = recenterMap;
        function recenterMap(){
            NgMap.getMap().then(function(map) {

                map.setZoom(7);
                var old_Center = new google.maps.LatLng($scope.results1[0].x,$scope.results1[0].y);
                map.setCenter(old_Center)
            })
        }

    $scope.InitMap = InitMap;
    function InitMap (zoom){

        //generate first map
        $scope.map1 = {
            center: {
                latitude: parseFloat($scope.results1[0].x),
                longitude: parseFloat($scope.results1[0].y)
            },
            streetViewControl: false,
            zoom: zoom,
            bounds: {}
        };
        NgMap.getMap().then(function(map) {

            if($scope.fromTileARUser){

                $scope.plot_tileoscope_user_points(map,function(res){
                    if ($scope.gridMap){
                        $scope.drawGrid()
                    } else {
                        $scope.update_heatmap(1);
                    }
                })

            }else {
                if ($scope.gridMap){
                    $scope.drawGrid()
                } else {
                    $scope.update_heatmap(1);
                }
            }



        })
    }

    //function that draws the initial grid
    $scope.drawGrid = drawGrid;
    function drawGrid () {

        NgMap.getMap().then(function(map) {


            $scope.rectArr = []
            $scope.showGrid = false;
            var NE = map.getBounds().getNorthEast();
            var SW = map.getBounds().getSouthWest();
            var aNorth  =   map.getBounds().getNorthEast().lat();
            var aEast   =   map.getBounds().getNorthEast().lng();
            var aSouth  =   map.getBounds().getSouthWest().lat();
            var aWest   =   map.getBounds().getSouthWest().lng();


            var width = 5.0;
            var height = 5.0;
            var l_dist = SW.lng() - NE.lng();
            var b_dist = SW.lat() - NE.lat();
            var lat_icrement = b_dist / width;
            var lng_increment =l_dist / height;

            var cnt = 0;
            for (var i = 0; i < height; i++) {
                for (var j = 0; j < width; j++) {
                    var rSW = new google.maps.LatLng(NE.lat() + (lat_icrement * i), NE.lng() + (lng_increment * j));
                    var rNE = new google.maps.LatLng(NE.lat() + (lat_icrement * (i + 1)), NE.lng() + (lng_increment * (j + 1)));
                    var rBounds = new google.maps.LatLngBounds(rSW,rNE);
                    var rNW =  new google.maps.LatLng(rNE.lat(), rSW.lng());
                    var rSE = new google.maps.LatLng(rSW.lat(), rNE.lng());

                    var rectangle = {
                        ne:{lat:rNE.lat(),lng:rNE.lng()},
                        nw:{lat:rNW.lat(),lng:rNW.lng()},
                        sw:{lat:rSW.lat(),lng:rSW.lng()},
                        se:{lat:rSE.lat(),lng:rSE.lng()},
                        strokeColor: '#000000',
                        strokeOpacity: 0,
                        strokeWeight: 0,
                        fillColor: '#FFFFFF',
                        fillOpacity: 0.1,
                        id: cnt
                    };
                    cnt+=1;
                    //store all rects here
                    $scope.rectArr.push(rectangle);

                }
            }
            $scope.showGrid= true;
            setGridColors(); //do this now
        })

    }

    function checkIfWithinBounds(rec,point){
        var polyCoords = [];
        polyCoords.push(rec.ne);
        polyCoords.push(rec.nw);
        polyCoords.push(rec.sw);
        polyCoords.push(rec.se);
        var polygon = new google.maps.Polygon({paths: polyCoords});
        var isIn = google.maps.geometry.poly.containsLocation(point,polygon);
        return isIn;
    }

    //function to determine color of grid
    function setGridColors(){

        NgMap.getMap().then(function(map) {

            for (var j = 0; j < $scope.rectArr.length; j++) {
                var rect = $scope.rectArr[j];
                var possible_colors = $scope.hex_array.length;
                var major_counter = new Array(possible_colors+1).join('0').split('').map(parseFloat);
                var hasOne = false;
                $scope.results1.forEach(function (item){

                    var mk = new google.maps.LatLng(parseFloat(item.x), parseFloat(item.y)); //get position of image
                    //check if it contains:
                    if (checkIfWithinBounds(rect,mk)){
                        var col = parseInt(item.color);
                        major_counter[col-1]+=1;
                        hasOne = true;
                    }
                });
                //we have all counts, must find max now:
                if (hasOne){
                    var max_color = -1;
                    var max_cnt = -1;
                    for (var i = 0; i < major_counter.length; i++) {
                        if (major_counter[i] > max_cnt){
                            max_color = i;
                            max_cnt = major_counter[i];
                        }
                    }
                    rect.fillColor = $scope.hex_array[max_color];
                    rect.fillOpacity = 0.35;
                    $scope.rectArr[j] = rect;
                }
            }


        })
    }

    $scope.update_heatmap = function (answer){

        NgMap.getMap().then(function(map) {

                heatmap = map.heatmapLayers.heatID;

                var geodata = [];
                //Mapping of answers to colors:
                if (answer != 'all') {

                    //Filter data based on answer clicked
                    var answer_results = filterResponses(
                        //$scope.results1, {answer: "\"" + answer + "\""});
                        $scope.results1, {color: parseInt(answer)});

                } else {
                    var answer_results = $scope.results1;
                }

                //console.log(answer_results.length);

                // Transform the data for the heatmap:
                answer_results.forEach(function (item) {
                    geodata.push(new google.maps.LatLng(parseFloat(item.x), parseFloat(item.y)));
                });


                //set the data for the heatmap
                $scope.pointArr1 = new google.maps.MVCArray(geodata);
                heatmap.setData($scope.pointArr1 );

                //change the gradient
                var gradient = generate_gradient(gradients[ans_colors[answer]]);
                heatmap.set('gradient',gradient);
            });
    };



    $scope.update_Markers = function (answer){

        NgMap.getMap().then(function(map) {

            $scope.pointMarkers.forEach(function (item) {
                if (answer === "reset") {
                    item.setMap(map)
                } else {
                    if (item.icon == $scope.point_array[answer-1]){
                        item.setMap(map)
                    } else {
                        item.setMap(null)
                    }
                }
            });
        })
    };

    //Function filterResponses: filter results based on some criteria
    function filterResponses(array, criteria) {
        return array.filter(function (obj) {
            return Object.keys(criteria).every(function (c) {
                return obj[c] == criteria[c];
            });})
    };


    $http.get('/api/tasks/getInfoFree/' + $stateParams.pCode).then(function(pdata) {

        $scope.proj_data = pdata.data[0];


        //Buttons for the heatmap
        //Get options from the template
        var templ = JSON.parse($scope.proj_data.template);
        var templ_opts = templ.options;
        $scope.projType = templ.selectedTaskType;
        // Answer of first project
        $scope.q1 = templ.question;
        //Unquote
        $scope.question1 = $scope.q1.replace(/\"/g, "");

        if ( ($scope.proj_data["point_selection"] ==1 && $scope.proj_data["points_file"] != null) || $scope.projType == "ngs" ){
            $scope.isMarkerTask = true;
        }


        //build options and legendobject
        var opt = [];
        $scope.legendObject = [];
        templ_opts.forEach(function (item){
            //Make the option buttons
            var opt_item = {'name': item.text, 'ncolor': item.color, 'color': $scope.hex_array[item.color -1] };
            opt.push(opt_item);

            $scope.legendObject.push({
                key: item.text,
                image: $scope.point_array[item.color -1]
            })
        });

        $scope.options1 = opt;

        $scope.project_poi_name = $scope.proj_data.poi_name;
        if ($scope.project_poi_name){
            $scope.showPoiName = true;
        };





        if ( $scope.projType == "tagging" ||
             ($scope.proj_data["point_selection"] ==0 && $scope.projType == "mapping") ) {

            //$http.get('/api/results/all/majority/' + $stateParams.pCode).then(function(data){
            $http.get('/api/results/csv_heatmap/' + $stateParams.pCode).then(function(data){


                $scope.results1 = data.data;
                //number of images:
                $scope.unique_images1 = count_unique($scope.results1, 'task_id');
                //Number of workers:
                $scope.unique_workers1 = count_unique($scope.results1, 'workerid');

                $scope.InitMap(7); //init map with initial zoom 7
                $scope.successProject1 = true;



            }).catch(function(error){

                //Error with first http get
                console.log(error);
            });
        } else {

            //Markers task
            if($scope.projType == "mapping" && $scope.proj_data["point_selection"] ==1 && $scope.proj_data["points_file"] != null) {
                // Answer of first project
                $scope.q1 = templ.question;
                //Unquote
                $scope.question1 = $scope.q1.replace(/\"/g, "");
                $http.get('/api/results/allMarkers/' + $stateParams.pCode).then(function(data){

                    // console.log("Results from first project", data.data);
                    $scope.results1 = data.data;
                    //number of Pois:
                    $scope.pois = get_unique($scope.results1, 'key_item');
                    //pick a random point as inital map center
                    var init_point = Math.floor(Math.random() * $scope.results1.length);
                    //generate first map
                    $scope.map1 = {
                        center: {
                            latitude: parseFloat($scope.results1[init_point].center_lat),
                            longitude: parseFloat($scope.results1[init_point].center_lon)
                        },
                        streetViewControl: false,
                        zoom: 7
                    };
                    $scope.successProject1 = true;

                    //CREATE MARKERS once map is ready:

                    NgMap.getMap().then(function(map) {

                        //process data for markers:
                        $scope.pointMarkers = [];
                        var pointId = 0;
                        for (var i = 0; i < $scope.pois.length; i++) {

                            //for each Unique marker, get all the votes
                            var poi_item =  $scope.pois[i];
                            var marker_votes = filterResponses(
                                $scope.results1, {key_item: poi_item});

                            //get location
                            var point_pos = {lat: parseFloat(marker_votes[0].center_lat) , lng: parseFloat(marker_votes[0].center_lon)};

                            //find vote with majority
                            var max_cnt = 0;
                            var max_response = 0;
                            marker_votes.forEach(function (item){
                                if (item.cnt > max_cnt) {
                                    max_cnt = item.cnt;
                                    max_response = item.response;
                                }
                            });
                            if (max_response > 0 && max_cnt >0) {

                                var plat = parseFloat(marker_votes[0].center_lat);
                                var plng = parseFloat(marker_votes[0].center_lon);
                                var point_marker = new google.maps.Marker({
                                    position: new google.maps.LatLng(plat,plng),
                                    title: "Majority votes: " + max_cnt.toString(), //TODO: CHANGE THIS TO POI NAME!
                                    id: pointId,
                                    icon: $scope.point_array[max_response-1]
                                });
                                $scope.pointMarkers.push(point_marker);
                                point_marker.setMap(map);
                                pointId += 1;
                            }

                        }//end of markers loop
                        $scope.showMarkers = true;
                        $scope.totalMarkers = $scope.pointMarkers;
                    })
                }).catch(function(error){

                    //Error with first http get
                    console.log(error);
                });
            }

            //NGS MARKER TASK
            if ($scope.projType == "ngs") {

                $scope.q1 = templ.question;
                //Unquote
                $scope.question1 = $scope.q1.replace(/\"/g, "");
                $http.get('/api/results/all/majority/' + $stateParams.pCode).then(function(data){

                    // console.log("Results from first project", data.data);
                    $scope.results1 = data.data;
                    //number of Pois:
                    //pick a random point as inital map center
                    var init_point = Math.floor(Math.random() * $scope.results1.length);
                    //generate first map
                    $scope.map1 = {
                        center: {
                            latitude: parseFloat($scope.results1[init_point].x),
                            longitude: parseFloat($scope.results1[init_point].y)
                        },
                        streetViewControl: false,
                        zoom: 7
                    };
                    $scope.successProject1 = true;

                    //CREATE MARKERS once map is ready:

                    NgMap.getMap().then(function(map) {

                        //process data for markers:
                        $scope.pointMarkers = [];
                        var pointId = 0;
                        for (var i = 0; i < $scope.results1.length; i++) {

                            //for each Unique marker, get all the votes
                            var poi_item =  $scope.results1[i];


                            //majority and num votes
                            var max_cnt = poi_item.num_votes;
                            var max_response = parseInt(poi_item.color);

                            if (max_cnt > 0) {


                                var plat = parseFloat(poi_item.x);
                                var plng = parseFloat(poi_item.y);
                                var point_marker = new google.maps.Marker({
                                    position: new google.maps.LatLng(plat,plng),
                                    title: "Majority votes: " + max_cnt.toString(), //Change this to poi name?
                                    id: pointId,
                                    icon: $scope.point_array[max_response-1]
                                });
                                $scope.pointMarkers.push(point_marker);
                                point_marker.setMap(map);
                                pointId += 1;
                            }

                        }//end of markers loop
                        $scope.showMarkers = true;
                        $scope.totalMarkers = $scope.pointMarkers;
                    })
                }).catch(function(error){

                    //Error with first http get
                    console.log(error);
                });

            }

        }
    });
});


module.controller('landlossResultsController',
    function($scope, $http, $window,$stateParams,$timeout,$location,$sce,NgMap) {



        //change this if we want gridMap instead of heatMap
        $scope.gridMap = false;
        let isCairnsProject = 'pCode' in $stateParams && ["mKSRWYI4E59f", "Z2cg3ppyCsZW", "vOihRaFY2lSS", "ENtBwQQtcK3L", "DQ0RAb6nVgXr", "D1Y4k21Xb9NL"].includes($stateParams.pCode);

        $scope.successProject = false;
        $scope.showMap = false;

        $window.document.title ="Results";

        $scope.external_signup = "https://secure.everyaction.com/c5MDPHxLyUmAb4-c_xjrvg2";


        $scope.getExternalFrame = function(link){
            return  $sce.trustAsResourceUrl(link)
        };


        $scope.point_array =  ['/images/markers/marker_green2.svg',
            '/images/markers/marker_yellow2.svg',
            '/images/markers/marker_orange2.svg',
            '/images/markers/marker_red2.svg',
            '/images/markers/marker_blue2.svg',
            '/images/markers/marker_purple2.svg',
            '/images/markers/marker_grey.svg'];

        $scope.hex_array = ['#9cdc1f',
            '#FFF200',
            '#F7941D',
            '#ff0000',
            '#0072BC',
            '#8a2be2'
        ];

        $scope.icon_array =  ['/images/dots/cs_green_dot.svg',
            '/images/dots/cs_yellow_dot.svg',
            '/images/dots/cs_orange_dot.svg',
            '/images/dots/cs_red_dot.svg',
            '/images/dots/cs_blue_dot.svg',
            '/images/dots/cs_purple_dot.svg'];



        //CSV Download Project
        $scope.downloadCSVLandLoss = function(){
            //Download the results
            location.href = isCairnsProject 
                            ? '/api/results/cairns_raw_data/csv/'
                            : '/api/results/hg_raw_data/csv/';
        };



        $scope.InitMap = InitMapLandLoss;
        function InitMapLandLoss (zoom){

            $scope.update_landloss_Markers($scope.landloss_positives[0],0)

            //generate map
            $scope.map1 = {
                center: {
                    latitude: parseFloat(29.905498110016907),
                    longitude: parseFloat(-90.26941133000318)
                },
                streetViewControl: false,
                zoom: zoom,
                markers: $scope.landlossMarkers,
                markersEvents: {
                    click: function (marker, eventName, model) {
                        $scope.map1.window.model = model;
                        $scope.map1.window.show = true;
                    }
                },
                window: {
                    marker: {},
                    show: false,
                    closeClick: function () {
                        this.show = false;
                    },
                    options: {}
                }
            };
            $scope.successProject = true;

        };


        $scope.update_landloss_Markers = function (pattern,color_index){

            $scope.landlossMarkers = [];
            //for every item in the original data, if majority matches picked pattern then add to map:
            var pointId = 0;

            //change button colors here
            $scope.landloss_positives_buttons[$scope.active_pattern].active = false;
            $scope.active_pattern = color_index;
            $scope.landloss_positives_buttons[$scope.active_pattern].active = true;


            var map_patterns_projects = {
                "Sea Level Rise": "Land Loss Lookout: Identifying Sea Level Rise",
                "Farming": "Land Loss Lookout: Identifying Farming",
                "Oil and Gas": "Land Loss Lookout: Identifying Oil & Gas",
                "Restoration": "Land Loss Lookout: Identifying Restoration",
                "Shipping": "Land Loss Lookout: Identifying Shipping",
                "Shoreline Erosion": "Land Loss Lookout: Shoreline Erosion"
            };

            var project_key = map_patterns_projects[pattern];
                Object.keys($scope.raw_data).forEach(function (key) {

                    var item = $scope.raw_data[key][project_key];


                    var point_marker = new google.maps.Marker({
                        latitude: parseFloat(item.lat) ,
                        longitude: parseFloat(item.lon) ,
                        title: item.image_url,
                        id: pointId,
                        icon: $scope.icon_array[color_index]
                    });


                    var image_path = 'api/tasks/getImageFree/' + item.dataset_id + '/' + key  + '.jpg';

                    point_marker.templateUrl = 'infowindow_templateLandloss.html';
                    point_marker.templateParameter = {
                        id:   pointId,
                        image: image_path,
                        image_url: item.image_url,
                        pattern: pattern,
                        majority_percentage: Math.round(100*item.majority_count/item.total) + "%"
                    };

                    if (item.majority === pattern){
                        $scope.landlossMarkers.push(point_marker);
                    }
                    pointId = pointId + 1;
                });

        };
        //Options we want to focus on:
        $scope.landloss_positives_buttons = [
            {"pattern":"Sea Level Rise",
                "color": $scope.hex_array[0],
                "active": true
            },
            {"pattern":"Farming",
                "color": $scope.hex_array[1],
                "active": false
            },
            {"pattern":"Oil and Gas",
                "color": $scope.hex_array[2],
                "active": false
            },
            {"pattern":"Restoration",
                "color": $scope.hex_array[3],
                "active": false
            },
            {"pattern":"Shipping",
                "color": $scope.hex_array[4],
                "active": false
            },
            {"pattern":"Shoreline Erosion",
                "color": $scope.hex_array[5],
                "active": false
            }
        ];
        $scope.landloss_positives = ["Sea Level Rise","Farming","Oil and Gas","Restoration","Shipping","Shoreline Erosion"];
        $scope.active_pattern = 0;
        $scope.button_pattern_selected = ['#FFFFFF','#FFFFFF','#FFFFFF','#FFFFFF','#FFFFFF','#FFFFFF'];

        $scope.landlossMarkers = [];

        var link = isCairnsProject 
                        ? '/api/results/cairns_raw_data/'
                        : '/api/results/hg_raw_data/';
        $http.get(link ).then(function(pdata) {

            $scope.raw_data = pdata.data; //all the data

            $scope.showMap = true;
            $scope.InitMap(7);

        }, function (err) {
            console.log("whoops")

        });
    });


module.controller('resultsHubController',
    function($scope, $http, $window,$stateParams,$timeout,$location,$sce,NgMap) {


        //change this if we want gridMap instead of heatMap
        $scope.gridMap = false;

        $scope.successProject = false;
        $scope.showMap = false;

        $window.document.title ="Results";

        $scope.getExternalFrame = function(link){
            return  $sce.trustAsResourceUrl(link)
        };


        $scope.point_array =  ['/images/markers/marker_green2.svg',
            '/images/markers/marker_yellow2.svg',
            '/images/markers/marker_orange2.svg',
            '/images/markers/marker_red2.svg',
            '/images/markers/marker_blue2.svg',
            '/images/markers/marker_purple2.svg',
            '/images/markers/marker_grey.svg'];

        $scope.hex_array = ['#9cdc1f',
            '#FFF200',
            '#F7941D',
            '#ff0000',
            '#0072BC',
            '#8a2be2'
        ];

        $scope.icon_array =  ['/images/dots/cs_green_dot.svg',
            '/images/dots/cs_yellow_dot.svg',
            '/images/dots/cs_orange_dot.svg',
            '/images/dots/cs_red_dot.svg',
            '/images/dots/cs_blue_dot.svg',
            '/images/dots/cs_purple_dot.svg'];



        //CSV Download Project
        //TODO: CHANGE
        $scope.downloadCSVHub = function(){
            //Download the results
            location.href = '/api/results/hub_data/csv/' + $stateParams.hub_code
        };



        $scope.InitMap = InitMapHub;
        function InitMapHub (zoom){

            $scope.update_hub_Markers($scope.hub_positives[0],0)

            //generate map
            //TODO: check back for this center, it might not be adjusted if we make projects in other locations
            $scope.map1 = {
                center: {
                    latitude: parseFloat(29.905498110016907),
                    longitude: parseFloat(-90.26941133000318)
                },
                streetViewControl: false,
                zoom: zoom,
                markers: $scope.hubMarkers,
                markersEvents: {
                    click: function (marker, eventName, model) {
                        $scope.map1.window.model = model;
                        $scope.map1.window.show = true;
                    }
                },
                window: {
                    marker: {},
                    show: false,
                    closeClick: function () {
                        this.show = false;
                    },
                    options: {}
                }
            };
            $scope.successProject = true;

        };


        $scope.update_hub_Markers = function (pattern,color_index){
            $scope.hubMarkers = [];
            //for every item in the original data, if majority matches picked pattern then add to map:
            var pointId = 0;

            //change button colors here
            $scope.hub_positives_buttons[$scope.active_pattern].active = false;
            $scope.active_pattern = color_index;
            $scope.hub_positives_buttons[$scope.active_pattern].active = true;


            var project_key = $scope.map_patterns_projects[pattern];
                Object.keys($scope.raw_data).forEach(function (key) {

                    var item = $scope.raw_data[key][project_key];
                    if (item){
                        var point_marker = new google.maps.Marker({
                            latitude: parseFloat(item.lat) ,
                            longitude: parseFloat(item.lon) ,
                            title: item.image_url,
                            id: pointId,
                            icon: $scope.icon_array[color_index]
                        });
    
    
                        var image_path = 'api/tasks/getImageFree/' + item.dataset_id + '/' + key  + '.jpg';
    
                        point_marker.templateUrl = 'infowindow_templateLandloss.html';
                        point_marker.templateParameter = {
                            id:   pointId,
                            image: image_path,
                            image_url: item.image_url,
                            pattern: pattern,
                            majority_percentage: Math.round(100*item.majority_count/item.total) + "%"
                        };
    
                        if (item.majority === pattern){
                            $scope.hubMarkers.push(point_marker);
                        }
                        pointId = pointId + 1;
                    }

                });

        };
        //Options we want to focus on:
        $scope.hub_positives_buttons = [];
        $scope.button_pattern_selected = [];
        $scope.hubMarkers = [];
        $scope.map_patterns_projects = {}

        //STEP 1: get hub information        
        $http.get('/api/project/getHubInfoURL/' + $stateParams.hub_code).then(function(hub_data) {

            $scope.hub_data = hub_data.data[0]; //all the hub data
            //get the labels we do the maps from the hub:
            $scope.hub_description = hub_data.description;
            $scope.hub_title = hub_data.name;
            $scope.hub_positives = $scope.hub_data.results_labels.split(',');
            $scope.hub_projects = $scope.hub_data.project_codes.split(',');
            $scope.active_pattern = 0;

            //make the patterns
            for (var i = 0; i < $scope.hub_positives.length; i++) {
                $scope.hub_positives_buttons.push(
                    {
                        "pattern":$scope.hub_positives[i],
                        "color": $scope.hex_array[i],
                        "active": i == $scope.active_pattern ? true : false
                }   
                )
                $scope.map_patterns_projects[$scope.hub_positives[i]] = parseInt($scope.hub_projects[i])
                $scope.button_pattern_selected.push('#FFFFFF')
            }            
            //do we have external sign up for the hub?
            $scope.external_signup = $scope.hub_data.external_sign_up;

            //STEP 2: get data for the projects in the hub
            $http.get('/api/results/hub_data/' + $stateParams.hub_code).then(function(pdata) {

                $scope.raw_data = pdata.data; //all the data    
                $scope.showMap = true;
                $scope.InitMap(7);
    
            }, function (err) {
                console.log("Could not fetch subprojects data")
    
            });

        }, function (err) {
            console.log("Could not fetch hub information.")

        });
    });

module.controller('appController', ['$scope', '$location', function($scope, $location) {
    $scope.params = $location.search();

}]);

module.controller('AboutController', ['$scope', '$window', '$stateParams', '$http', 'heatMapProject1', 'heatMapProject2',
    function($scope, $window, $stateParams, $http, heatMapProject1, heatMapProject2) {
    $window.document.title ="About Cartoscope";

    $scope.showCollabs = false;

    //If CMNH, show Algal Bloom Team, else only show Cartoscope
    $scope.project_code = $stateParams.pCode;
    $scope.showAlgal = true;
    //if project code on parameters then hide if not heatmap projects
    if ($scope.project_code != undefined) {
        if ($scope.project_code == heatMapProject1 || $scope.project_code == heatMapProject2) {
            $scope.showAlgal = true;
        } else {
            $scope.showAlgal = false;
        }
    }

    //get collaborator info from db
    $http.get('/api/user/getAboutInfo/' + $stateParams.pCode).then(function(cdata){
            if (cdata.data){
                $scope.collaborators = cdata.data;
                $scope.showCollabs = true;
            }
    }).catch(function(error){
         console.log(error);
        });


}]);

module.controller('TermsController', ['$scope', '$window', '$stateParams', function($scope, $window, $stateParams) {
    $window.document.title ="Terms Of Use"

}]);

module.controller('exampleController', ['$window', '$scope', '$state', '$stateParams','NgMap', '$timeout',
    'heatMapProject1', 'heatMapProject2', 'googleMapAPIKey', '$http', '$q' , '$location', '$sce',
    function($window, $scope, $state, $stateParams, NgMap, $timeout, heatMapProject1, heatMapProject2, googleMapAPIKey, $http, $q, $location, $sce ) {
    var vm = this;
    vm.params={};

    $window.document.title = "Examples";
    //console.log('In Example Controller');
    //console.log('Scope', $scope);
    vm.params.project= $stateParams.pCode;
    vm.params.workerId= $stateParams.workerId;
    vm.params.kioskId= $stateParams.kioskId;
    vm.params.projectType = $stateParams.projectType;
    vm.params.hitId= $stateParams.hitId;
    //console.log('$scope.params.project ',vm.params);
    vm.googleMapsUrl= "https://maps.googleapis.com/maps/api/js?key="+googleMapAPIKey;
    vm.goTo=5;
    vm.showTutorialLink = false;


    vm.annotated = false;
        $scope.next_per2 = 0;
        $scope.progressBarStyle = {"width" : "0%"};

    vm.alertError = function(msg) {
        swal({
            title: 'Whoops!',
            confirmButtonColor: '#9cdc1f',
            allowOutsideClick: true,
            text: msg,
            type: 'error',
            confirmButtonText: 'Back'
        });
    }




        vm.fetchCenter = fetchCenter;
        vm.centerChanged = centerChanged;
        vm.zoomChanged = zoomChanged;
        vm.show_Correct_Options = show_Correct_Options;
        vm.next_button = next_button;
        vm.start = start;
        vm.map_init = map_init;
        vm.zoomToMarker = zoomToMarker;
        vm.getFullIframe = getFullIframe;
        $scope.show_explanation = false;
        $scope.show_option_buttons = true;
        $scope.show_start_button = false;

        var dZoom = 15;


        //markers for marker task
        $scope.point_array =  ['/images/markers/marker_green2.svg',
            '/images/markers/marker_yellow2.svg',
            '/images/markers/marker_orange2.svg',
            '/images/markers/marker_red2.svg',
            '/images/markers/marker_blue2.svg',
            '/images/markers/marker_purple2.svg',
            '/images/markers/marker_grey.svg'];


        var button_cols = {
            '4': '#ff0000',    //red
            '1': '#9cdc1f',   //green
            '5': '#0000ff',     //blue
            '3': '#ffa500',   //orange
            '2': '#ffff00',   //yellow
            '6': '#8a2be2'  //purple

        };

        $scope.button_cols = ['#9cdc1f','#ffff00','#ffa500','#ff0000','#0000ff','#8a2be2',"gray"];


        //for NGS tasks
        function getFullIframe(){

            if ( vm.counter != undefined && vm.tutorial[vm.counter] != undefined){

                var link = vm.tutorial[vm.counter].image_source;
                var zoom = vm.tutorial[vm.counter].zoom;
                var x = vm.tutorial[vm.counter].lat;
                var y = vm.tutorial[vm.counter].lng;
                var url = link + '#' + zoom + '/'+  x + '/' + y;
                return  $sce.trustAsResourceUrl(url)
            }

        };

        function fetchCenter(){
            //console.log('In get Center ');
            var lng = vm.tutorialMapping[vm.counter].lat;
            var lat = vm.tutorialMapping[vm.counter].lng;
            return [lat,lng];
        }

        function centerChanged() {
            NgMap.getMap().then(function(map) {
                vm.centerLat = map.getCenter().lat();
                vm.centerLng = map.getCenter().lng();

            });
        }

        function zoomChanged() {
            //console.log('IN ZOom CHnaged'+ vm.map.getCenter().lat(), vm.map.getCenter().lng());
            NgMap.getMap().then(function(map) {
                vm.centerLat = map.getCenter().lat();
                vm.centerLng = map.getCenter().lng();
            })

        }

        //zoom to selected marker and show correct color
        function zoomToMarker(item){

            var ans = item.answer;
            //Zoom to marker only if answer contains marker. If no bridge or unselected (or no markers task) then ignore
            if (vm.showMarkers && ans.toLowerCase() != "no bridge" && ans.toLowerCase() != "unselected") {
                NgMap.getMap().then(function(point_map) {


                    //Find marker and reset marker color:
                    $scope.MarkerArray.some(function (marker) {
                        var found = false;
                        if (marker.id === item.poi_name) {
                            marker.icon = $scope.point_array[item.col_number - 1];
                            // item.setZIndex(google.maps.Marker.MAX_ZINDEX + 1);
                            marker.setMap(point_map);
                            found = true
                        }
                        return found;
                    });

                    //zoom in on marker
                    var point_pos = {lat: parseFloat(item.lat) , lng: parseFloat(item.lng)};
                    var targetZoom = parseInt(dZoom) + 5;
                    var currZoom = point_map.getZoom();
                    point_map.panTo(point_pos);
                    animatedZoom(point_map,targetZoom,currZoom);
                })
            }
        }
        //animate zoom movement with promise
        function animatedZoom(mp,tZoom,cZoom,callback){
            return $q(function(resolve, reject) {
                if (cZoom != tZoom) {
                    google.maps.event.addListenerOnce(mp, 'zoom_changed', function (event) {
                        animatedZoom(mp, tZoom, cZoom + (tZoom > cZoom ? 1 : -1));
                    });
                    setTimeout(function () {
                        mp.setZoom(cZoom)
                    }, 150);
                }
                resolve("Zoom Animated");

            })
        }
        function next_button() {

            //scroll to the top
            $('html,body').animate({
                    scrollTop: $("#top-page").offset().top},
                'slow');

            //hide annotated state
            vm.annotated = false;

            //handle mapping task
            if(vm.params.projectType == 'mapping') {

                if (vm.counter < vm.tutorialMapping.length - 1) {
                    vm.counter = Number(vm.counter) + Number(1);


                    document.getElementById("correct-note-mapping").style.visibility = "hidden";
                    document.getElementById("tut_next_mapping").style.visibility = "hidden";
                    document.getElementById("tut_text_mapping").style.visibility = "hidden";
                    document.getElementById("markerShowAnswerButton").style.display = "block";

                    vm.lat = vm.tutorialMapping[vm.counter].lat;
                    vm.lang = vm.tutorialMapping[vm.counter].lng;
                    NgMap.getMap().then(function(point_map) {

                        point_map.setZoom(parseInt(vm.tutorialMapping[vm.counter].zoom));

                    });

                    // var myLatlng = new google.maps.LatLng(vm.tutorialMapping[vm.counter].lat,
                    //     vm.tutorialMapping[vm.counter].lng);
                    // vm.map.setCenter(myLatlng);

                    // $timeout(function () {
                    //     //console.log('in Timeout'+ vm.counter);
                    //     // var heading = vm.map.getHeading() || 0;
                    //     // if (vm.counter == 2) {
                    //     //     vm.map.setHeading(heading + 90);
                    //     // }
                    //     //zoom into marker and show correct answer:
                    //     //vm.zoomToMarker(vm.tutorialMapping[vm.counter])
                    // }, 500);
                }
                // handle tagging task
            } else {

                if (vm.counter < vm.tutorial.length - 1) {
                    vm.counter = Number(vm.counter) + Number(1);
                    $scope.show_explanation = false;
                    $scope.show_option_buttons = true;
                    // document.getElementById("correct-note").style.visibility = "none";
                    document.getElementById("tut_next").style.visibility = "hidden";
                    document.getElementById("tut_text").style.visibility = "hidden";
                }

                //if ask user is turned off, then skip the question part and show text directly
                if (vm.tutorial[vm.counter].ask_user == 0) {
                    show_Correct_Options(vm.tutorial[vm.counter].answer);
                }

            }

            //increase progress bar
            $scope.next_per = (vm.counter / vm.goTo).toFixed(2) *100;
            $scope.progressBarStyle = {"width" : $scope.next_per.toString() + "%"};

            if (vm.counter == 0) {
                $scope.next_per2 = 0;
            } else {
                $scope.next_per2 = Math.floor($scope.next_per);
            }


            //handle end of tutorial
            if (vm.counter == vm.goTo) {

                if(vm.params.projectType == 'mapping'){
                    document.getElementById("tut_next_mapping").style.display = "none";
                } else {
                    document.getElementById("tut_next").style.display = "none";
                }
            }
        };



        function show_Correct_Options(option) {



            if(vm.params.projectType == 'mapping'){


                document.getElementById("markerShowAnswerButton").style.display = "none";
                vm.zoomToMarker(vm.tutorialMapping[vm.counter]);

                document.getElementById("correct-note-mapping").style.visibility = "visible";
                document.getElementById("tut_next_mapping").style.visibility = "visible";
                document.getElementById("tut_text_mapping").style.visibility = "visible";



            } else {


                vm.annotated = true; //show annotated image if available


                var l_answer = vm.tutorial[vm.counter].answer;
                // console.log(l_answer.toLowerCase(),option.toLowerCase());
                if (l_answer.toLowerCase() != option.toLowerCase()) {
                    vm.annotated = false; //show annotated image if available
                    return vm.alertError("Try again!")
                    //return alert("Whoops! Try again!");


                }

                // console.log('in correct options');
                $scope.show_explanation = true;
                $scope.show_option_buttons = false;
                // document.getElementById("correct-note").style.visibility = "visible";
                document.getElementById("tut_next").style.visibility = "visible";
                //document.getElementById("tut_text").style.visibility = "visible";
            }

            if (vm.counter == vm.goTo) {

                //alert("Pay attention! You may encounter these images again in the task. Answering them correctly will give you a bonus!")


                if(vm.params.projectType == 'mapping'){
                    document.getElementById("tut_start_mapping").style.visibility = "visible";
                } else {
                    $scope.show_start_button = true;
                    //document.getElementById("tut_start").style.visibility = "visible";
                }

                //Get the link to more training
                $http.get('/api/tasks/getInfoFree/' + $stateParams.pCode).then(function(pdata) {

                    vm.tutorial_link = pdata.data[0].tutorial_link;
                    if (vm.tutorial_link != null && vm.tutorial_link != undefined){
                        vm.showTutorialLink = true;
                    }
                });

            }

            // $('html,body').animate({
            //         scrollTop: $("#correct-note").offset().top},
            //     'slow');
        };

        function start() {
        var reqParams = {};
        for (var i in vm.params) {
            if (i == 'workerId' || i == 'assignmentId' || i == 'hitId' || i == 'submitTo' || i == 'kioskId') {
                reqParams[i] = vm.params[i];
            }
        }

        var qs = '';

        for (i in reqParams) {
            qs += '&' + i + '=' + reqParams[i];
        }
        //console.log('reqParams ', reqParams);
        if(reqParams.kioskId==1){
            window.location.replace('/api/anon/startKiosk/' + vm.params.project + '?' + 'workerId='+ vm.params.workerId+'&kioskUser=1');
        } else{
            window.location.replace('/api/anon/startAnon/' + vm.params.project + '?' + qs.substr(1));
        }


    };
//Map initialization
        function map_init(){

            var map={};
            vm.map={};
            //Map initialization
            NgMap.getMap().then(function(map) {
                vm.map = map;

                // console.log(vm.tutorialMapping[vm.counter].lat, vm.tutorialMapping[vm.counter].lng);

                var myLatlng = new google.maps.LatLng(Number(vm.tutorialMapping[vm.counter].lat),
                    Number(vm.tutorialMapping[vm.counter].lng));
                vm.map.setCenter(myLatlng);

                var heading = vm.map.getHeading() || 0;
                vm.map.setHeading(heading + 90);

                // console.log(vm.map);
                latCenter = vm.map.getCenter().lat();
                lngCenter = vm.map.getCenter().lng();
                //console.log(latCenter, lngCenter);
                vm.lat = vm.map.getCenter().lat();
                vm.lang = vm.map.getCenter().lng();

                // if markers task, put the tutorial markers on the map
                if (vm.showMarkers || vm.points_file != null) {


                    //Will store all locations in this array and then ignore all markers in same position from
                    //csv file
                    vm.tutorialPois = [];
                    vm.legendObject = [];
                    $scope.MarkerArray = [];

                    var tmpl = vm.tutorialMapping[0].options;
                    // var opt = tmpl.options;
                    // reject all colors that are not in the  options and dummy QQQ vote
                    $scope.point_array_filtered = [];
                    tmpl.forEach(function (item) {
                        var icon_index =  $scope.button_cols.indexOf(item.color);
                        if(item.text != 'QQQ'){
                            $scope.point_array_filtered.push($scope.point_array[icon_index]);
                            //Make the legend
                            //Ignore dummy 'QQQ' option
                            vm.legendObject.push({
                                key: item.name,
                                image: $scope.point_array[icon_index]
                            })
                        }
                    });
                    //enter the unselected into the array
                    $scope.point_array_filtered.push($scope.point_array[$scope.point_array.length -1]);
                    //Add unselected option to legend
                    vm.legendObject.push({
                        key: 'Unselected',
                        image: $scope.point_array[$scope.point_array.length - 1]
                    });

                    // For every item in the tutorial table, put the marker on the map
                    vm.tutorialMapping.forEach(function(item){

                        //for all valid markers
                        if (item.col_number != -1) {

                            var point_pos = {lat: parseFloat(item.lat) , lng: parseFloat(item.lng)};

                            var point_marker = new google.maps.Marker({
                                position: point_pos,
                                map: map,
                                title: item.poi_name,
                                id: item.poi_name,
                                // zIndex: pointId,
                                // icon: $scope.point_array[item.col_number - 1] //color marker with correct answer
                                icon: $scope.point_array[$scope.point_array.length - 1] //color marker with correct answer
                            });
                            //add listener only if showMarkers
                            if (vm.showMarkers){
                                google.maps.event.addListener(point_marker, 'click', function() {
                                    var col = this.icon;
                                    //get index of color from array
                                    var marker_indx = $scope.point_array_filtered.indexOf(col);
                                    marker_indx = (marker_indx + 1) % $scope.point_array_filtered.length;
                                    this.icon = $scope.point_array_filtered[marker_indx];
                                    this.setIcon($scope.point_array_filtered[marker_indx])

                                    this.setMap(map)
                                });

                            }
                            point_marker.setMap(map);
                            vm.tutorialPois.push(item.poi_name);
                            //push marker to array
                            $scope.MarkerArray.push(point_marker);

                        }

                    });


                    //put all the markers that are available for the project on the map as well, unselected
                    if (vm.showMarkers){
                        d3.csv('/images/files/'+vm.points_file, function(csv_data) {


                            for (var i = 0; i < csv_data.length; i++) {
                                // split content based on comma
                                var csv_obj = csv_data[i];
                                //make marker from csv point in csv_obj
                                var point_pos = {lat: parseFloat(csv_obj.latitude), lng: parseFloat(csv_obj.longitude)};

                                if(!vm.tutorialPois.includes(csv_obj.name)) {

                                    var csv_marker = new google.maps.Marker({
                                        position: point_pos,
                                        map: map,
                                        title: csv_obj.name,
                                        id: csv_obj.name,
                                        // zIndex: pointId,
                                        icon: $scope.point_array[$scope.point_array.length - 1] //all unclicked markers are gray
                                    });
                                    google.maps.event.addListener(csv_marker, 'click', function() {
                                        var col = this.icon;
                                        //get index of color from array
                                        var marker_indx = $scope.point_array_filtered.indexOf(col);
                                        marker_indx = (marker_indx + 1) % $scope.point_array_filtered.length;
                                        this.icon = $scope.point_array_filtered[marker_indx];
                                        this.setIcon($scope.point_array_filtered[marker_indx])

                                        this.setMap(map);
                                    });
                                    csv_marker.setMap(map);
                                    $scope.MarkerArray.push(csv_marker);
                                }
                            }
                        })
                    }



                }

            });

            $(document).ready(function(){
                //Show help modal at the beginning:
                $("#info_modal").modal('show')
            });

        }


        //Get project info here to check for genetic
        $http.get('/api/tasks/getInfoFree/' + vm.params.project).then(function(data) {

            vm.project_name = data.data[0].name;

            $http.get('/api/project/getTutorial/' + vm.params.project).then(function(tdata) {


                // tutorial data
                var tutData = tdata.data;

                console.log(tutData)
                if (tutData.length == 0){
                    vm.start();
                }

                var template  = JSON.parse(tutData[0].template);
                vm.question = template.question;
                vm.counter = 0;
                //get question from results
                vm.goTo = tutData.length -1;

                $scope.next_per = (vm.counter / vm.goTo).toFixed(2) *100;
                $scope.progressBarStyle = {"width" : $scope.next_per.toString() + "%"};

                if (vm.counter == 0) {
                    $scope.next_per2 = 0;
                } else {
                    $scope.next_per2 = Math.floor($scope.next_per);
                }


                vm.showMarkers = parseInt(tutData[0].point_selection);
                vm.points_file = tutData[0].points_file;

                vm.tutorial = [];
                vm.tutorialMapping = [];

                tutData.forEach(function(item) {


                    var tmpl = JSON.parse(item.template);
                    var opt = [];
                    var sel_col = '';
                    var sel_num = -1;
                    tmpl.options.forEach(function(choice) {
                        if (choice.text != 'QQQ'){
                            opt.push({'name':choice.text,'color': button_cols[choice.color]});
                            if (choice.text.toLowerCase() === item.answer.toLowerCase()) {
                                sel_col = button_cols[choice.color];
                                sel_num = parseInt(choice.color) ;

                            }
                        }
                    });

                    //if tutorial image in dataset, fetch from dataset
                    var tutpath = '../../images/Tutorials/';


                    if (item.hasOwnProperty('in_dataset') &&  item.in_dataset == 1){
                        //tutpath = '../../../dataset/' + data.data[0].dataset_id + '/';
                        tutpath = '/api/tasks/getImageFree/' + data.data[0].dataset_id + '/'
                    }
                    var it_annot = tutpath + item.image_name;
                    if (item.image_annotation){
                        it_annot = item.image_annotation.includes("/")
                            ? `../../images/Tutorials/${item.image_annotation}`
                            : `../../images/Tutorials/${vm.params.project}/${item.image_annotation}`;
                    }

                    var obj = {
                        image: tutpath + item.image_name,
                        answer: item.answer,
                        text:  item.explanation,
                        color: sel_col,
                        options: opt,
                        lat: parseFloat(item.x) ,
                        lng: parseFloat(item.y),
                        zoom: item.zoom ||  18,
                        heading: 0,
                        tilt: 0,
                        col_number : parseInt(sel_num),
                        poi_name : item.poi_name || '',
                        image_source: item.image_source,
                        image_annotation: it_annot,
                        ask_user : parseInt(item.ask_user),
                        in_dataset : parseInt(item.in_dataset)
                    };
                    if( vm.params.projectType != 'mapping') {

                        vm.tutorial.push(obj)
                    } else {
                        vm.tutorialMapping.push(obj)
                    }

                });

                console.log(vm.tutorial);

                if (vm.tutorial.length == 0){
                    vm.start();
                }

                //if ask user is turned off, then skip the question part and show text directly
                if (vm.tutorial[vm.counter].ask_user == 0) {
                    show_Correct_Options(vm.tutorial[vm.counter].answer);
                }

                if(vm.params.projectType == 'mapping'){

                    vm.map_init();
                }

            });
        })



}]);

module.controller('mTurkController', ['$window','$scope','$location','$state','$stateParams',function($window, $scope,$location,$state,$stateParams){

    $window.document.title = "Cartoscope";
    $scope.begin = function() {
        //console.log('Begin....');
        //console.log($stateParams);
        $scope.params = $location.search();
        $scope.params.project= $stateParams.pCode;

        var reqParams = {};
        for (var i in $scope.params) {
            if (i == 'workerId' || i == 'assignmentId' || i == 'hitId' || i == 'submitTo') {
                reqParams[i] = $scope.params[i];
            }
        }

        var qs = '';

        for (i in reqParams) {
            qs += '&' + i + '=' + reqParams[i];
        }

        window.location.replace('/api/anon/startAnon/' + $scope.params.project + '?' + qs.substr(1));
    }
}]);

module.controller('kioskController', ['$window','$scope','$location','$state','$stateParams','$http', '$cookies',
    function($window,$scope,$location,$state,$stateParams,$http, $cookies ){
        $window.document.title = "Cartoscope";
        $scope.begin = function() {
            //console.log($stateParams);

            $scope.params = $location.search();


            //check for cookie and set it if it doesnt exist
            if(!$cookies.get('kiosk')){
                $cookies.put('kiosk', lil.uuid());
            }

            //getProjects Code dynamically
            $http.get('/api/anon/startKiosk/').then(function(e, data) {
                //console.log('e', e, data);
                $scope.params.project = e.data.projectID;
                $scope.workerId = e.data.workerID;
                $scope.project = e.data.project;
                var type= JSON.parse($scope.project.template);
                $scope.projectType = type.selectedTaskType;

                $http.get('/api/anon/consentKiosk/' + $scope.params.project + '?' + 'workerId='+ $scope.workerId+'&cookie='+$cookies.get('kiosk')).then(function(e, data) {
                    //console.log('data ', e.data.workerId);
                    $state.go('examples', {pCode: $scope.params.project, workerId: e.data.workerId, projectType: $scope.projectType, kioskId:1});
                    //window.location.replace('/api/anon/startKiosk/' + $scope.params.project+ '?workerId='+e.data.workerId+'&kioskId=1');
                }, function(err) {
                    alert('error'+ err);
                });

            }, function(err) {
                console.log('error', err);
            });
        }
    }]);

module.controller('kioskProjectController', ['$window','$scope','$location','$state','$stateParams','$http', '$cookies', '$sce',
    function($window,$scope,$location,$state,$stateParams,$http, $cookies, $sce ){
        $window.document.title = "Cartoscope";

        $scope.project_title = "";
        $scope.project_desc = "";
        $scope.showSource = false;
        $scope.showCC = false;
        $scope.proj_data = {};
        $scope.showConsentMturk = false;
        $scope.isMturk = false;
        $scope.hit_id = "kiosk";


        if ($location.search().hasOwnProperty("trialId")){
            $scope.isMturk = true
            $scope.hit_id = $location.search().trialId;
            console.log()
        }


        $scope.acceptConsent = function() {
            $scope.showConsentMturk = false;
            //TODO: We are hiding the navbar because we only want them to do the task
            //document.getElementById("navB").style.display = "block";

        };




        //Get project info and set the page
        $scope.project_code = $stateParams.pCode;
        $http.get('/api/tasks/getInfoFree/' + $stateParams.pCode).then(function(pdata) {

            $scope.proj_data = pdata.data[0];

            $scope.project_title =  $scope.proj_data.name;
            $scope.project_desc =  $scope.proj_data.description;
            $scope.image_source = $scope.proj_data.image_source;

            $scope.proj_template = JSON.parse($scope.proj_data.template);
            $scope.projectType =  $scope.proj_template.selectedTaskType;

            $scope.video_url = $sce.trustAsResourceUrl($scope.proj_data.video_url);

            $scope.cover_pic = $scope.proj_data.cover_pic;
            $scope.cover_pic_path = 'api/project/getProjectPic/' + $stateParams.pCode;

            console.log("======");
            console.log($scope.proj_data);
            console.log("======");
            $scope.is_scistarter = $scope.proj_data.scistarter_link !== null;


            //if mturk, first show consent!
            if ($scope.isMturk && $scope.hit_id.includes("mturk")) {
                document.getElementById("navB").style.display = "none";
                $scope.showConsentMturk = true;
            }


            if ($scope.image_source != null) {
                $scope.showSource = true;
            }

            if ($scope.video_url != null) {
                $scope.showVideo = true;
            } else {
                $scope.showVideo = false;
            }

            //Get the creator name from the collaborators:
            //get collaborator info from db
            $http.get('/api/user/getAboutInfoCreator/' + $stateParams.pCode).then(function(cdata){
                if (cdata.data && cdata.data.length >0){

                    $scope.creator = cdata.data[0].name;
                    $scope.showCC = true;
                }
            }).catch(function(error){

            });
        });


        $scope.showTerms = function(){
            if ($scope.isMturk && $scope.hit_id.includes("mturk"))
                $scope.beginProject();
            else
                $('#termsModal2').appendTo("body").modal('show');
        }




        $scope.beginProject = function() {
            //console.log($stateParams);

            $scope.params = $location.search();

            //check for cookie and set it if it doesnt exist
            if(!$cookies.get('kiosk')){
                $cookies.put('kiosk', lil.uuid());
            }

            $http.get('/api/tasks/getInfoFree/' + $stateParams.pCode).then(function(pdata) {

                $scope.proj_data = pdata.data[0];
                //getProjects Code dynamically
                $http.get('/api/anon/startKioskProject/' + $stateParams.pCode).then(function(e, data) {
                    //console.log('e', e, data);
                    // $scope.params.project = e.data.projectID;
                    $scope.workerId = e.data.workerID;
                    $scope.project = e.data.project;
                    var type= JSON.parse($scope.proj_data.template);
                    $scope.projectType = type.selectedTaskType;

                    $http.get('/api/anon/consentKiosk/' + $stateParams.pCode + '?' + 'workerId='+ $scope.workerId+'&cookie='+$cookies.get('kiosk')+'&hitID='+ $scope.hit_id)
                        .then(function(e, data) {
                        //console.log('data ', e.data.workerId);
                        $state.go('examples', {pCode: $stateParams.pCode, workerId: e.data.workerId, projectType: $scope.projectType, kioskId:1, hitId: $scope.hit_id});
                        //window.location.replace('/api/anon/startKiosk/' + $scope.params.project+ '?workerId='+e.data.workerId+'&kioskId=1');
                    }, function(err) {
                        alert('error'+ err);
                    });

                }, function(err) {
                    console.log('error', err);
                });
            })


        }
    }]);

module.controller('landlossController', ['$window','$scope','$location','$state','$stateParams','$http', '$cookies', '$sce',
    function($window,$scope,$location,$state,$stateParams,$http, $cookies, $sce ){
        $window.document.title = "Cartoscope";

        $scope.project_title = "";
        $scope.project_desc = "";
        $scope.showSource = false;
        $scope.showCC = false;
        $scope.proj_data = {};
        $scope.showConsentMturk = false;
        $scope.isMturk = false;
        $scope.hit_id = "kiosk";

        $scope.is_landloss = true;


        if ($location.search().hasOwnProperty("trialId")){
            $scope.isMturk = true
            $scope.hit_id = $location.search().trialId;
        }

        $scope.acceptConsent = function() {
            $scope.showConsentMturk = false;
            //TODO: We are hiding the navbar because we only want them to do the task
            //document.getElementById("navB").style.display = "block";
        };

        $scope.showVideo = true;
        $scope.video_url = $sce.trustAsResourceUrl('https://www.youtube.com/embed/yCx0H7bBxPk');
        $scope.cover_pic_path = 'api/project/getProjectPic/UOYIiFeapnyI';

        //if mturk, first show consent!
        if ($scope.isMturk) {
            document.getElementById("navB").style.display = "none";
            $scope.showConsentMturk = true;
        }


        //Get the creator name from the collaborators:
        //get collaborator info from db
        $http.get('/api/user/getAboutInfoCreator/' + $stateParams.pCode).then(function(cdata){
            if (cdata.data && cdata.data.length >0){
                $scope.creator = cdata.data[0].name;
                $scope.showCC = true;
            }
        }).catch(function(error){

        });

        //return random integer [min,max]
        function randomInt(min,max){
            return (Math.floor(Math.random() * (max - min + 1) ) + min);
        }

        $scope.showTerms = function(){
            $('#termsModal2').appendTo("body").modal('show');
        }


        $scope.assignProject = function() {
            //console.log($stateParams);

            $scope.params = $location.search();

            var subprojects = ["UOYIiFeapnyI","ocioawiaGcjw","KyW6Ti9QUr4I","Srz9arMDwthQ","94yoCWhFkpMk","cXz6ImkmG9k5"];
            var pick_d = randomInt(0,subprojects.length - 1); //pick dataset [start,end]
            var project_code = subprojects[pick_d];

            console.log(project_code)

            //check for cookie and set it if it doesnt exist
            if(!$cookies.get('kiosk')){
                $cookies.put('kiosk', lil.uuid());
            }

            $http.get('/api/tasks/getInfoFree/' + project_code).then(function(pdata) {

                $scope.proj_data = pdata.data[0];
                //getProjects Code dynamically
                $http.get('/api/anon/startKioskProject/' + project_code).then(function(e, data) {
                    //console.log('e', e, data);
                    // $scope.params.project = e.data.projectID;
                    $scope.workerId = e.data.workerID;
                    $scope.project = e.data.project;
                    var type= JSON.parse($scope.proj_data.template);
                    $scope.projectType = type.selectedTaskType;

                    $http.get('/api/anon/consentKiosk/' + project_code + '?' + 'workerId='+ $scope.workerId+'&cookie='+$cookies.get('kiosk')+'&hitID='+ $scope.hit_id)
                        .then(function(e, data) {
                            //console.log('data ', e.data.workerId);
                            $state.go('examples', {pCode: project_code, workerId: e.data.workerId, projectType: $scope.projectType, kioskId:1, hitId: $scope.hit_id});
                            //window.location.replace('/api/anon/startKiosk/' + $scope.params.project+ '?workerId='+e.data.workerId+'&kioskId=1');
                        }, function(err) {
                            alert('error'+ err);
                        });

                }, function(err) {
                    console.log('error', err);
                });
            })


        }



    }]);


module.controller('hubProjectController', ['$window','$scope','$location','$state','$stateParams','$http', '$cookies', '$sce',
    function($window,$scope,$location,$state,$stateParams,$http, $cookies, $sce ){
        $window.document.title = "Cartoscope";

        $scope.project_title = "";
        $scope.project_desc = "";
        $scope.showSource = false;
        $scope.showCC = false;
        $scope.proj_data = {};
        $scope.showConsentMturk = false;
        $scope.isMturk = false;
        $scope.hit_id = "kiosk";

        $scope.show_start_button = false;


        if ($location.search().hasOwnProperty("trialId")){
            $scope.isMturk = true
            $scope.hit_id = $location.search().trialId;
        }

        $scope.acceptConsent = function() {
            $scope.showConsentMturk = false;
            //TODO: We are hiding the navbar because we only want them to do the task
            //document.getElementById("navB").style.display = "block";
        };

        //TODO: what about video
        $scope.showVideo = false;
        //$scope.video_url = $sce.trustAsResourceUrl('https://www.youtube.com/embed/yCx0H7bBxPk');
        //$scope.cover_pic_path = 'api/project/getProjectPic/UOYIiFeapnyI';

        //if mturk, first show consent!
        if ($scope.isMturk) {
            document.getElementById("navB").style.display = "none";
            $scope.showConsentMturk = true;
        }



        //return random integer [min,max]
        function randomInt(min,max){
            return (Math.floor(Math.random() * (max - min + 1) ) + min);
        }

        $scope.showTerms = function(){
            $('#termsModal2').appendTo("body").modal('show');
        }


        $scope.assignProject = function() {
            //console.log($stateParams);

            $scope.params = $location.search();

            var subprojects = $scope.hub_subprojects;
            var pick_d = randomInt(0,subprojects.length - 1); //pick dataset [start,end]
            var project_id = parseInt(subprojects[pick_d]);
            console.log(project_id)

            //check for cookie and set it if it doesnt exist
            if(!$cookies.get('kiosk')){
                $cookies.put('kiosk', lil.uuid());
            }

            $http.get('/api/tasks/getInfoFreeId/' + project_id).then(function(pdata) {

                $scope.proj_data = pdata.data[0];
                var project_code = $scope.proj_data.unique_code;
                //getProjects Code dynamically
                $http.get('/api/anon/startKioskProject/' + project_code).then(function(e, data) {
                    //console.log('e', e, data);
                    // $scope.params.project = e.data.projectID;
                    $scope.workerId = e.data.workerID;
                    $scope.project = e.data.project;
                    var type= JSON.parse($scope.proj_data.template);
                    $scope.projectType = type.selectedTaskType;

                    $http.get('/api/anon/consentKiosk/' + project_code + '?' + 'workerId='+ $scope.workerId+'&cookie='+$cookies.get('kiosk')+'&hitID='+ $scope.hit_id)
                        .then(function(e, data) {
                            //console.log('data ', e.data.workerId);
                            $state.go('examples', {pCode: project_code, workerId: e.data.workerId, projectType: $scope.projectType, kioskId:1, hitId: $scope.hit_id});
                            //window.location.replace('/api/anon/startKiosk/' + $scope.params.project+ '?workerId='+e.data.workerId+'&kioskId=1');
                        }, function(err) {
                            alert('error'+ err);
                        });

                }, function(err) {
                    console.log('error', err);
                });
            })


        }

        //start: get hub information:
        $http.get('/api/project/getHubInfoURL/' + $stateParams.hub_code).then(function(hub_data) {

            $scope.hub_data = hub_data.data[0];
            $scope.hub_title = $scope.hub_data.name;
            $scope.hub_description = $scope.hub_data.description;
            $scope.hub_subprojects = $scope.hub_data.project_codes.split(",");
            $scope.show_start_button = true;
            $scope.cover_pic = 'default'; //TODO: this should come from hub

            //Get the creator name from the collaborators:
            //get collaborator info from db, using the first available subproject
            $http.get('/api/user/getAboutInfoCreator/' + $scope.hub_subprojects[0]).then(function(cdata){
            if (cdata.data && cdata.data.length >0){
                $scope.creator = cdata.data[0].name;
                $scope.showCC = true;
            }
        }).catch(function(error){
            console.log("Could not get collaborator name")
        });


        }, function(err){
            console.log('error', err);
        })





    }]);

module.controller('navController', ['$scope','$window','$location', '$stateParams', function($scope,$window, $location,$stateParams) {

     $scope.setPage = setPage;

     $scope.navcode = $stateParams.pCode;
     $scope.hub_code = $stateParams.hub_code;


     $scope.hg_landloss = $stateParams.landloss;
     $scope.hub_project = $stateParams.hub_project;


     if ($scope.navcode != undefined ){
         //if we have a code then replace hrefs for relevant pages:
         $scope.home_link = "/kioskProject.html#/kioskStart/" + $scope.navcode;
         $scope.about_link = "#/about/" + $scope.navcode;
         $scope.results_link = "#/results/" + $scope.navcode;
         $scope.toc_link = "#/termsOfUse/" +  $scope.navcode;
         if (["mKSRWYI4E59f", "Z2cg3ppyCsZW", "vOihRaFY2lSS", "ENtBwQQtcK3L", "DQ0RAb6nVgXr", "D1Y4k21Xb9NL"].includes($stateParams.pCode)) {
             // this means this is a cairns project, and we should use the hgResults
             $scope.results_link = "#/resultsHG";
         }
     }  else {
         //if we have don't have a code then replace go to cmnh view
         $scope.home_link = "#/cmnh";
         $scope.about_link = "#/about";
         $scope.results_link = "#/results";
         $scope.toc_link = "#/termsOfUse";
     }

     if ($scope.hg_landloss){
         $scope.home_link = "kioskProject.html#/hg_landloss"
         $scope.results_link = "#/resultsHG";
     }
     if ($scope.hub_project){
        $scope.home_link = "kioskProject.html#/hubPage/" + $scope.hub_code;
        $scope.results_link = "#/resultsHub/" + $scope.hub_code;
     }

     $scope.showTerms = function(){
         $('#termsModal').appendTo("body").modal('show');
     }




    function setPage(location){
        return location === $location.path();
    }
}]);


module.controller('instructionController', ['$window','$scope', '$state','$stateParams','$location', function($window, $scope, $state, $stateParams) {
    //console.log('locations  ', $state);
    $window.document.title = "Instructions";
    if($stateParams.kioskId){
        $scope.params.project= $stateParams.pCode;
        $scope.params.workerId= $stateParams.workerId;
        $scope.params.kioskId =  $stateParams.kioskId;
    }

    $scope.showExamples = function() {
        //console.log('params', $scope, $scope.params);
        //console.log('examples/:' + $scope.params.project);

        if ($stateParams.kioskId) {
            $state.go('examples', {
                pCode: $scope.params.project,
                workerId: $scope.params.workerId,
                kioskId: $scope.params.kioskId,
            });
        } else {
            $state.go('examples', {
                pCode: $scope.params.project,
                workerId: $scope.params.workerId
            });
        }

    }

}]);

module.controller('consentController', ['$scope', '$http', '$state',
    function($scope, $http, $state) {

        $scope.agree = function() {
            var reqParams = {};
            for (var i in $scope.params) {
                if (i == 'workerId' || i == 'assignmentId' || i == 'hitId' || i == 'submitTo') {
                    reqParams[i] = $scope.params[i];
                }
            }

            var qs = '';

            for (i in reqParams) {
                qs += '&' + i + '=' + reqParams[i];
            }

            //console.log(qs.substr(1));
            $http.get('/api/anon/consent/' + $scope.params.project + '?' + qs.substr(1)).then(function(e, data) {
                $state.go('instruction', {workerId: $scope.params.workerId,
                    assignmentId: $scope.params.assignmentId, hitId:$scope.params.hitId, submitTo: $scope.params.submitTo});
                // window.location.replace('/api/anon/startAnon/' + $scope.params.project + '?' + qs.substr(1));
            }, function(err) {
                // alert('error');
            });
        };
    }]);

