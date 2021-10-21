<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>NGS Quick View Maps</title>
    <style>
    /* styles */

    html, body {
      margin: 0;
      padding: 0;
    }

    #map {
      width: 100vw;
      height: 100vh;
    }
    </style>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/d3/7.0.1/d3.min.js"></script>

  </head>
  <body>
    <form>  
      <b> Select event from dropdown list: </b>  
      <select id = "myList" onchange = "updateEvent()" >  
      <option> ---Choose event--- </option>  
      <option> Ida </option>  
      <option> Zeta </option>  
      <option> Laura</option>
      <option> Florence</option>
      <option> Harvey</option>

      <!-- <option> Harvey </option>   -->
      </select>
      <p> Selected event: 
        <input type = "text" id = "event_pick" size = "20" >
      </p>  
      </form>  
      <p> Number of locations plotted: 
        <input type = "text" id = "event_locations" size = "20">
      </p>     
      <p> Upload your own .csv: (Columns must be name,latitude,longitude)
        <input type="file" id="fileinput" />
      </p>
      <p>
        <button id="updateMarkers"> Update Markers</button>
      </p>
      <p>
        <button id="resetMap"> Reset Map</button>
      </p>
      <p>
        <button id="filterMap"> Filter Locations</button> 
        
      </p>
      <p id="filter_text"></p> 
       <div id="map"></div>
    
    <!-- <div >
      <h2>Locations within Layers:</h2>
      <div id="locations" ></div>
    </div> -->


    <!-- NOTE: The 'key' parameter should be replaced with your Google Maps API Key. -->
    <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyAL32H2arSyCcBfcD49o1wG32pkHaNlOJE"></script>
    <script src="//cdn.jsdelivr.net/npm/bluebird@3.7.2/js/browser/bluebird.min.js"></script>
    <script>

      var default_event = "ida"
      var selected_event = "ida"
      var default_location_file = "new_ida_location_data.csv"
      document.getElementById("event_pick").value = default_event
      //https://storms.ngs.noaa.gov/
      //see list for these and make the matchings for older ones!
      var event_mappings = {
        'harvey': 'tilesd',
        'florence': 'tilesi',
        'laura': 'tileso'
      }

      var map;
      var locationMarkers = []
      LAYERS = []



function getNGSBeforeImageUrl(lat,lon,zoom){
  //convert lat,lon to tile coordinates
  var x = Math.floor((lon+180)/360*Math.pow(2,zoom));
  var y = Math.floor((1-Math.log(Math.tan(lat*Math.PI/180) + 1/Math.cos(lat*Math.PI/180))/Math.PI)/2 *Math.pow(2,zoom));
  //format the google maps url
  var g_link = "http://mt1.google.com/vt/lyrs=s&x="+ x.toString() +"&y="+ y.toString() + "&z=" + zoom.toString()
  return g_link
}



function getNGSLayers(theUrl, callback)
{
    var layers = []
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200){
            parser = new DOMParser();
            xmlDoc = parser.parseFromString(xmlHttp.responseText,"text/xml");
            var lch = xmlDoc.getElementsByTagName("Layer")
            for (let i = 0; i < lch.length; i++) {
              layers.push(lch[i].childNodes[3].innerHTML)
                //TODO: get the layer names from children nodes
              }
            callback(layers);
        }
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}

var checkNGSImage = async function(name,lat,lon,zoom,layers,counter,total){

  return new Promise((resolve, reject) => {
    //delay 1ms here to not overwhelm NGS
    return Promise.delay(1).then(
           function () {
           document.getElementById("filter_text").innerHTML = "Filtering..." + (counter+1).toString() + "/" + total.toString()
            //we need to check through all layers
            found = false;
    //no layers, return false
    if (layers.length == 0){
      resolve({})
    }
    var promises = []
    //get coordinates
    var x = Math.floor((lon+180)/360*Math.pow(2,zoom));
    var y = Math.floor((1-Math.log(Math.tan(lat*Math.PI/180) + 1/Math.cos(lat*Math.PI/180))/Math.PI)/2 *Math.pow(2,zoom));
    //for every layer, we need to check the url if it returns image or not
    for (let k = 0; k < layers.length; k++) {
    const layer = layers[k];
    var url = "https://stormscdn.ngs.noaa.gov/" + layer + "/" + zoom.toString()+"/"+ x.toString()+"/"+ y.toString()
    promises.push(fetch(url))
    }

    Promise.all(promises).then(function (responses) {
	// Get a JSON object from each of the responses
	return Promise.all(responses.map(function (response) {
    var content_type = response.headers.get('content-type');
    if (content_type == "text/html") {
      return false
    } else {
      return true
    }
		
	}));
}).then(function (data) {
	// Log the data to the console
	// You would do something with both sets of data here
  var ret = {}
  if (data.indexOf(true) != -1) {
    ret = {name: name, latitude:lat,longitude:lon}
  } 
  resolve(ret)

}).catch(function (error) {
	// if there's an error, log it
  reject(error)
	console.log(error);
});
    

})
});
    
}

