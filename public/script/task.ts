/**
 * Created by kiprasad on 26/09/16.
 */
var module = angular.module('taskApp', ['ui.router', 'ngMap','configApp','ngJuxtapose']);
let shuffle = (inA: Array<any>) => {
  let a = inA.slice(0);
  for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

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

function getRandomIntInclusive(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
}

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

// I deleted commented out map controller code here, see git if you want to look at it

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
      vm.ngs_before_image_link = "../../images/ngs_hint.png"
     


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

      /* ==============================
       * CAIRN CODE
       * TODO can this be abstracted to another file? I don't know how angular wooorks
       * ============================== */ 
      
      vm.tasksToCompleteTillPhysics   = 5;
      vm.tasksToCompleteTillSoapstone = 3;

      // show elements such as the continue / skip buttons
      // and the cairn-header
      $scope.showCairnElements = false;
      
      // What cairn is currently showing on screen?
      enum cairnState {
          noCairn,
          emojiGreet,
          soapstoneGreet,
          emojiMain,
          soapstoneMsgTypePick,
          soapstoneSign,
          soapstoneMain,
          soapstoneThankYou
      }

      vm.hitID = $location.search().hitID || $location.search().trialID || "kiosk";
      vm.hitIDSplit = vm.hitID.split('_');
      vm.cairnsInfoArray = vm.hitIDSplit.length > 2 && vm.hitIDSplit[2].split("-")[0] === "cairns" ? vm.hitIDSplit[2].split("-").slice(1) : null;

      enum cairnTypes {
          none     ,
          both     ,
          soapstone,
          emoji           
      }

      // if it's the main task, it should be "noCairn"
      vm.cairnState = cairnState.noCairn;
      vm.tasksUntilNextCairn = 5;
      vm.nextCairnToShow = cairnTypes.none;

      vm.handleCairns = () => {
          console.assert(vm.cairnState === cairnState.noCairn, "cairn state is not noCairn, despite the main task showing");
          let cairnMode  = cairnTypes.none;
          if (vm.cairnsInfoArray === null) return;
          else if (vm.cairnsInfoArray[0] === "b") cairnMode = cairnTypes.both;
          else if (vm.cairnsInfoArray[0] === "e") cairnMode = cairnTypes.emoji;
          else if (vm.cairnsInfoArray[0] === "s") cairnMode = cairnTypes.soapstone;
          else if (vm.cairnsInfoArray[0] === "n") return;
          else console.error("a cairns style hitID was passed, but the cairn type was not in [n,e,s,b]");
          // note the time the cairn was created. Divide by 1000 because mysql wants second precision, not ms precision
          let resetCairnCounter = () => {
              vm.tasksUntilNextCairn = getRandomIntInclusive(parseInt(vm.cairnsInfoArray[1]), parseInt(vm.cairnsInfoArray[2])) - 1;
          }
          vm.timeCairnShownToPlayer = Math.floor(Date.now() / 1000);

          // initialize the counter. I'd like to initialize it outside, but it needs to be different based on debug mode
          if (vm.tasksUntilNextCairn === -1) resetCairnCounter();
          if (vm.tasksUntilNextCairn > 0) 
              vm.tasksUntilNextCairn--;
          else {
              resetCairnCounter();
              if (cairnMode === cairnTypes.soapstone)
                  vm.startSoapstoneCairn();
              else if (cairnMode === cairnTypes.emoji)
                  vm.startEmojiCairn();
              else if (cairnMode === cairnTypes.both) {
                  // If we are supposed to show both cairns, alternate between them, starting with a random one
                  if (vm.nextCairnToShow === cairnTypes.none) 
                      vm.nextCairnToShow = getRandomIntInclusive(0, 1) === 1 ? cairnTypes.emoji : cairnTypes.soapstone;
                  if (vm.nextCairnToShow === cairnTypes.soapstone) {
                      vm.nextCairnToShow = cairnTypes.emoji;
                      vm.startSoapstoneCairn();
                  }
                  else {
                      vm.nextCairnToShow = cairnTypes.soapstone;
                      vm.startEmojiCairn();
                  }
              }
          }
      }

      // Submit a cairn to the database
      vm.submitCairn = (baseCairnType: string, message: string) => {
          // if the message is empty, the cairnType should be "empty-" + cairnType
          let cairnType = message.length === 0 ? "empty-" + baseCairnType : baseCairnType;
          let timeCairnSubmitted = Math.floor(Date.now() / 1000);
          console.log("submitting cairn of type " + cairnType + " with message " + message);
          let body = {
              projectID:                  vm.data.id,
              hitID:                      vm.hitID,
              message:                    encodeURI(message),
              cairnType:                  cairnType,
              progress:                   vm.data.progress - 1,
              timeWhenCairnShownToPlayer: vm.timeCairnShownToPlayer,
              timeCairnSubmitted:         timeCairnSubmitted,
              taskName:                   vm.previousTaskName
          };
          $http.post('api/tasks/submitCairn', body).then((data: object) => console.log(data));
      }

      $scope.showDebug = false;
      // activated by hitting the debug button
      vm.handleDebug = () => {
          console.log("Debugging");
      }

      vm.wasContinueHit = false;
      vm.wasBackHit     = false;
      vm.wasSkipHit     = false;
      // depending on the state, and what button was pressed, handle it differently
      vm.handleCairnContinue = () => {
          vm.wasContinueHit = true;
          vm.wasBackHit     = false;
          vm.wasSkipHit     = false;
          switch(vm.cairnState) {
              case cairnState.soapstoneGreet:
                  vm.soapstoneMsgTypePick(); break;
              case cairnState.soapstoneMsgTypePick:
                  vm.storeMsgTypePick(); vm.soapstoneMain(); break;
              case cairnState.soapstoneMain:
                  vm.extractSoapstone(); vm.soapstoneSign(); break;
              case cairnState.soapstoneSign:
                  if (vm.chosenSignature === "") vm.showToast("No avatar chosen!");
                  else vm.soapstoneThankYou(); 
                  break;
              case cairnState.soapstoneThankYou:
                  vm.soapstoneFinish(); break;
              case cairnState.emojiGreet:
                  vm.startEmojiCreate(); break;
              case cairnState.emojiMain:
                  vm.finishEmojiCreate(); break;
              default:
                  console.error("Handling an unknown cairn state");
          }
      }

      vm.handleCairnSkip = () => {
          vm.wasContinueHit = false;
          vm.wasBackHit     = false;
          vm.wasSkipHit     = true;
          switch(vm.cairnState) {
              case cairnState.soapstoneGreet:
                  vm.submitEmptySoapstone(); break;
              case cairnState.soapstoneMsgTypePick:
                  vm.submitEmptySoapstone(); break;
              case cairnState.soapstoneMain:
                  vm.submitEmptySoapstone(); break;
              case cairnState.soapstoneSign:
                  vm.chosenSignature = "";
                  vm.soapstoneThankYou(); break;
              case cairnState.soapstoneThankYou:
                  vm.soapstoneFinish(); break;
              case cairnState.emojiGreet:
                  vm.finishEmojiCreate(); break;
              case cairnState.emojiMain:
                  vm.finishEmojiCreate(); break;
              default:
                  console.error("Handling an unknown cairn state");
          }
      }

      vm.handleCairnBack = () => {
          vm.wasContinueHit = false;
          vm.wasBackHit     = true;
          vm.wasSkipHit     = false;
          switch(vm.cairnState) {
              case cairnState.soapstoneGreet:
                  vm.showToast("Can't go back here"); break;
              case cairnState.soapstoneMsgTypePick:
                  vm.showToast("Can't go back here"); break;
              case cairnState.soapstoneMain:
                  vm.soapstoneMsgTypePick(); break;
              case cairnState.soapstoneSign:
                  vm.chosenSignature = "";
                  vm.soapstoneMain(); break;
              case cairnState.soapstoneThankYou:
                  vm.showToast("Can't go back here"); break;
              case cairnState.emojiGreet:
                  vm.showToast("Can't go back here"); break;
              case cairnState.emojiMain:
                  vm.showToast("Can't go back here"); break;
              default:
                  console.error("Handling an unknown cairn state");
          }
      }

      // == SOAPSTONE MSG CODE ==
      vm.showSoapstoneMsgToast = () => {
          // This function is as of now unused and has been replaced with sidebar soapstone messages
          let body = { projectID: vm.data.id, cairnType: "soapstone" };
          // TODO this should be a get, but gets have to have body as part of the url
          $http.post('api/tasks/getCairns', body).then((serverReturn: any) => {
              if (serverReturn.data.length > 0) {
                  let message: string = "Another user left you a message: <br><br>" + serverReturn.data[0].message;
                  vm.showToast(message);
              }
              else {
                  console.error("No relevant soapstone messages found");
              }
          });
      }

      vm.showToast = (message: string) => {
          Toastify({
              text:            message,
              duration:        5000,
              close:           true,
              gravity:         "top", // `top` or `bottom`
              position:        "left",
              escapeMarkup:    false,
              style: {background: "#4663ac"}
          }).showToast();
      }

      /**
       * Populate the sidebar with messages from other players
       * If a message is already in the sidebar, ignore it
       */
      vm.populateMsgSidebar = (numMsgs: number) => {
          console.log("populating sidebar");
          let body = { 
              projectID:       vm.data.id,
              cairnType:       "soapstone",
              numberRequested: numMsgs,
              random:          false,
          };
          // let the messages filter in, with this many ms between them showing up
          let msBetweenMessages = 1000;
          // messages already in the sidebar
          let existingMessages = Array.from(document.getElementsByClassName("cairn-message")).map(p => (p as HTMLParagraphElement).innerText);
          $http.post('api/tasks/getCairns', body).then((serverReturn: object) => {
              console.log(serverReturn);
              if (serverReturn["data"].length > 0)
                  serverReturn["data"]
                      .map((datum: object) => decodeURI(datum["message"]))
                      // remove any messages already in the sidebar 
                      // (yes I could use .include, but some browsers don't support it)
                      .filter((message: string) => existingMessages.filter(existingMsg => existingMsg === message).length === 0)
                      // The messages come in reverse order, so reverse back
                      .reverse()
                      // for each message, add it to the sidebar with a short delay
                      // (that way the messages don't all pop up at once)
                      .forEach((message: string, idx: number) => 
                          setTimeout(() => vm.insertSidebarMsg(message), 
                                     idx * msBetweenMessages));
              else console.error("No relevant soapstone messages found");
          });
      }

      // insert a message into the sidebar
      vm.insertSidebarMsg = (msg: string) => {
          let sidebar = document.getElementById("cairn-sidebar-header");
          let messageElement = document.createElement("p");
          messageElement.innerText = msg;
          messageElement.setAttribute("class", "cairn-message");
          sidebar?.insertAdjacentElement("afterend", messageElement);
      }

      vm.clearMsgSidebar = () => document.querySelectorAll('.cairn-message').forEach(e => e.remove());
      // == END SOAPSTONE MSG CODE ==

      // == SOAPSTONE CREATE CODE ==

      $scope.showSoapstoneForm = false;
      $scope.showSidebar       = false;
      $scope.showContinueBtn   = true;
      $scope.showSkipBtn       = true;
      $scope.showBackBtn       = true;

      // display all elements that need displaying, populate the sidebar
      vm.startSoapstoneCairn = () => {
          vm.cairnState = cairnState.soapstoneGreet;
          document.getElementById("cairn-header")!.innerText = "Would you like to leave a message for other cartoscope players?";
          document.getElementById("soapstone-form")!.innerHTML = "";
          $scope.showSoapstoneForm = true;
          $scope.showSidebar       = true;
          $scope.showMainTask      = false;
          $scope.showCairnElements = true;
          $scope.showBackBtn       = false;
          $scope.showSkipBtn       = true;
          if (!vm.wasBackHit)
              vm.populateMsgSidebar(5);
      }

      // let the player choose what kind of message they want to send to other players
      vm.soapstoneMsgTypePick = () => {
          $scope.showContinueBtn = true;
          $scope.showSkipBtn     = true;
          $scope.showBackBtn     = false;
          vm.cairnState = cairnState.soapstoneMsgTypePick;
          document.getElementById("cairn-header")!.innerText = "What kind of message would you like to leave?";
          vm.selectedMsgType = "";
          let form = document.getElementById("soapstone-form");
          form!.innerHTML = '';
          let selector = document.createElement("select");
          selector.setAttribute("class", "custom-select mr-sm-2");
          // for every soapstone type, make a selector option and add it to this selector
          vm.soapstoneTypes
              .forEach((key: string) => {
                  let option = document.createElement("option");
                  option.setAttribute("value", key);
                  option.innerText = key;
                  selector.appendChild(option);
          });
          // and finally append the selector
          form!.appendChild(selector);
      }

      vm.selectedMsgType = "";
      vm.storeMsgTypePick = () => {
          let soapstoneForm = document.getElementById("soapstone-form") as HTMLFormElement;
          vm.selectedMsgType = (soapstoneForm.elements[0] as HTMLSelectElement).value;
      }

      // Finally build the message for other users
      vm.soapstoneMain = () => {
          $scope.showContinueBtn = true;
          $scope.showBackBtn     = true;
          vm.cairnState = cairnState.soapstoneMain;
          // this does the heavy lifting of populating the form
          let soapstoneForm = document.getElementById("soapstone-form") as HTMLFormElement;
          vm.replaceFormElemsWithSoapstone(soapstoneForm, vm.soapstones[vm.selectedMsgType]);
          vm.extractSoapstone();
          document.getElementById("cairn-header")!.innerHTML = "Build up your message! Your message so far: <br><br>" + vm.soapstoneFormValues;
      }

      vm.soapstones = Object.entries({
              "Thanks": ["Your", ["help", "participation", "effort", "time"], ["is helping to", "shows that you want to"], ["understand the world!", "fight coastal damage!", "save the planet!", "benefit science", "care for the gulf"]],
              "Collaboration": [["Together we can", "I know we can", "Thank you for helping to", "You, me, and the rest of this community can work together to"], ["save the Lousiana wetlands!", "fight environmental damage!", "advance science!"]],
              "Encouragement": ["You", ["are so helpful!", "are doing great!", "can do it!", "are providing so much helpful data!"]],
              "Reassurance": [["Don't worry about getting it exactly right,", "Do your best,", "It's ok if you don't know,", "It's ok if you mess up,"], ["just say what you see", "being wrong isn't the end of the world", "statistical techniques are used to get the most from your answers."]],
              "Concern": ["I", ["feel bored", "am having trouble", "feel angry"], "with", ["these images", "this task", "the state of our environment", "pollution and habitat loss"]]
      }).reduce((acc: object, [k, v]) => {
          acc[k] = v.map((stringOrArry: string | string[]) => 
              typeof(stringOrArry) === "string"
                                ? stringOrArry
                                : shuffle(stringOrArry));
          return acc;
      }, {});

      vm.soapstoneTypes = shuffle(Object.keys(vm.soapstones));

      vm.replaceFormElemsWithSoapstone = (form: HTMLElement, soapstone: (string | string[])[]) => {
          /** given an HTML form and a soapstone template, we want to turn the HTML form into a soapstone form
           *  A soapstone template is an array of (strings, or arrays of strings)
           *  See docs/cairns.md for more information on what soapstones are
           */
          // clear form
          form.innerHTML = '';
          soapstone.forEach(elem => {
              // If the element in the soapstone template is just a simple string, just add a textual label to the form to represent the element
              if (typeof elem === "string") {
                  let label = document.createElement("label");
                  label.innerText = elem;
                  // add spaces around the label to make it look nicer
                  label.innerHTML = "&nbsp;&nbsp;" + label.innerHTML + "&nbsp;&nbsp;";
                  form.appendChild(label);
              }
              else {
                  // but if it's an array of strings, we want to create an options box that allows the user to choose between the various options in this array of strings
                  let selector = document.createElement("select");
                  selector.setAttribute("class", "custom-select mr-sm-2");
                  elem.forEach(optionStr => {
                      let option = document.createElement("option");
                      option.setAttribute("value", optionStr);
                      option.innerText = optionStr;
                      selector.appendChild(option);
                  });
                  selector.onchange = () => {
                      vm.extractSoapstone();
                      document.getElementById("cairn-header")!.innerHTML = "Build up your message! Your message so far: <br><br>" + vm.soapstoneFormValues;
                  }
                  form.appendChild(selector);
              }
          });
      }

      vm.chosenSignature = "";
      // let the user sign their soapstone with an initial
      vm.soapstoneSign = () => {
          if (vm.chosenSignature !== "") {
              vm.soapstoneThankYou();
              return;
          }
          $scope.showContinueBtn = true;
          vm.cairnState = cairnState.soapstoneSign;
          let form = document.getElementById("soapstone-form") as HTMLFormElement;
          form.innerHTML = "";
          let avatars = ["🐵","🐺","🦊","🦁","🐴","🦄","🦏","🐰","🐔","🦆","🐧","🐍","🐉","🐳","🦈","🕷","🦠"]
          avatars.forEach((avatar) => {
              let label = document.createElement("label");
              label.innerHTML = "&nbsp;" + avatar + "&nbsp;";
              label.setAttribute("style", "font-size:80px");
              label.onclick = () => {
                  vm.chosenSignature = avatar;
                  document.getElementById("cairn-header")!.innerText = "Your chosen avatar: " + avatar;
              }
              form.appendChild(label);
          });
          document.getElementById("cairn-header")!.innerText = "Last step! Sign your message, choose from one of the avatars below!";
      }

      vm.soapstoneFormValues = "";
      /**
       * once the user has built their message, this function takes it and puts it in the variable
       * soapstoneFormValues. This function should likely return the value instead for a more functional approach...
       */
      vm.extractSoapstone = () => {
          // extract the user submissions from the soapstone form on the modal
          vm.soapstoneFormValues = Array.from(document.getElementById("soapstone-form")!.children)
              .map((child) => 
                   child.localName === "select" 
                       ? (child as HTMLSelectElement).value
                       : (child as HTMLFormElement).innerText.trim() // remove &nbsp from both sides
                  )
              .join(" ");
      }

      // Once the user has signed, *attempt* to add that initial to soapstoneFormValues
      // doing nothing if something fails
      vm.attemptExtractInitial = () => {
          let textField = document.getElementById("soapstone-form")!.children[0];
          /**
           * If the user skipped the signing process, this will return...
           * or it should, but it actually doesn't work. The second "if" is what 
           * actually catches and returns...
           * Oh well, it works
           */
          if (textField.attributes.getNamedItem("type")!.value !== "text") {
              console.log("Expecting a signature field with a text input")
              return;
          }
          let initial = (textField as HTMLInputElement)
                          .value
                          .slice(0, 1) // get just the first char. Might be unneccessary, but why not
                          .toUpperCase();
          if (initial.length === 0 || initial.match(/^[A-Z]+$/i) === null) {
              console.warn("user initial is not alpha or is empty");
              return;
          }
          vm.soapstoneFormValues += " - " + initial;
      }

      // Show a thank you note and give the user time to see their cairn join the pile
      vm.soapstoneThankYou = () => {
          $scope.showContinueBtn = true;
          $scope.showSkipBtn     = false;
          $scope.showBackBtn     = false;
          $scope.showSoapstoneForm = false;
          vm.cairnState = cairnState.soapstoneThankYou;
          // vm.attemptExtractInitial(); // this mutates vm.soapstoneFormValues
          document.getElementById("cairn-header")!.innerText = "Thank you for your submission, we've added it to the pile :)";
          vm.submitSoapstone(); // send to server and add to sidebar
          document.getElementById("soapstone-form")!.innerHTML = "";
      }

      // hide what needs to be hidden, reset state
      vm.soapstoneFinish = () => {
          vm.cairnState = cairnState.noCairn;
          $scope.showSoapstoneForm = false;
          $scope.showSidebar       = false;
          $scope.showCairnElements = false;
          $scope.showMainTask      = true;
      }

      vm.submitSoapstone = () => {
          let soapstoneAndSignature = vm.chosenSignature !== ""
                                          ? vm.soapstoneFormValues + " - " + vm.chosenSignature
                                          : vm.soapstoneFormValues;
          vm.submitCairn("soapstone", soapstoneAndSignature);
          vm.insertSidebarMsg(soapstoneAndSignature);
      }

      vm.submitEmptySoapstone = () => {
          vm.submitCairn("soapstone", "");
          vm.soapstoneFinish();
      }

      // == END SOAPSTONE CREATE CODE ==

      // == EMOJI CREATE CODE ==
      $scope.showMainTask = true;
      $scope.showPhysics  = false;

      // Is there a way to programatically list the files in a directory?
      vm.emojis = shuffle(["angry", "concerned", "grinning", "monocle", "sadface", "thinking", "tongue-out"]);

      vm.startEmojiCairn = () => {
          vm.cairnState = cairnState.emojiGreet;
          $scope.showCairnElements = true;
          $scope.showContinueBtn   = true;
          $scope.showBackBtn       = false;
          $scope.showSkipBtn       = true;
          $scope.showMainTask      = false; // the div with the main task
          document.getElementById("cairn-header")!.innerText = "Would you like to play a minigame?"
          // TODO: this is a hack to skip the 'greeting'. Make it cleaner
          vm.handleCairnContinue();
      }

      vm.startEmojiCreate = () => {
          vm.cairnState = cairnState.emojiMain;
          $scope.showContinueBtn = true;
          $scope.showBackBtn     = false;
          $scope.showSkipBtn     = true;
          vm.showModal(); // this isn't necessary, and honestly there might be good reasons to remove it
          $scope.showPhysics       = true; // the div with the ballpit of emojis
          $scope.showEmoji         = true; // the div with the buttons to select which emoji you want
          document.getElementById("cairn-header")!.innerHTML = "Would you like to take a break? These emojis represent how other players feel. Feel free to play around with them. <br><br>You can add an emoji if you want to. Pick one that describes how you're feeling!<br>"
          // style was used to hide this. Remove style to make it visible
          document.getElementById("emoji-picker")!.removeAttribute("style");
          Render.run(vm.render);
          vm.hideModal();
      }

      // hide everything and return to main tasks
      vm.finishEmojiCreate = () => {
          $scope.showMainTask      = true;
          $scope.showPhysics       = false;
          $scope.showCairnElements = false;
          $scope.showEmoji         = false;
          $scope.showContinueBtn   = true;
          $scope.showBackBtn       = true;
          $scope.showSkipBtn       = true;
          Render.stop(vm.render);
          vm.submitCairn("emoji", vm.submittedEmoji);
          vm.submittedEmoji = "";
          vm.cairnState = cairnState.noCairn;
      }

      // assume no emoji was submitted, fill this variable if one was
      vm.submittedEmoji = "";
      vm.submitEmoji = (submittedEmoji: string) => {
          vm.submittedEmoji = submittedEmoji;
          vm.addEmojiToPhysics(submittedEmoji); // add the emoji to the ballpit
          document.getElementById("emoji-picker")!.setAttribute("style", "visibility:hidden");
          // $scope.showEmoji = false;
          // The actual sending of the emoji to the database happens in finishEmojiCreate
      }

      // add the emoji to the ballpit
      vm.addEmojiToPhysics = (emojiToAdd: string) => {
          // add it near the top, in a random location on the x axis
          // window.innerWidth / 4 because the physics window size is dynamic
          let newEmoji = Bodies.rectangle(Math.random() * window.innerWidth / 4 + 30, 50, 40, 40, {
              render :{
                  sprite: {
                      texture: 'images/emojis/' + emojiToAdd + '.png',
                      xScale: 0.1,
                      yScale: 0.1
                  }
              },
              "restitution": 0.1,
              "frictionStatic": 1,
              "friction": 0.8
          });
          World.add(vm.engine.world, [newEmoji]);
      }

      // module aliases
      let Engine          = Matter.Engine,
          Render          = Matter.Render,
          Runner          = Matter.Runner,
          World           = Matter.World,
          MouseConstraint = Matter.MouseConstraint,
          Mouse           = Matter.Mouse,
          Bodies          = Matter.Bodies;

      // Activated by angular when the physics host (id physicsBody) is initialized
      vm.initializePhysics = () => {
          console.log("Beginning creation of physics div");
          vm.isPhysicsModalCreated = true;

          // create an engine. Apparently a lot of this code is deprecated, but it's also from the matter tutorial so...
          vm.engine = Engine.create({enableSleeping: true});

          let physicsHost = document.getElementById("physicsBody")!;

          let physHeight = window.innerHeight / 3;
          let physWidth = window.innerWidth / 3;
          // create a renderer
          vm.render = Render.create({
              element: physicsHost,
              engine: vm.engine,
              options: {
                  width: physWidth, // dynamically size the window based on browser size
                  height: physHeight,
                  wireframes: false,
                  background: '#cfd8dc',
                  showSleeping: false
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

          // dynamically place the walls based on browser size
          var ground    = Bodies.rectangle(physWidth , physHeight + 45, physWidth * 4 , 100             , { isStatic: true });
          var leftWall  = Bodies.rectangle(-45         , physHeight      , 100            , physHeight * 4 , { isStatic: true });
          var rightWall = Bodies.rectangle(physWidth + 45 , physHeight      , 100            , physHeight * 4 , { isStatic: true });
          var topWall   = Bodies.rectangle(300       , -45               , physWidth * 4 , 100             , { isStatic: true });

          // add all of the bodies to the world
          World.add(vm.engine.world, [ground, leftWall, rightWall, topWall]);
          World.add(vm.engine.world, mouseConstraint);

          // run the engine
          Runner.run(vm.engine);

          vm.fillPhysicsWithEmojisFromDatabase();
      }

      // populate the ballpit
      vm.fillPhysicsWithEmojisFromDatabase = () => {
          let numEmojis = 30;
          let body = { projectID: vm.data.id, cairnType: "emoji", numberRequested: numEmojis };
          $http.post('api/tasks/getCairns', body).then((serverReturn: object) => {
              // Fill with emojis from the server
              serverReturn["data"].forEach((datum: object) => vm.addEmojiToPhysics(datum["message"]))
              // If there aren't enough emojis, fill with emojis randomly chosen
              // it has to be this verbose because js is bad at iterators and randomness
              Array.from(Array(numEmojis - serverReturn["data"].length).keys())
                  .forEach(() => vm.addEmojiToPhysics(vm.emojis[getRandomIntInclusive(0, vm.emojis.length - 1)]));
          });
      }

      /* ==============================
       * END CAIRN CODE
       * ============================== */ 

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

      //if in NGS mode, try to get the before image from Google
      vm.getBeforeImageNGS = function (){

        var lat = parseFloat(vm.centerLat);
        var lon = parseFloat(vm.centerLng);
        var zoom = dZoom;
        zoom = Math.min(dZoom,18); //Google breaks when you go > 18 zoom
       
        //convert lat,lon to tile coordinates
        var x = Math.floor((lon+180)/360*Math.pow(2,zoom));
        var y = Math.floor((1-Math.log(Math.tan(lat*Math.PI/180) + 1/Math.cos(lat*Math.PI/180))/Math.PI)/2 *Math.pow(2,zoom));
        var y = Math.floor((1-Math.log(Math.tan(lat*Math.PI/180) + 1/Math.cos(lat*Math.PI/180))/Math.PI)/2 *Math.pow(2,zoom));
        //format the google maps url
        var g_link = "http://mt1.google.com/vt/lyrs=s&x="+ x.toString() +"&y="+ y.toString() + "&z=" + zoom.toString()
        console.log(g_link)
        return g_link
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
              vm.ngs_before_image_link = vm.getBeforeImageNGS();

          }, function(err) {
              vm.hideModal();
          });
      };


      function handleEnd($window){
          vm.handleCairnSkip();

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

                      window.location.replace('/survey.html#/' + vm.survey_type + '?code=' + vm.code+ '&userType=kiosk&hitId=' + hitID + "&contributions=" + vm.data.progress);

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

                          window.location.replace('/survey.html#/'+ vm.survey_type + '?code=' + vm.code + '&userType=mTurk' + '&showChainQuestions=' + vm.showChainQuestions + '&showFlight=' + flight_last + "&contributions=" + vm.data.progress);

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
                          window.location.replace('/survey.html#/'+ vm.survey_type + '?code=' + vm.code + '&userType=mTurk' + '&showChainQuestions=' + vm.showChainQuestions + '&showFlight=' + flight_last + "&contributions=" + vm.data.progress)

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
              vm.ngs_before_image_link = vm.getBeforeImageNGS();
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

              tutData.forEach((item: any) => {

                  var sel_col = '';
                  var sel_num = -1;

                  //get only the images of the button that is hovering
                  if (item.answer == option) {

                      var tutpath = '../../images/Tutorials/';

                      if (item.hasOwnProperty('in_dataset') &&  item.in_dataset == 1){
                          //tutpath = '../../../dataset/' + data.data[0].dataset_id + '/';
                          tutpath = '/api/tasks/getImageFree/' + tdata.data[0].dataset_id + '/'
                      }
                      let it_annot = tutpath + item.image_name;
                      // Some images have drawings on them, arrows and the like. Use this image if it exists
                      if (item.image_annotation){
                          // sometimes image annotations already have the project code in them, sometimes they don't. This is a hacky way of seeing if we need to add the project code or not.
                          it_annot = item.image_annotation.includes('/') 
                              ? `${tutpath}${item.image_annotation}`
                              : `${tutpath}${vm.code}/${item.image_annotation}`;
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
                          col_number: sel_num,
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

      vm.noImageCounter = 0;
      function submit(option,option_text) {

          // if a player is attempting to submit when there is no task visible, just ignore
          if (!$scope.showMainTask) return;
          if (vm.data.template.selectedTaskType === "ngs" && option_text === "No Image") {
              vm.noImageCounter++;
              if (vm.noImageCounter === 4) {
                  vm.showToast("<b>Please keep going even if you aren't finding images</b>.<br> It is helpful for us to know that these facilities have not been photographed.");
                  vm.noImageCounter = 0;
              }
          } else vm.noImageCounter = 0;
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

                  vm.handleCairns();
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
          vm.show_cairns = vm.data.show_cairns || 0;

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

