import { XMLHttpRequest } from 'xmlhttprequest-ts';
const { DOMParser } = require('@xmldom/xmldom')
// const { fetch } = require('node-fetch');
import {fetch} from 'cross-fetch';
let fs = require('fs');
let request = require('request');

const zip = (a: any[], b: any[]) => a.map((k, i) => [k, b[i]]);

function getNGSLayers(theUrl, callback)
{
    var layers: any[] = []
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200){
            let parser = new DOMParser();
            let xmlDoc = parser.parseFromString(xmlHttp.responseText,"text/xml");
            var lch = xmlDoc.getElementsByTagName("Layer")
            for (let i = 0; i < lch.length; i++) {
                layers.push(lch[i].childNodes[3].childNodes[0].data);
                // TODO: get the layer names from children nodes
            }
            callback(layers);
        }
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}

let transformCoordinates = (zoom: number, lat: number, lon: number) => {
    let x = Math.floor((lon+180)/360*Math.pow(2,zoom));
    let y = Math.floor((1-Math.log(Math.tan(lat*Math.PI/180) + 1/Math.cos(lat*Math.PI/180))/Math.PI)/2 *Math.pow(2,zoom));
    return [x, y];
}

let event_name = "ida";
let lat = 29.61070;
let lon = -89.85002;
let zoom = 18;
/*
var downloadIfNotText = function(uri, filename, callback){
  request.head(uri, function(err, res, body){
    console.log('content-type:', res.headers['content-type']);
    console.log('content-length:', res.headers['content-length']);

    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
};

download('https://www.google.com/images/srpr/logo3w.png', 'google.png', function(){
  console.log('done');
});
*/

let downloadImage = (event_name: string, zoom: number, lat: number, lon: number) => {
    let layersUrl = `https://storms.ngs.noaa.gov/storms/${event_name}/services/WMTSCapabilities.xml`;
    getNGSLayers(layersUrl, (layers: string[]) => {
        let [x, y] = transformCoordinates(zoom, lat, lon);
        layers.forEach(layer => {
            let cdnUri = `https://stormscdn.ngs.noaa.gov/${layer}/${zoom}/${x}/${y}`;
            let filename = `./imgs/${layer}_${zoom}_${lat}_${lon}.png`;
            request.head(cdnUri, (_, response) => {
                if (response.headers['content-type'] !== 'text/html')
                    request(cdnUri).pipe(fs.createWriteStream(filename));
            });
        });
        /*
        let promises = layers.map(layer => fetch(`https://stormscdn.ngs.noaa.gov/${layer}/${zoom}/${x}/${y}`));
        Promise.all(promises).then(responses => {
            responses.forEach((response, idx) => {
                let layer = layers[idx];
                if(response.headers.get("content-type") !== "text/html") {
                    console.log("Hello");
                    // response!.body!.pipe(fs.createWriteStream(`./imgs/${layer}_${zoom}_${lat}_${lon}.png`))
                    // response.body.
                    // console.log(response.json().then(data => console.log(data)));
                }
            });
        });
        let promises: any[] = [];
        for (let k = 0; k < layers.length; k++) {
            const layer = layers[k];
            var cdnUrl = "https://stormscdn.ngs.noaa.gov/" + layer + "/" + zoom.toString()+"/"+ x.toString()+"/"+ y.toString()
            promises.push(fetch(cdnUrl));
        }
        console.log(promises);

        Promise.all(promises).then(function (responses) {
            // Get a JSON object from each of the responses
            return Promise.all(responses.map(function (response) {
                var content_type = response.headers.get('content-type');
                console.log(response.headers.get('content-length'));
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
                ret = {name: event_name, latitude:lat,longitude:lon}
            } 
            console.log(ret)

        }).catch(function (error) {
            // if there's an error, log it
            console.log(error)
        });
        */
    });
}

downloadImage(event_name, zoom, lat, lon);
