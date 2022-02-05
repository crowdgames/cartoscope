var module = angular.module('consentApp', ['ui.router', 'ngAnimate', 'ngRoute', 'ngMap', 'configApp','angular-uuid']);

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

module.config(function($stateProvider, $urlRouterProvider) {

    var n = new Date();

    $stateProvider.state({
        name: 'consent',
        url: '/consent',
        templateUrl: 'templates/consent/consent.html',
        controller: 'consentController'
    });
    $stateProvider.state({
        name: 'instruction',
        url: '/instruction',
        templateUrl: 'templates/consent/instructions.html',
        params: {
            pCode: '',
            workerId:'',
            participantId:'',
            trialId:'',
            kioskId:'',
            assignmentId:'',
            hitId:'',
            submitTo:'',
            projectType:'',
            chain:-1,
            genetic: 0,
            tree:0,
            qlearn:0,
            image_loop: 0
        },
        controller: 'instructionController'
    });

    $stateProvider.state({
        name: 'examples',
        url: '/examples/:pCode',
        templateUrl: 'templates/consent/example.html',
        params: {
            pCode: '',
            participantId:'',
            trialId:'',
            workerId:'',
            kioskId:'',
            assignmentId:'',
            hitId:'',
            submitTo:'',
            projectType: '',
            chain: -1,
            fromChain:0,
            genetic: 0,
            tree:0,
            qlearn:0,
            image_loop: 0
        },
        // controller: 'exampleController'
    });

    $stateProvider.state({
        name: 'examplesGenetic',
        url: '/examplesGenetic/:pCode',
        templateUrl: 'templates/consent/exampleGenetic.html',
        params: {
            pCode: '',
            workerId:'',
            participantId:'',
            trialId:'',
            kioskId:'',
            assignmentId:'',
            hitId:'',
            submitTo:'',
            projectType: '',
            chain: -1,
            fromChain:0,
            genetic: 0,
            tree:0,
            qlearn:0,
            image_loop:0
        },
        // controller: 'exampleController'
    });
    $stateProvider.state({
        name: 'mturk',
        url: '/mturk/:pCode',
        templateUrl: 'templates/consent/welcome.html',
        controller: 'mTurkController'
    });
    $stateProvider.state({
        name: 'kiosk',
        url: '/',
        templateUrl: 'templates/consent/appDefault.html',
        //templateUrl: '../cmnh.html',
        controller: 'kioskController'
    });

    $urlRouterProvider.otherwise('/');
});

module.controller('appController', ['$scope', '$location', function($scope, $location) {
    $scope.params = $location.search();

}]);

