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

// OpenStreetMap base map
let osm = new Tile({
    title: "Open Street Map",
    type: "base",
    visible: true,
    source: new OSM()
});

// Colombia Administrative Boundaries
let colombiaBoundary = new Image({
    title: "Colombia Administrative level 0",
    source: new ImageWMS({
        url: 'https://www.gis-geoserver.polimi.it/geoserver/wms',
        params: { 'LAYERS': 'gis:COL_adm0', 'STYLES': 'restricted' }
    }),
    visible: false
});

// Colombia Administrative level 1
var colombiaDepartments = new Image({
    title: "Colombia Administrative level 1",
    source: new ImageWMS({
        url: 'https://www.gis-geoserver.polimi.it/geoserver/wms',
        params: { 'LAYERS': 'gis:COL_adm1' }
    }),
    opacity: 0.5,
    visible: false
});

// Colombia Roads
var colombiaRoads = new Image({
    title: "Colombia Roads",
    source: new ImageWMS({
        url: 'https://www.gis-geoserver.polimi.it/geoserver/wms',
        params: { 'LAYERS': 'gis:COL_roads' }
    }),
    visible: false
});

// Colombia Rivers
var colombiaRivers = new Image({
    title: "Colombia Rivers",
    type: "overlay",
    source: new ImageWMS({
        url: 'https://www.gis-geoserver.polimi.it/geoserver/wms',
        params: { 'LAYERS': 'gis:COL_rivers' }
    }),
    visible: false,
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

// Map Initialization
let mapOrigin = fromLonLat([-74, 4.6]);
let zoomLevel = 5;
let map = new Map({
    target: document.getElementById('map'),
    //layers: [basemapLayers, overlayLayers],
    layers: [],
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

// Adding a WFS layer
// From the OpenLayers WFS layer example: https://openlayers.org/en/v8.2.0/examples/vector-wfs.html
var wfsUrl = "https://www.gis-geoserver.polimi.it/geoserver/gis/wfs?" + 
"service=WFS&" + 
"version=2.0.0&" +
"request=GetFeature&" + 
"typeName=gis:COL_water_areas&" + 
"srsname=EPSG:3857&" + 
"outputFormat=application/json&";

let wfsSource = new VectorSource({});

let wfsLayer = new Vector({
    title: "Colombia Water Areas",
    source: wfsSource,
    visible: true,
    style: {
        'stroke-width': 2,
        'stroke-color': '#a2d2ff',
        'fill-color': "#bde0fe"
    },
});

// Download the features from the WFS service and add them to the source
fetch(wfsUrl)
.then((response) => {
    if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
    }
    response.json().then(data => {
        wfsSource.addFeatures(new GeoJSON().readFeatures(data));
    })
});

overlayLayers.getLayers().extend([wfsLayer]);


// Add a static GeoJSON file to the map
let staticGeoJSONSource = new VectorSource({
    url: '../geojson/COL_adm2.geojson', 
    format: new GeoJSON()
});

let staticGeoJSONLayer = new Vector({
    title: "Colombia Municipalities",
    source: staticGeoJSONSource,
    style: {
        'stroke-width': 2,
        'stroke-color': '#ff7f50',
        'fill-color': "rgba(255, 127, 80, 0.5)"
    },
});
overlayLayers.getLayers().push(staticGeoJSONLayer);

//Add the code for the Pop-up
var container = document.getElementById('popup');
var content = document.getElementById('popup-content');
var closer = document.getElementById('popup-closer');

var popup = new Overlay({
    element: container
});
map.addOverlay(popup);

// The click event handler for closing the popup.
closer.onclick = function () {
    popup.setPosition(undefined);
    closer.blur(); 
    return false;
};

// Adding map event for pointermove
map.on('singleclick', function (event) {
    //This iterates over all the features that are located on the pixel of the click (can be many)
    var feature = map.forEachFeatureAtPixel(
        event.pixel, 
        function (feature, layer) {
            if(layer == staticGeoJSONLayer){
                return feature;
            }
        }
    );

    //If there is a feature, open the popup by setting a position to it and put the data from the feature
    if (feature != null) {
        var pixel = event.pixel;
        var coord = map.getCoordinateFromPixel(pixel);
        popup.setPosition(coord);
        
        console.log(feature);
        content.innerHTML =
            '<h5>Administrative Level 2</h5><br>'+
            '<span>' +  
            feature.get('name_2') + ', ' +
            feature.get('name_1')
            '</span>';
    } 
});

map.on('pointermove', function(event) { 
    var pixel = map.getEventPixel(event.originalEvent); 
    var hit = map.hasFeatureAtPixel(pixel); 
    map.getTarget().style.cursor = hit ? 'pointer' : ''; 
});

var legendUrl = colombiaRivers.getSource().getLegendUrl();
console.log(legendUrl);


fetch(legendUrl)
.then((response) => {
    if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
    }
    response.json().then(data => {
        var legendRules = data["Legend"][0]["rules"];
        console.log(data["Legend"][0]);
        for(var i = 0; i < legendRules.length; i++){
            var rule = legendRules[i];
            var name = rule["name"];
            var fillColor = rule["symbolizer"]["Polygon"]["fill"];
            var strokeColor = rule["symbolizer"]["Polygon"]["stroke"];
            print(fillColor, strokeColor)
        }
        
    })
});

// Add the layers to the map after all layers have been created
map.addLayer(basemapLayers);
map.addLayer(overlayLayers);