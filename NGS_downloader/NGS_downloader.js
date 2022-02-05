"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var xmlhttprequest_ts_1 = require("xmlhttprequest-ts");
var DOMParser = require('@xmldom/xmldom').DOMParser;
var fs = require('fs');
var request = require('request');
var zip = function (a, b) { return a.map(function (k, i) { return [k, b[i]]; }); };
function sleep(ms) {
    return new Promise(function (resolve) { return setTimeout(resolve, ms); });
}
function getNGSLayers(theUrl, callback) {
    var layers = [];
    var xmlHttp = new xmlhttprequest_ts_1.XMLHttpRequest();
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
            var parser = new DOMParser();
            var xmlDoc = parser.parseFromString(xmlHttp.responseText, "text/xml");
            var lch = xmlDoc.getElementsByTagName("Layer");
            for (var i = 0; i < lch.length; i++) {
                layers.push(lch[i].childNodes[3].childNodes[0].data);
                // TODO: get the layer names from children nodes
            }
            callback(layers);
        }
    };
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}
var transformCoordinates = function (zoom, lat, lon) {
    var x = Math.floor((lon + 180) / 360 * Math.pow(2, zoom));
    var y = Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom));
    return [x, y];
};
var event_name = "ida";
// let lat = 29.61070;
// let lon = -89.85002;
var zoom = 18;
var layersUrl = "https://storms.ngs.noaa.gov/storms/".concat(event_name, "/services/WMTSCapabilities.xml");
var infile = './2021-10-29_oil_tutorial.csv';
var msToDownload = 60 * 1000; // spread downloading over this amount of time to avoid overwhelming NGS
var downloadImage = function (name, layers, zoom, lat, lon) {
    var _a = transformCoordinates(zoom, lat, lon), x = _a[0], y = _a[1];
    layers.forEach(function (layer) {
        var cdnUri = "https://stormscdn.ngs.noaa.gov/".concat(layer, "/").concat(zoom, "/").concat(x, "/").concat(y);
        var filename = "./imgs/".concat(name, "_").concat(layer, "_").concat(zoom, "_").concat(lat, "_").concat(lon, ".png");
        setTimeout(function () {
            request.head(cdnUri, function (_, response) {
                if (response !== undefined && response.headers['content-type'] !== 'text/html') {
                    console.log("Success: ".concat(cdnUri));
                    request(cdnUri).pipe(fs.createWriteStream(filename));
                }
                else
                    console.log("Failure: ".concat(cdnUri));
            });
        }, Math.random() * msToDownload);
    });
    console.log(name);
};
var main = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        getNGSLayers(layersUrl, function (layers) {
            fs.readFile(infile, 'utf8', function (_, data) {
                data.split("\n").forEach(function (row, idx) { return __awaiter(void 0, void 0, void 0, function () {
                    var _a, name, latStr, lonStr;
                    return __generator(this, function (_b) {
                        _a = row.split(','), name = _a[0], latStr = _a[1], lonStr = _a[2];
                        if (idx != 0 && latStr !== undefined) {
                            downloadImage(name, layers, zoom, parseFloat(latStr), parseFloat(lonStr));
                        }
                        return [2 /*return*/];
                    });
                }); });
            });
        });
        return [2 /*return*/];
    });
}); };
main();