module.controller('exampleController', ['$window', '$scope', '$state', '$stateParams','NgMap', '$timeout', '$http','$q' , '$sce','googleMapAPIKey', '$location',
    function($window, $scope, $state, $stateParams, NgMap, $timeout, $http, $q ,$sce, googleMapAPIKey, $location) {
        var vm = this;
        vm.params={};

        $window.document.title = "Examples";

        vm.params.project= $stateParams.pCode;
        vm.params.workerId= $stateParams.workerId;
        vm.params.kioskId= $stateParams.kioskId;
        vm.params.projectType = $stateParams.projectType;
        vm.params.assignmentId = $stateParams.assignmentId;
        vm.params.hitId = $stateParams.hitId;
        vm.params.submitTo = $stateParams.submitTo;
        //For chaining tasks, this will either be set to 1 for chaining, or -1 for  not existent or 0 for not chaining
        vm.params.chain = $stateParams.chain || -1;
        vm.params.fromChain = $stateParams.fromChain || -1;
        var genetic = $stateParams.genetic;
        var genetic_tree = $stateParams.tree;
        var qlearn = $stateParams.qlearn;
        vm.params.participantId= $stateParams.participantId;
        vm.params.trialId= $stateParams.trialId;
        var image_loop = $stateParams.image_loop;



        vm.googleMapsUrl= "https://maps.googleapis.com/maps/api/js?key="+googleMapAPIKey;
        // console.log('$scope.params.project ',vm.params);
        vm.goTo=5;
        vm.showTutorialLink = false;

        vm.annotated = false;


        vm.fetchCenter = fetchCenter;
        vm.centerChanged = centerChanged;
        vm.zoomChanged = zoomChanged;
        vm.show_Correct_Options = show_Correct_Options;
        vm.next_button = next_button;
        vm.start = start;
        vm.map_init = map_init;
        vm.zoomToMarker = zoomToMarker;
        vm.getFullIframe = getFullIframe;

        var dZoom = 15;


        //markers for marker task
        $scope.point_array =  ['/images/markers/marker_green2.svg',
            '/images/markers/marker_yellow2.svg',
            '/images/markers/marker_orange2.svg',
            '/images/markers/marker_red2.svg',
            '/images/markers/marker_blue2.svg',
            '/images/markers/marker_purple2.svg',
            '/images/markers/marker_grey.svg'];

        //colors to match icons
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


        function fetchCenter(){
            //console.log('In get Center ');
            var lng = vm.tutorialMapping[vm.counter].lat;
            var lat = vm.tutorialMapping[vm.counter].lng;
            return [lat,lng];
        }

        function centerChanged() {
            NgMap.getMap({id:'main_map'}).then(function(point_map) {
                vm.centerLat = point_map.getCenter().lat();
                vm.centerLng = point_map.getCenter().lng();
                // latCenter = point_map.getCenter().lat();
                // lngCenter = point_map.getCenter().lng();
            });
        }

        function zoomChanged() {
            //console.log('IN ZOom CHnaged'+ vm.map.getCenter().lat(), vm.map.getCenter().lng());
            NgMap.getMap().then(function(point_map) {
                vm.centerLat = point_map.getCenter().lat();
                vm.centerLng = point_map.getCenter().lng();
                // latCenter = point_map.getCenter().lat();
                // lngCenter = point_map.getCenter().lng();
            })

        }

        // $('#info_modal').on('hidden.bs.modal', function (e) {
        //     //trigger zoom to marker when info modal dismissed
        //     vm.zoomToMarker(vm.tutorialMapping[vm.counter])
        // });

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
                            marker.setIcon($scope.point_array[item.col_number - 1])
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


        //function that rearranges tutorial order based on Array with ids
        function rearrangeTutorial(tutorialArray,seqArray) {
            var resArray = [];
            seqArray.forEach(function (item){
                var tItem = tutorialArray.filter(function( obj ) {
                    return obj.id == item;
                });
                resArray.push(tItem[0]);
            }) ;
            return resArray


        }

        function next_button() {

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

                    document.getElementById("correct-note").style.visibility = "hidden";
                    document.getElementById("tut_next").style.visibility = "hidden";
                    document.getElementById("tut_text").style.visibility = "hidden";
                }
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


                var l_answer = vm.tutorial[vm.counter].answer;
                if (l_answer.toLowerCase() != option.toLowerCase()) {
                    vm.annotated = false; //show annotated image if available
                    return alert("Your input is incorrect. Please try again.");

                } else {
                    vm.annotated = true; //show annotated image if available

                }

                // console.log('in correct options');
                document.getElementById("correct-note").style.visibility = "visible";
                document.getElementById("tut_next").style.visibility = "visible";


            }

            if (vm.counter == vm.goTo) {

                //alert("Pay attention! You may encounter these images again in the task. Answering them correctly will give you a bonus!")


                if(vm.params.projectType == 'mapping'){
                    document.getElementById("tut_start_mapping").style.visibility = "visible";
                    document.getElementById("tut_next_mapping").style.visibility = "none";
                } else {
                    document.getElementById("tut_start").style.visibility = "visible";
                    document.getElementById("tut_next").style.visibility = "none";
                }

                //Get the link to more training
                $http.get('/api/tasks/getInfoFree/' + $stateParams.pCode).then(function(pdata) {

                    vm.tutorial_link = pdata.data[0].tutorial_link;
                    if (vm.tutorial_link != null && vm.tutorial_link != undefined){
                        vm.showTutorialLink = true;
                    }
                });

            }

            $('html,body').animate({
                    scrollTop: $("#correct-note").offset().top},
                'slow');
        };

        function start() {
            var reqParams = {};
            for (var i in vm.params) {
                if (i == 'workerId' || i == 'assignmentId' || i == 'hitId' || i == 'submitTo' || i == 'kioskId' || i=="participantId" || i=="trialId") {
                    reqParams[i] = vm.params[i];
                }
            }

            var qs = '';

            for (i in reqParams) {
                qs += '&' + i + '=' + reqParams[i];
            }

            //for chaining: add the chain parameter
            qs += '&chain=' + vm.params.chain;
            //for chaining: add the chain parameter
            qs += '&fromChain=' + vm.params.fromChain;
            //for genetic
            if (parseInt(genetic)){
                qs += '&genetic=' + genetic;
            }

            //for genetic
            if (parseInt(genetic_tree)){
                qs += '&tree=' + genetic_tree;
            }
            //for genetic
            if (parseInt(qlearn)){
                qs += '&qlearn=' + qlearn;
            }

            if (parseInt(image_loop)){
                qs += '&image_loop=' + image_loop
            }




            //console.log('reqParams ', reqParams);
            if(reqParams.kioskId==1){
                window.location.replace('/api/anon/startKiosk/' + vm.params.project + '?' + 'workerId='+ vm.params.workerId+'&kioskUser=1');
            } else{

                window.location.replace('/api/anon/startAnon/' + vm.params.project + '?' + qs.substr(1));
            }


        };

        var button_cols = {
            '4': '#ff0000',    //red
            '1': '#9cdc1f',   //green
            '5': '#0000ff',     //blue
            '3': '#ffa500',   //orange
            '2': '#ffff00',   //yellow
            '6': '#8a2be2'  //purple

        };

        //Get project info here to check for genetic
        $http.get('/api/tasks/getInfoFree/' + vm.params.project).then(function(data) {

            var query = '/api/project/getTutorial/';
            $scope.genetic  = data.data[0].genetic;


            if ($scope.genetic == 1) {
                var query = '/api/project/getTutorialSequence/';
            }



            $http.get(query + vm.params.project).then(function(tdata) {


                // tutorial data
                var tutData = tdata.data;

                //if genetic, rearrange order to specific sequence
                if ($scope.genetic == 1) {
                    //get sequence from results
                    var sequence = tutData[0].seq;
                    var seqArray = sequence.split("-");


                    //Post back to server to keep track of workers with sequences:
                    var seq_info = {
                        projectCode: vm.params.project,
                        hitID: vm.params.hitId,
                        sequence: sequence,
                        workerID: vm.params.workerId
                    };

                    $http.post('/api/project/addWorkerTutorial', seq_info);

                    if (seqArray[0] == "0"){
                        console.log("No tutorial!");
                        start();
                    }


                    //rearrange tutorial Array
                    var retutData = rearrangeTutorial(tutData,seqArray);
                    tutData = retutData;


                }




                var template  = JSON.parse(tutData[0].template);
                vm.question = template.question;
                vm.counter = 0;
                //get question from results
                vm.goTo = tutData.length -1;


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
                        tutpath = '/api/tasks/getImageFree/' + data.data[0].dataset_id + '/'
                    }

                    var it_annot = tutpath + item.image_name;
                    if (item.image_annotation){
                        it_annot = '../../images/Tutorials/' + item.image_annotation;
                    }

                    var obj = {
                        image: tutpath + item.image_name,
                        answer: item.answer,
                        text: item.explanation,
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
                        image_annotation: it_annot

                    };
                    if( vm.params.projectType != 'mapping') {

                        vm.tutorial.push(obj)
                    } else {
                        vm.tutorialMapping.push(obj)
                    }

                });



                if(vm.params.projectType == 'mapping'){

                    vm.map_init();
                }

            });

        });




    }]);