var downloadCSV = function(data){

  const csvString = [
    ["name","latitude","longitude"],
    ...data.map(item => [
      item.name,
      item.latitude,
      item.longitude
    ])
  ]
   .map(e => e.join(",")) 
   .join("\n");


  let csvContent = "data:text/csv;charset=utf-8," 
    //+ "name,latitude,longitude\n"
    + csvString
    //+ data.map(e => e.join(",")).join("\n");
    var encodedUri = encodeURI(csvContent);
  var link = document.createElement("a");
link.setAttribute("href", encodedUri);
link.setAttribute("download", "filtered_locations.csv");
document.body.appendChild(link); 
link.click();

}

var identify_locations_image_NGS =  async function(data,layers){

  
  // var filter_locations = []
  // filter_locations.push(["name","latitude","longitude","has_image"])
  // var promises = []
  // for (var i = 0; i < data.length; i++) {
  //   var lat = parseFloat(data[i].latitude)
  //   var lon = parseFloat(data[i].longitude)
  //   var name = data[i].name
  //   promises.push(checkNGSImage(name,lat,lon,18,layers,i,data.length))    
    
  // }

  Promise.mapSeries(data, function(location, index, arrayLength) {
    return checkNGSImage(location.name,parseFloat(location.latitude),parseFloat(location.longitude),18,layers,index,arrayLength).then(function(res) {
      return res
    });
  }).then(function(values) {
    var clean_values = values.filter(value => Object.keys(value).length !== 0);
    downloadCSV(clean_values)
    document.getElementById("filter_text").innerHTML = "Done! Found " + clean_values.length.toString() + " locations. Downloading CSV." 
    resetMarkers();
    populateMarkers(clean_values);
});

}



var populateMarkers = function(data){
  document.getElementById("event_locations").value = data.length; 
  for (var i = 0; i < data.length; i++) {
              var lat = parseFloat(data[i].latitude)
              var lon = parseFloat(data[i].longitude)
              var name = data[i].name
              markerLoc = { lat: lat, lng: lon };
          
              marker = new google.maps.Marker({
              position: markerLoc,
              map,
              title:name,
              icon:"https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png"
              });
              var ngs_link = "https://storms.ngs.noaa.gov/storms/" + selected_event + "/index.html#18/" + lat + "/"+ lon
              var g_link = getNGSBeforeImageUrl(lat,lon,18)
              var info_page = "<p>Location: " + name + "<br>Coordinates: " + lat + ", " + lon + 
                "<br><a target=\"\_blank\" href=\" " + ngs_link + "\">NGS MAP LINK </a>" +
                "<br><a target=\"\_blank\" href=\" " + g_link + "\"> Before Image Link</a>" 
              addInfoWindow(marker,info_page)
              locationMarkers.push(marker)
              }
}

var resetMarkers = function(){
  for (var i = 0; i < locationMarkers.length; i++) {
    locationMarkers[i].setMap(null);
}
locationMarkers = []
}

