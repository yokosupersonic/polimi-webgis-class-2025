import 'ol/ol.css';
import 'ol-layerswitcher/dist/ol-layerswitcher.css';
import { Map, View, Overlay } from 'ol';
import { Tile, Image, Group, Vector } from 'ol/layer';
import { OSM, ImageWMS, XYZ, StadiaMaps } from 'ol/source';
import VectorSource from 'ol/source/Vector';
import { GeoJSON } from 'ol/format';
import { fromLonLat } from 'ol/proj';
import { ScaleLine, FullScreen, MousePosition, } from 'ol/control';
import LayerSwitcher from 'ol-layerswitcher';
import { createStringXY } from 'ol/coordinate';
import { Style, Stroke, Fill } from 'ol/style';

let osm = new Tile({
    title: "Open Street Map",
    type: "base",
    visible: true,
    source: new OSM()
});

let colombiaBoundary = new Image({
    title: "Colombia Administrative level 0",
    source: new ImageWMS({
        url: 'https://www.gis-geoserver.polimi.it/geoserver/wms',
        params: { 'LAYERS': 'gis:COL_adm0', 'STYLES': 'restricted' }
    })
});
var colombiaDepartments = new Image({
    title: "Colombia Administrative level 1",
    source: new ImageWMS({
        url: 'https://www.gis-geoserver.polimi.it/geoserver/wms',
        params: { 'LAYERS': 'gis:COL_adm1' }
    }),
    opacity: 0.5
});

var colombiaRoads = new Image({
    title: "Colombia Roads",
    source: new ImageWMS({
        url: 'https://www.gis-geoserver.polimi.it/geoserver/wms',
        params: { 'LAYERS': 'gis:COL_roads' }
    }),
    visible: true
});

var colombiaRivers = new Image({
    title: "Colombia Rivers",
    type: "overlay",
    source: new ImageWMS({
        url: 'https://www.gis-geoserver.polimi.it/geoserver/wms',
        params: { 'LAYERS': 'gis:COL_rivers' }
    }),
    minResolution: 1000,
    maxResolution: 5000
});

//Create the layer groups and add the layers to them
let basemapLayers = new Group({ 
    title: 'Base Maps', 
    layers: [osm] 
});

let overlayLayers = new Group({ 
    title: 'Overlay Layers', 
    layers: [
        colombiaBoundary, 
        colombiaDepartments, 
        colombiaRivers, 
        colombiaRoads
    ]
});

let mapLayers = [basemapLayers, overlayLayers]

// Map Initialization
let mapOrigin = fromLonLat([-74, 4.6]);
let zoomLevel = 5;
let map = new Map({
    target: document.getElementById('map'),
    //layers: [basemapLayers, overlayLayers],
    layers: mapLayers,
    view: new View({
        center: mapOrigin,
        zoom: zoomLevel
    }),
    projection: 'EPSG:3857'
});

// Add the map controls:
map.addControl(new ScaleLine()); 
map.addControl(new FullScreen());
map.addControl(
    new MousePosition({
        coordinateFormat: createStringXY(4),
        projection: 'EPSG:4326',
        className: 'custom-control',
        placeholder: '0.0000, 0.0000'
    })
);


let layerSwitcher = new LayerSwitcher({});
map.addControl(layerSwitcher);

//Add the Stadia Maps layers
var stamenWatercolor = new Tile({ 
    title: 'Stamen Watercolor', 
    type: 'base', 
    visible: false, 
    source: new StadiaMaps({ 
        layer: 'stamen_watercolor' 
    }) 
}); 
var stamenToner = new Tile({ 
    title: 'Stamen Toner', 
    type: 'base', 
    visible: false, 
    source: new StadiaMaps({ 
        layer: 'stamen_toner' 
    }) 
});  

basemapLayers.getLayers().extend([stamenWatercolor, stamenToner]);

