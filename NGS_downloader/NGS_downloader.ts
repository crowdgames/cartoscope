import { XMLHttpRequest } from 'xmlhttprequest-ts';
const { DOMParser } = require('@xmldom/xmldom')
// const { fetch } = require('node-fetch');
import {fetch} from 'cross-fetch';
let fs = require('fs');
let request = require('request');

const zip = (a: any[], b: any[]) => a.map((k, i) => [k, b[i]]);

function getNGSLayers(theUrl: string, callback)
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
let layersUrl = `https://storms.ngs.noaa.gov/storms/${event_name}/services/WMTSCapabilities.xml`;

let downloadImage = (layers: string[], zoom: number, lat: number, lon: number) => {
    let [x, y] = transformCoordinates(zoom, lat, lon);
    layers.forEach(layer => {
        let cdnUri = `https://stormscdn.ngs.noaa.gov/${layer}/${zoom}/${x}/${y}`;
        let filename = `./imgs/${layer}_${zoom}_${lat}_${lon}.png`;
        request.head(cdnUri, (_, response) => {
            if (response.headers['content-type'] !== 'text/html')
                request(cdnUri).pipe(fs.createWriteStream(filename));
        });
    });
}

getNGSLayers(layersUrl, (layers: string[]) => {
    downloadImage(layers, zoom, lat, lon);
});