module.controller('exampleGeneticController', ['$window', '$scope', '$state', '$stateParams','NgMap', '$timeout', '$http','$q', '$sce', 'googleMapAPIKey', '$location',
    function($window, $scope, $state, $stateParams, NgMap, $timeout, $http, $q , $sce, googleMapAPIKey, $location) {
        var vm = this;
        vm.params={};

        $window.document.title = "Examples";

        vm.params.project= $stateParams.pCode;
        vm.params.workerId= $stateParams.workerId;
        vm.params.kioskId= $stateParams.kioskId;
        vm.params.projectType = $stateParams.projectType;
        vm.params.assignmentId = $stateParams.assignmentId;
        vm.params.hitId = $stateParams.hitId;
        vm.params.submitTo = $stateParams.submitTo;
        //For chaining tasks, this will either be set to 1 for chaining, or -1 for  not existent or 0 for not chaining
        vm.params.chain = $stateParams.chain || -1;
        vm.params.fromChain = $stateParams.fromChain || -1;
        var genetic = $stateParams.genetic;
        var genetic_tree = $stateParams.tree;
        var qlearn = $stateParams.qlearn;
        vm.params.participantId= $stateParams.participantId;
        vm.params.trialId= $stateParams.trialId;

        vm.showMapModal = true;


        vm.googleMapsUrl= "https://maps.googleapis.com/maps/api/js?key="+googleMapAPIKey;
        // console.log('$scope.params.project ',vm.params);
        vm.showTutorialLink = false;


        vm.fetchCenter = fetchCenter;
        vm.centerChanged = centerChanged;
        vm.zoomChanged = zoomChanged;
        vm.show_Correct_Options = show_Correct_Options;
        vm.next_button = next_button;
        vm.start = start;
        vm.map_init = map_init;
        vm.zoomToMarker = zoomToMarker;
        vm.getFullIframe = getFullIframeGen;


        var dZoom = 15;


        //markers for marker task
        $scope.point_array =  ['/images/markers/marker_green2.svg',
            '/images/markers/marker_yellow2.svg',
            '/images/markers/marker_orange2.svg',
            '/images/markers/marker_red2.svg',
            '/images/markers/marker_blue2.svg',
            '/images/markers/marker_purple2.svg',
            '/images/markers/marker_grey.svg'];

        //colors to match icons
        $scope.button_cols = ['#9cdc1f','#ffff00','#ffa500','#ff0000','#0000ff','#8a2be2',"gray"];


        //for NGS tasks
        function getFullIframeGen(){


            if ( vm.tutorial_gen != undefined && vm.tutorial_gen.length > 0 && vm.current_object != undefined){
                var link = vm.current_object.image_source;
                var zoom = vm.current_object.zoom;
                var x = vm.current_object.lat;
                var y = vm.current_object.lng;
                var url = link + '#' + zoom + '/'+  x + '/' + y;
                return  $sce.trustAsResourceUrl(url)
            }

        };


        vm.setGeneticObject = function(){

            //set the current project details
            vm.current_object = vm.tutorial_gen[0];
            vm.question = vm.current_object.question;
            vm.projectType = vm.current_object.task_type;
            vm.showMarkers = vm.current_object.point_selection;
            vm.points_file = vm.current_object.points_file;
            vm.current_unique_code = vm.current_object.unique_code;
            vm.tutorial_link = vm.current_object.tutorial_link;
            vm.lat = vm.current_object.lat;
            vm.lang = vm.current_object.lng;
            vm.image_source  = vm.current_object.image_source;
            if (vm.tutorial_link != undefined){
                vm.showTutorialLink = true;
            }
            //if mapping, init the map
            if (vm.projectType == "mapping"){

                map_init();
            }
            //item consumed, will shift now to have next ready
            vm.tutorial_gen.shift();
            console.log(vm.tutorial_gen[0]);

        };

        //Function filterResponses: filter array based on some criteria
        function filterResponses(array, criteria) {
            return array.filter(function (obj) {
                return Object.keys(criteria).every(function (c) {
                    return obj[c] == criteria[c];
                });})
        };


        function map_init(){

            var map={};
            vm.map={};
            //Map initialization
            NgMap.getMap().then(function(map) {
                vm.map = map;
                console.log(map);

                // console.log(vm.tutorialMapping[vm.counter].lat, vm.tutorialMapping[vm.counter].lng);

                var myLatlng = new google.maps.LatLng(Number(vm.current_object.lat),
                    Number(vm.current_object.lng));
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

                    var tmpl = vm.current_object.options;
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


                    //FILTER ITEMS THAT HAVE MARKERS and the unique code here
                    //Filter from all markers, all the responses of this project
                    vm.markerObjects = filterResponses(
                        vm.tutorial_gen_all, {unique_code: vm.current_unique_code});


                    // For every item in the tutorial table, put the marker on the map
                    vm.markerObjects.forEach(function(item){

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

            //show heplful modal for map only once!
            if (vm.showMapModal){
                $(document).ready(function(){
                    //Show help modal at the beginning:
                    $("#info_modal").modal('show')
                });
                vm.showMapModal = false;
            }


        }


        function fetchCenter(){
            //console.log('In get Center ');
            var lng = vm.current_object.lat;
            var lat = vm.current_object.lng;
            return [lat,lng];
        }

        function centerChanged() {
            NgMap.getMap({id:'main_map'}).then(function(point_map) {
                vm.centerLat = point_map.getCenter().lat();
                vm.centerLng = point_map.getCenter().lng();
                // latCenter = point_map.getCenter().lat();
                // lngCenter = point_map.getCenter().lng();
            });
        }

        function zoomChanged() {
            //console.log('IN ZOom CHnaged'+ vm.map.getCenter().lat(), vm.map.getCenter().lng());
            NgMap.getMap().then(function(point_map) {
                vm.centerLat = point_map.getCenter().lat();
                vm.centerLng = point_map.getCenter().lng();
                // latCenter = point_map.getCenter().lat();
                // lngCenter = point_map.getCenter().lng();
            })

        }

        // $('#info_modal').on('hidden.bs.modal', function (e) {
        //     //trigger zoom to marker when info modal dismissed
        //     vm.zoomToMarker(vm.tutorialMapping[vm.counter])
        // });

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
                            marker.setIcon($scope.point_array[item.col_number - 1])
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


        //function that rearranges tutorial order based on Array with ids
        function rearrangeTutorial(tutorialArray,seqArray) {
            var resArray = [];
            seqArray.forEach(function (item){
                var tItem = tutorialArray.filter(function( obj ) {
                    return obj.id == item;
                });
                resArray.push(tItem[0]);
            }) ;
            return resArray


        }

        function resetTextVisibility(type){

            if (type == "tagging" ||type == "ngs" ) {
                document.getElementById("correct-note").style.visibility = "hidden";
                document.getElementById("tut_next").style.visibility = "hidden";
                document.getElementById("tut_text").style.visibility = "hidden";

            } else {
                document.getElementById("correct-note-mapping").style.visibility = "hidden";
                document.getElementById("tut_next_mapping").style.visibility = "hidden";
                document.getElementById("tut_text_mapping").style.visibility = "hidden";
                document.getElementById("markerShowAnswerButton").style.display = "block";

            }

        }


        function next_button() {

            resetTextVisibility(vm.projectType);
            vm.setGeneticObject();



            if (vm.tutorial_gen.length == 0){
                //handle end of tutorial
                if(vm.projectType == 'mapping'){
                    document.getElementById("tut_next_mapping").style.display = "none";
                } else {
                    document.getElementById("tut_next").style.display = "none";
                }
            }

        };

        function show_Correct_Options(option) {


            if(vm.projectType == 'mapping'){

                document.getElementById("markerShowAnswerButton").style.display = "none";
                vm.zoomToMarker(vm.current_object); //will work only on marker projects

                document.getElementById("correct-note-mapping").style.visibility = "visible";
                document.getElementById("tut_next_mapping").style.visibility = "visible";
                document.getElementById("tut_text_mapping").style.visibility = "visible";

            } else {

                var l_answer = vm.current_object.answer;
                if (l_answer.toLowerCase() != option.toLowerCase()) {

                    return alert("Your input is incorrect. Please try again.");
                }

                // console.log('in correct options');
                document.getElementById("correct-note").style.visibility = "visible";
                document.getElementById("tut_next").style.visibility = "visible";
            }
            //need to hide the next button and show the start button
            console.log(vm.tutorial_gen.length);
            if (vm.tutorial_gen.length == 0) {

                //alert("Pay attention! You may encounter these images again in the task. Answering them correctly will give you a bonus!")

                //hide all next buttons!
                document.getElementById("tut_next_mapping").style.visibility = "none";
                document.getElementById("tut_next").style.visibility = "none";


                if(vm.projectType == 'mapping'){
                    document.getElementById("tut_start_mapping").style.visibility = "visible";
                } else {
                    document.getElementById("tut_start").style.visibility = "visible";
                }


                    if (vm.tutorial_link != null && vm.tutorial_link != undefined){
                        vm.showTutorialLink = true;
                    }

            }

            $('html,body').animate({
                    scrollTop: $("#correct-note").offset().top},
                'slow');
        };

        function start() {
            var reqParams = {};



            for (var i in vm.params) {
                if (i == 'workerId' || i == 'assignmentId' || i == 'hitId' || i == 'submitTo' || i == 'kioskId' || i=="participantId" || i=="trialId") {
                    reqParams[i] = vm.params[i];
                }
            }

            var qs = '';

            for (i in reqParams) {
                qs += '&' + i + '=' + reqParams[i];
            }

            //for chaining: add the chain parameter
            qs += '&chain=' + vm.params.chain;
            //for chaining: add the chain parameter
            qs += '&fromChain=' + vm.params.fromChain;
            //for genetic
            if (parseInt(genetic)){
                qs += '&genetic=' + genetic;
            }
            //for tree
            if (parseInt(genetic_tree)){
                qs += '&tree=' + genetic_tree;
            }
            //for qlearn
            if (parseInt(qlearn)){
                qs += '&qlearn=' + qlearn;
            }


            //console.log('reqParams ', reqParams);
            if(reqParams.kioskId==1){
                window.location.replace('/api/anon/startKiosk/' + vm.params.project + '?' + 'workerId='+ vm.params.workerId+'&kioskUser=1');
            } else{

                window.location.replace('/api/anon/startAnon/' + vm.params.project + '?' + qs.substr(1));
            }


        };

        var button_cols = {
            '4': '#ff0000',    //red
            '1': '#9cdc1f',   //green
            '5': '#0000ff',     //blue
            '3': '#ffa500',   //orange
            '2': '#ffff00',   //yellow
            '6': '#8a2be2'  //purple

        };



            //Get project info here to check for genetic
            //Draw a random genetic task sequence and all the tutorial objects associated with it:
            //Once the time has come to start, we will send over that genetic id to be associated with the user we created
            $http.get('/api/project/getGeneticTutorialItems/' + vm.params.project).then(function(tdata) {

                // tutorial data
                var tutData = tdata.data; //tutorial objects
                vm.points_file = tutData[0].points_file;
                vm.tutorial_gen = [];
                vm.tutorial_gen_all = [];

                console.log(tutData)


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

                    var obj = {
                        image: '../../images/Tutorials/' + item.image_name,
                        question: tmpl.question,
                        unique_code: item.unique_code,
                        point_selection: item.point_selection,
                        points_file: item.points_file,
                        answer: item.answer,
                        text: item.explanation,
                        color: sel_col,
                        options: opt,
                        lat: parseFloat(item.x) ,
                        lng: parseFloat(item.y),
                        zoom: item.zoom ||  18,
                        heading: 0,
                        tilt: 0,
                        col_number : parseInt(sel_num),
                        poi_name : item.poi_name || '',
                        task_type : tmpl.selectedTaskType,
                        image_source : item.image_source
                    };
                    vm.tutorial_gen.push(obj);
                    vm.tutorial_gen_all.push(obj);

                });



                //start the sequence
                vm.setGeneticObject();


            });




    }]);


module.controller('mTurkController', ['$window','$scope','$location','$state','$stateParams',function($window, $scope,$location,$state,$stateParams){

    $window.document.title = "Cartoscope";


    $scope.begin = function() {
        console.log('Begin....');
        //console.log($stateParams);

        $scope.params = $location.search();
        $scope.params.project= $stateParams.pCode;
        var reqParams = {};


        //TODO: if worker_id,assignmentid hit id submit to not in parameters, then we need trialId and to create a worker id as participant id

        if (!$scope.params.hasOwnProperty("workerId") && $scope.params.hasOwnProperty("trialId") ){

            reqParams["participantId"] =  uuid.v4();
            console.log( reqParams["participantId"]);
            reqParams["trialId"] = $scope.params.trialId;

        }

        for (var i in $scope.params) {
            if (i == 'workerId' || i == 'assignmentId' || i == 'hitId' || i == 'submitTo') {
                reqParams[i] = $scope.params[i];
            }
        }

        var qs = '';

        for (i in reqParams) {
            qs += '&' + i + '=' + reqParams[i];
        }

        //if genetic in params, pass it
        if ($scope.params.genetic == "1"){
            qs += '&genetic=1'
        }

        //if tree in params, pass it
        if ($scope.params.tree == "1"){
            qs += '&tree=1'
        }
        //if qlearn in params, pass it
        if ($scope.params.qlearn == "1"){
            qs += '&qlearn=1'
        }
        //if image_loop in params, pass it
        if ($scope.params.image_loop == "1"){
            qs += '&image_loop=1'
        }

        window.location.replace('/api/anon/startAnon/' + $scope.params.project + '?' + qs.substr(1));
    }
}]);

module.controller('kioskController', ['$window','$scope','$location','$state','$stateParams','$http', '$cookies',
    function($window,$scope,$location,$state,$stateParams,$http, $cookies){
        $window.document.title = "Cartoscope";
        $scope.begin = function() {
            console.log('Begin in Kiosk Controller....');
            //console.log($stateParams);

            $scope.params = $location.search();
            //check for cookie and set it if it doesnt exist
            //console.log('get cookie', $cookies.get('kioskUser'));
            if(!$cookies.get('kioskUser')){
                $cookies.put('kioskUser', new Date().getMilliseconds(),{
                    expires: '99983090'
                });
            }

            //console.log('cookies ', $cookies.get('kioskUser'));


            //getProjects Code dynamically
            $http.get('/api/anon/startKiosk/').then(function(e, data) {
                //console.log('e', e, data);
                $scope.params.project = e.data.projectID;
                $scope.workerId = e.data.workerID;

                $http.get('/api/anon/consentKiosk/' + $scope.params.project + '?' + 'workerId='+ $scope.workerId).then(function(e, data) {
                    //console.log('data ', e.data.workerId);
                    $state.go('examples', {pCode: $scope.params.project, workerId: e.data.workerId, kioskId:1});
                    //window.location.replace('/api/anon/startKiosk/' + $scope.params.project+ '?workerId='+e.data.workerId+'&kioskId=1');
                }, function(err) {
                    alert('error'+ err);
                });

            }, function(err) {
                //console.log('error', err);
            });
        }
    }]);

module.controller('instructionController', ['$window','$scope', '$state','$stateParams','$location', '$http',
    function($window, $scope, $state, $stateParams, $location, $http) {
        //console.log('locations  ', $state);
        $window.document.title = "Instructions";
        if($stateParams.kioskId){
            $scope.params.project= $stateParams.pCode;
            $scope.params.workerId= $stateParams.workerId;
            $scope.params.kioskId =  $stateParams.kioskId;
        }
        $scope.params.projectType = $stateParams.projectType;
        var genetic = $scope.params.genetic || 0;
        var genetic_tree = $scope.params.tree || 0;
        var qlearn = $scope.params.qlearn || 0;
        var image_loop = $scope.params.image_loop || 0;

        //Check if coming with mturk parameters or not

        //if coming with different set of parameters
        $scope.no_turk_params = 0;

        console.log($scope.params);

        if ($scope.params.hasOwnProperty("participantId") && $scope.params.hasOwnProperty("trialId") ){
            $scope.no_turk_params = 1;
        }



        //Get the project info to see how many required
        $http.get('/api/tasks/getInfoFree/' + $scope.params.project).then(function(data) {

            $scope.req_amount  = data.data[0].req_count;

            if (parseInt($scope.req_amount) == 0) {

                // $scope.req_text = "You may complete any number of subtasks before clicking the \"Go to Survey\" button to finish."
                $scope.req_text = "You may categorize any number of images before clicking the \"Go to Survey\" button to finish."

                $scope.req_text2 = "may complete any number of"
            } else {
                $scope.req_text = "You must categorize at least " + $scope.req_amount + " images   in order to continue to the survey."
                $scope.req_text2 = "must complete " + $scope.req_amount + " "
            }


        });


        //if we came from chained project, all our info is in the url
        var fromChain = $location.search().fromChain || 0;
        if (fromChain) {
            $scope.params.project = $location.search().code;
            $scope.params.workerId = $location.search().workerID || $location.search().participantID;
            $scope.params.hitId = $location.search().hitID;
            $scope.params.assignmentId = $location.search().assignmentID
            $scope.params.projectType = $location.search().type;
            $scope.params.chain =  $location.search().chain;
            $scope.params.kioskId = 0;
            //need to get the project type from db
            $http.get('/api/tasks/getInfoFree/' + $scope.params.project).then(function(data) {
                var templ = JSON.parse(data.data[0].template);
                $scope.params.projectType =  templ.selectedTaskType
            });
        }

        //Only show Chain Instructions if chain flag is 1
        $scope.showChainInstr = 0;
        if ($scope.params.chain == 1){
            $scope.showChainInstr = 1;
        }


        $scope.showExamples = function() {
            //console.log('params', $scope, $scope.params);
            //console.log('examples/:' + $scope.params.project);

            if ($stateParams.kioskId) {
                $state.go('examples', {
                    pCode: $scope.params.project,
                    workerId: $scope.params.workerId,
                    kioskId: $scope.params.kioskId
                });
            } else {
                var state_name = 'examples';
                if (genetic || genetic_tree || qlearn){
                    state_name = 'examplesGenetic';
                }

                var stateP = {
                    pCode: $scope.params.project,
                    projectType:  $scope.params.projectType,
                    //If we are chaining projects, we must have reached this part with chain=1, otherwise set it to 0
                    chain: $scope.params.chain,
                    fromChain: fromChain,
                    genetic: genetic,
                    tree: genetic_tree,
                    qlearn:qlearn,
                    image_loop: image_loop
                };

                //adjust parameters depending on mturk platform
                if ($scope.no_turk_params){


                    stateP.participantId = $scope.params.participantId;
                    stateP.trialId = $scope.params.trialId;

                } else {

                    stateP.workerId = $scope.params.workerId;
                    stateP.assignmentId = $scope.params.assignmentId;
                    stateP.hitId = $scope.params.hitId;
                    stateP.submitTo = $scope.params.submitTo || 'www.mturk.com';

                }

                $state.go(state_name,stateP );
            }

        }

    }]);

module.controller('consentController', ['$scope', '$http', '$state',"uuid",
    function($scope, $http, $state,uuid) {


        $scope.no_turk_params = 0;


        $scope.agree = function() {
            var reqParams = {};


            //if coming with different set of parameters, create uuid as worker id
            if (!$scope.params.hasOwnProperty("workerId") && $scope.params.hasOwnProperty("trialId") ){

                $scope.params["participantId"] =  uuid.v4();
                $scope.no_turk_params = 1;
            }



            for (var i in $scope.params) {
                if (i == 'workerId' || i == 'assignmentId' || i == 'hitId' || i == 'submitTo' || i =="participantId" || i=="trialId") {
                    reqParams[i] = $scope.params[i];
                }
            }

            var qs = '';

            for (i in reqParams) {
                qs += '&' + i + '=' + reqParams[i];
            }

            //If we wish to chain projects one after the other, check the chain parameter
            // If chain is there, pass it along, else make it -1 to indicate it was never there
            var chain = $scope.params.chain || -1;
            qs += '&chain=' + chain;

            //CHECK IF genetic in parameters and pass it to anon/consent
            var genetic = 0;
            if ($scope.params.genetic == "1"){
                qs += '&genetic=1';
                genetic = 1;
            };

            var genetic_tree = 0;
            if ($scope.params.tree == "1"){
                qs += '&tree=1';
                genetic_tree = 1;
            };
            var qlearn = 0;
            if ($scope.params.qlearn == "1"){
                qs += '&qlearn=1';
                qlearn = 1;
            };

            //console.log(qs.substr(1));
            $http.get('/api/anon/consent/' + $scope.params.project + '?' + qs.substr(1)).then(function(e, data) {
                $scope.project = e.data.project;
                var type= JSON.parse($scope.project.template);
                $scope.projectType = type.selectedTaskType;

                if ($scope.no_turk_params){
                    $state.go('instruction', {participantId: $scope.params.participantId,
                         trialId:$scope.params.trialId,
                        projectType:  $scope.projectType, chain: chain, genetic: genetic,tree:genetic_tree,qlearn:qlearn});

                } else {
                    $state.go('instruction', {workerId: $scope.params.workerId,
                        assignmentId: $scope.params.assignmentId, hitId:$scope.params.hitId, submitTo: $scope.params.submitTo,
                        projectType:  $scope.projectType, chain: chain, genetic: genetic,tree:genetic_tree,qlearn:qlearn});
                }


                // window.location.replace('/api/anon/startAnon/' + $scope.params.project + '?' + qs.substr(1));
            }, function(err) {
                console.log(err);
            });
        };
    }]);