function readSingleFile(evt) {
    document.getElementById("filter_text").innerHTML = "" 
    var f = document.getElementById('fileinput').files[0]; 
    var skipped_lines = []
    var unique_entries = []
    if (f) {
      var new_locs = []
      var r = new FileReader();
      r.onload = function(e) { 
          var contents = e.target.result;
          var lines = contents.split("\n")
          var header = lines[0].split(",")
          if (header[0] !== "name" || header[1] !== "latitude" || header[2].replace("\r","") !== "longitude"){
            return(alert("Error in input file. Make sure your first columns are name,latitude,longitude in that order!"))
          }
          for (var i=1; i<lines.length; i++){
            var row = lines[i].split(",")
            if (row.length >= 3 && unique_entries.indexOf(row[0]) == -1){
              new_locs.push({name: row[0],latitude:row[1],longitude:row[2].replace("\r","")})
              unique_entries.push(row[0])
            } else {
              skipped_lines.push(i);
            }
            
            
          }
          console.log("Skipped: " + skipped_lines.length)
          resetMarkers();
          populateMarkers(new_locs);
          var old_element = document.getElementById("filterMap");
          var new_element = old_element.cloneNode(true);
          old_element.parentNode.replaceChild(new_element, old_element);
          document.getElementById('filterMap').addEventListener('click', function(){
                  identify_locations_image_NGS(new_locs,LAYERS)
                });
          
     }
      r.readAsText(f);
      // document.write(output);
      
      
    } else { 
      alert("Failed to load file");
    }
  }
  document.getElementById('updateMarkers').addEventListener('click', readSingleFile);



     
    // var TILE_URL = 'https://stormscdn.ngs.noaa.gov/{layer}/{TileMatrix}/{TileCol}/{TileRow}'

    function addInfoWindow(marker, message) {

var infoWindow = new google.maps.InfoWindow({
    content: message
});



google.maps.event.addListener(marker, 'click', function () {
    infoWindow.open(map, marker);
});
}
  function initialize(event_pick_drop) {

    

    if (event_mappings.hasOwnProperty(event_pick_drop)){
        event_name =  event_mappings[event_pick_drop]
      } else {
        event_name = event_pick_drop
      }

    //that's the only thing we have from the backend
    //var ngs_url = "https://storms.ngs.noaa.gov/storms/ida/index.html"
    //var event = ngs_url.replace("https://storms.ngs.noaa.gov/storms/","").replace("/index.html","")
    console.log(event_name)
    var xml_url = "https://storms.ngs.noaa.gov/storms/"+event_name+"/services/WMTSCapabilities.xml"
    if (event_mappings.hasOwnProperty(event_pick_drop)){
      xml_url = "https://storms.ngs.noaa.gov/storms/"+event_name+"/services/tileserver.php/wmts"
    }
    // console.log(xml_url)


    getNGSLayers(xml_url,function(layers){

      // console.log(layers)
      LAYERS = layers;

        //map   
        const myLatLng = { lat: 29.8228, lng: -90.4112 };
         map = new google.maps.Map(document.getElementById("map"), {
    zoom: 10,
    center: myLatLng,
    mapTypeControlOptions: {
      mapTypeIds: layers,
    },
    });
    
          //if we dont have anything, overwrite to default
          
              //for every location, marker for location + ngs tile
              d3.csv(default_location_file).then(function(data){
                populateMarkers(data)
                var old_element = document.getElementById("filterMap");
                var new_element = old_element.cloneNode(true);
                old_element.parentNode.replaceChild(new_element, old_element);
                document.getElementById('filterMap').addEventListener('click', function(){
                  identify_locations_image_NGS(data,layers)
                });

            });

          
         

          //layers to plot from NGS
          layers.forEach(function(lay_id){
            var imageMapType = new google.maps.ImageMapType({

getTileUrl: function(coord, zoom) {


  var tiles = 'https://stormscdn.ngs.noaa.gov/' + lay_id + '/{z}/{x}/{y}';
  tiles = tiles.replace('{z}', zoom).replace('{x}', coord.x).replace('{y}', coord.y);


  return tiles;
},
tileSize: new google.maps.Size(256, 256),
isPng: true,
minZoom: 1,
maxZoom: 20,
opacity: 1.0,
name: lay_id
});

map.overlayMapTypes.push(imageMapType);  
          })
           

    })
  }
    
  
function resetMap(){
  default_event = "ida"
  default_location_file = "new_ida_location_data.csv"
  document.getElementById("event_pick").value = default_event
  document.getElementById('fileinput').value = '';
  initialize(default_event)
}
function updateEvent() {  
      var mylist = document.getElementById("myList");  
      document.getElementById("event_pick").value = mylist.options[mylist.selectedIndex].text; 
      selected_event = mylist.options[mylist.selectedIndex].text.toLowerCase()
      initialize(selected_event)
      document.getElementById('fileinput').value = '';

    }

    function httpGetAsync(theUrl, callback)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}

function httpGetAsyncType(theUrl, callback)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
         //check content type
        //console.log(myXMLHttpRequest.getAllResponseHeaders())
        var contentType = xmlHttp.getResponseHeader("Content-Type");
        if (contentType == "text/html") {
          callback(false);
          } else {
            callback(true);

        }
        }
       
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


  initialize(default_event)
  document.getElementById('resetMap').addEventListener('click', resetMap);



    
    </script>
  
  </body>
</html>