// Add ESRI basemap layers
var esriTopoBasemap = new Tile({
    title: 'ESRI Topographic',
    type: 'base',
    visible: false,
    source: new XYZ({
        attributions:
            'Tiles © <a href="https://services.arcgisonline.com/ArcGIS/' +
            'rest/services/World_Topo_Map/MapServer">ArcGIS</a>',
        url:
            'https://server.arcgisonline.com/ArcGIS/rest/services/' +
            'World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    }),
});
var esriWorldImagery = new Tile({
    title: 'ESRI World Imagery',
    type: 'base',
    visible: false,
    source: new XYZ({
        attributions:
            'Tiles © <a href="https://services.arcgisonline.com/ArcGIS/' +
            'rest/services/World_Imagery/MapServer">ArcGIS</a>',
        url:
            'https://server.arcgisonline.com/ArcGIS/rest/services/' +
            'World_Imagery/MapServer/tile/{z}/{y}/{x}',
    }),
});
basemapLayers.getLayers().extend([
    esriTopoBasemap, esriWorldImagery
]);


// Add a static GeoJSON file to the map
// let staticGeoJSONSource = new VectorSource({
//     url: '../geojson/COL_adm2.geojson', // Replace with the actual path to your GeoJSON file
//     format: new GeoJSON()
// });

// let staticGeoJSONLayer = new Vector({
//     title: "Static GeoJSON Layer",
//     source: staticGeoJSONSource,
//     style: new Style({
//         stroke: new Stroke({
//             color: "#ff7f50",
//             width: 2
//         }),
//         fill: new Fill({
//             color: "rgba(255, 127, 80, 0.5)"
//         })
//     })
// });
// overlayLayers.getLayers().extend([staticGeoJSONLayer]);

//Add the WFS layer
// let wfsSource = new VectorSource()
// let wfsLayer = new Vector({
//     title: "Colombia water areas",
//     source: wfsSource,

//     style: new Style({
//         stroke: new Stroke({
//             color: "#a2d2ff",
//             width: 1
//         }),
//         fill: new Fill({
//             color: "#bde0fe"
//         })
//     }),
//     zIndex: 9999
// });
// overlayLayers.getLayers().extend([wfsLayer]);

// This allows to use the function in a callback!
// function loadFeatures(response) {
//     wfsSource.addFeatures(new GeoJSON().readFeatures(response))
// }
// // This is not a good practice, but works for the jsonp.
// window.loadFeatures = loadFeatures;


// var base_url = "https://www.gis-geoserver.polimi.it/geoserver/gis/ows?";
// var wfs_url = base_url;
// wfs_url += "service=WFS&"
// wfs_url += "version=2.0.0&"
// wfs_url += "request=GetFeature&"
// wfs_url += "typeName=gis%3ACOL_water_areas&"
// wfs_url += "outputFormat=text%2Fjavascript&"
// wfs_url += "srsname=EPSG:3857&"
// wfs_url += "format_options=callback:loadFeatures"

// console.log(wfs_url);

// map.once('postrender', (event) => {
//     // Load the WFS layer
//     $.ajax({ url: wfs_url, dataType: 'jsonp' });
    
// })

//Add the code for the Pop-up
// var container = document.getElementById('popup');
// var content = document.getElementById('popup-content');
// var closer = document.getElementById('popup-closer');

// var popup = new Overlay({
//     element: container
// });
// map.addOverlay(popup);

// // The click event handler for closing the popup.
// // This ensures that JQuery ($) is already available in the page.
// $(document).ready(function () {
//     map.on('singleclick', function (event) {
//         //This iterates over all the features that are located on the pixel of the click (can be many)
//         var feature = map.forEachFeatureAtPixel(event.pixel, function (feature, layer) {
//             return feature;
//         });

//         //If there is a feature, open the popup by setting a position to it and put the data from the feature
//         if (feature != null) {
//             var pixel = event.pixel;
//             var coord = map.getCoordinateFromPixel(pixel);
//             popup.setPosition(coord);
//             content.innerHTML =
//                 '<h5>Colombia Water Areas</h5><br><b>Name: </b>' +
//                 feature.get('NAME') +
//                 '</br><b>Description: </b>' +
//                 feature.get('HYC_DESCRI');
//         } else {
//             //Only if the colombiaRoads layer is visible, do the GetFeatureInfo request
//             if (colombiaRoads.getVisible()) {
//                 var viewResolution = (map.getView().getResolution());
//                 var url = colombiaRoads.getSource().getFeatureInfoUrl(event.coordinate, viewResolution, 'EPSG:3857', { 'INFO_FORMAT': 'text/html' });
//                 console.log(url);

//                 if (url) {
//                     var pixel = event.pixel;
//                     var coord = map.getCoordinateFromPixel(pixel);
//                     popup.setPosition(coord);
//                     //We do again the AJAX request to get the data from the GetFeatureInfo request
//                     $.ajax({ url: url })
//                         .done((data) => {
//                             //Put the data of the GetFeatureInfo response inside the pop-up
//                             //The data that arrives is in HTML
//                             content.innerHTML = data;
//                         });
//                 }
//             }
//         }
//     });
// });



// // Adding map event for pointermove
// // The click event handler for closing the popup.
// closer.onclick = function () {
//     popup.setPosition(undefined);
//     closer.blur(); 
//     return false;
// };

// map.on('pointermove', function(event){
//     var pixel = map.getEventPixel(event.originalEvent);
//     var hit = map.hasFeatureAtPixel(pixel);
//     map.getTarget().style.cursor = hit ? 'pointer' : '';
// });

// map.on('moveend', function(event){
//     console.log("moved map");
// });