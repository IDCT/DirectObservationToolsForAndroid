
var obj;
var testll;

var DEBUG_MODE = false;
var DEBUG_SHOW_DIFF_LAYERS = false;
var DEBUG_SHOW_MOUSE_POS = true;
var DEBUG_DISPLAY_OVERVIEW = false;
var DEBUG_DISPLAY_PANZOOM = false;
var DEBUG_FREE_ROTATE = true;
var DEBUG_SHOW_LAYER_SWITCHER = false;

var DEBUG_USE_BROWSER_CACHING = false;



//var mapBounds = new OpenLayers.Bounds( -1.00041666667, 49.9995106059, 1.99995992776, 53.0004166667);
var mapBounds = new OpenLayers.Bounds( 13.3589926433, 42.3394886236, 13.4150903442, 42.3687820513);
var mapMinZoom = 0;
var mapMaxZoom = 20;

// avoid pink tiles
OpenLayers.IMAGE_RELOAD_ATTEMPTS = 3;

 OpenLayers.Util.onImageLoadErrorColor = "transparent";

var map, vectors, myPositions, locationPointLayer, prevSurveyPoints, vectorEditing, controls;

var currentSurveyPointLon = 0;
var currentSurveyPointLat = 0;

var layerNames;
var jsonStr;

var cacheWrite;
var cacheRead;

var selectControl;
var drawPointControl;
var regularPolygonControl;

var ll;

var bingApiKey = "AqTGBsziZHIJYYxgivLBf0hVdrAk9mWO5cQcb8Yux8sW5M8c8opEC2lZqKR1ZZXf";


						 
OpenLayers.Util.onImageLoadError = function () {
    this.src = "img/close.gif";
}

						 
 	
OpenLayers.Control.Click = OpenLayers.Class(OpenLayers.Control, {
		  defaultHandlerOptions: {
			'single': true,
			'double': false,
			'pixelTolerance': 0,
			'stopSingle': false,
			'stopDouble': false
		  },
		  initialize: function(options) {
			this.handlerOptions = OpenLayers.Util.extend(
			  {}, this.defaultHandlerOptions
			);
			OpenLayers.Control.prototype.initialize.apply(
			  this, arguments
			);
			this.handler = new OpenLayers.Handler.Click(
			  this, {
				'click': this.trigger

			  }, this.handlerOptions
			);
		  }
	});


						 /*
OpenLayers.Control.Click = OpenLayers.Class(OpenLayers.Control, {                
                defaultHandlerOptions: {
                    'single': true,
                    'double': false,
                    'pixelTolerance': 0,
                    'stopSingle': false,
                    'stopDouble': false
                },

                initialize: function(options) {
                    this.handlerOptions = OpenLayers.Util.extend(
                        {}, this.defaultHandlerOptions
                    );
                    OpenLayers.Control.prototype.initialize.apply(
                        this, arguments
                    ); 
                    this.handler = new OpenLayers.Handler.Click(
                        this, {
                            'click': this.trigger
                        }, this.handlerOptions
                    );
                }, 

                trigger: function(e) {
                    var lonlat = map.getLonLatFromPixel(e.xy);
                     //                         + lonlat.lon + " E");										  
                    //alert("You clicked near " + lonlat.lat + " N, " +
											  
						// create some attributes for the feature
					var attributes = {name: "my name", bar: "foo"};
					var myLocation = new OpenLayers.Geometry.Point(lonlat.lon, lonlat.lat);
					var feature = new OpenLayers.Feature.Vector(myLocation,attributes);
						
					myPositions.removeAllFeatures();
					
					myPositions.addFeatures([feature]);
					
					myPositions.redraw();
                }

            });
			*/
			

function init(){
    var apiKey = "AqTGBsziZHIJYYxgivLBf0hVdrAk9mWO5cQcb8Yux8sW5M8c8opEC2lZqKR1ZZXf";

	
	map = new OpenLayers.Map({
		div: "map",
		projection: new OpenLayers.Projection("EPSG:900913"),
		displayProjection: new OpenLayers.Projection("EPSG:4326"),
		units: "m",
		//maxResolution: 156543.0339,
		//maxExtent: new OpenLayers.Bounds(-20037508, -20037508, 20037508, 20037508.34),
					
					
		controls: [
           new OpenLayers.Control.TouchNavigation({
                dragPanOptions: {
                    enableKinetic: true
                }
            })
		]
	});

	if (DEBUG_SHOW_LAYER_SWITCHER) {
		map.addControl(new OpenLayers.Control.LayerSwitcher({ roundedCornerColor : '#000000' }));
    }
	
	//var mapnik = new OpenLayers.Layer.OSM();
		

            
	 var mapnik =   new OpenLayers.Layer.OSM("OpenStreetMap", 
            [
                "http://otile1.mqcdn.com/tiles/1.0.0/osm/${z}/${x}/${y}.png",
                 "http://otile2.mqcdn.com/tiles/1.0.0/osm/${z}/${x}/${y}.png",
                  "http://otile3.mqcdn.com/tiles/1.0.0/osm/${z}/${x}/${y}.png",
                   "http://otile4.mqcdn.com/tiles/1.0.0/osm/${z}/${x}/${y}.png"
            ], 
            {
            eventListeners: {
                //tileloaded: updateStatus
            }
    });
   
	
	
    var gphy = new OpenLayers.Layer.Google(
        "Google Physical",
        {type: google.maps.MapTypeId.TERRAIN}
    );
    var gmap = new OpenLayers.Layer.Google(
        "Google Streets", // the default
        {numZoomLevels: 20}
    );
    var ghyb = new OpenLayers.Layer.Google(
        "Google Hybrid",
        {type: google.maps.MapTypeId.HYBRID, numZoomLevels: 20}
    );
    var gsat = new OpenLayers.Layer.Google(
        "Google Satellite",
        {type: google.maps.MapTypeId.SATELLITE, numZoomLevels: 22}
    );
	
	
	
	var bingRoads = new OpenLayers.Layer.Bing({
		key: bingApiKey,
		type: "Road",
		name: "Bing Roads",
		// custom metadata parameter to request the new map style - only useful
		// before May 1st, 2011
		metadataParams: {mapVersion: "v1"}
	});
	
	var bingAerial = new OpenLayers.Layer.Bing({
		key: bingApiKey,
		type: "Aerial",
		name: "Bing Aerial"
	});
	
	var bingHybrid = new OpenLayers.Layer.Bing({
		key: bingApiKey,
		type: "AerialWithLabels",
		name: "Bing Aerial With Labels"
	});
	

		
	//myVectorLayer.addFeatures(GetFeaturesFromKMLString( ));
	

	var streets = new OpenLayers.Layer.XYZ(
		"MapBox Streets",
		[
			"http://a.tiles.mapbox.com/v3/mapbox.mapbox-streets/${z}/${x}/${y}.png",
			"http://b.tiles.mapbox.com/v3/mapbox.mapbox-streets/${z}/${x}/${y}.png",
			"http://c.tiles.mapbox.com/v3/mapbox.mapbox-streets/${z}/${x}/${y}.png",
			"http://d.tiles.mapbox.com/v3/mapbox.mapbox-streets/${z}/${x}/${y}.png"
		], {
			attribution: "Tiles © <a href='http://mapbox.com/'>MapBox</a> | " + 
				"Data © <a href='http://www.openstreetmap.org/'>OpenStreetMap</a> " +
				"and contributors, CC-BY-SA",
			sphericalMercator: true,
			transitionEffect: "resize",
			buffer: 1,
			numZoomLevels: 16
		}
	);


	var cached = new OpenLayers.Layer.XYZ(
		"tiles 2",
		[
			"tiles2/${z}/${x}/${y}.png.tile"
		], {
			attribution: "Tiles © <a href='http://mapbox.com/'>MapBox</a> | " + 
				"Data © <a href='http://www.openstreetmap.org/'>OpenStreetMap</a> " +
				"and contributors, CC-BY-SA",
			sphericalMercator: true,
			transitionEffect: "resize",
			buffer: 1,
			numZoomLevels: 16
		}
	);
	
	
	var sdtiles = new OpenLayers.Layer.XYZ(
		"OpenStreetMap (cached)",
		[
			//"file:////mnt/sdcard/maptiles/mapnik/${z}/${x}/${y}.png.tile"
			//"file:////mnt/sdcard/maptiles/binghybrid/${z}/${x}/${y}.png.tile"
			//"tiles/${z}/${x}/${y}.png.tile"
			"file:////mnt/sdcard/idctdo/maptiles2/sdtiles/${z}/${x}/${y}.png.tile"
		], {
			attribution: "Tiles © " + 
				"Data © <a href='http://www.openstreetmap.org/'>OpenStreetMap</a> " +
				"and contributors, CC-BY-SA",
			sphericalMercator: true,
			transitionEffect: "resize",
			buffer: 1,
			numZoomLevels: 16
		}
	);
	
	var bingHybridCached = new OpenLayers.Layer.XYZ(
		"Bing Aerial With Labels Cached",
		[
			"file:////mnt/sdcard/maptiles/binghybrid/${z}/${x}/${y}.png.tile"
		], {
			attribution: "Tiles © " + 
				"Data © Microsoft" +
				" ",
			sphericalMercator: true,
			transitionEffect: "resize",
			buffer: 1,
			numZoomLevels: 16
		}
	);
	
	
  
					  

	var tiles3 = new OpenLayers.Layer.XYZ(
	        "Cached Tiles 3",
	         "tiles2/${z}/${x}/${y}.png.tile",
	        {
            sphericalMercator: true
        }
	);



					
	var localTMSTiles = new OpenLayers.Layer.XYZ("OpenLayers.Layer.XYZ",
	"tiles/",
	{ 
		type: 'png', 
		getURL: xyz_getTileURL, 
		alpha: true, 
		isBaseLayer: false,
		numZoomLevels: 18	
	});

			
			


	
	myPositions = new OpenLayers.Layer.Vector("My Location", {
		styleMap:  testStyleMap
	});

	locationPointLayer = new OpenLayers.Layer.Vector("Current Survey Point", {
		styleMap:  locationPointLayerStyleMap
	});
	
	prevSurveyPoints = new OpenLayers.Layer.Vector("prevSurveyPoints", {
		styleMap:  surveyPointStyleMap
	});
	
	/*
    map.addLayers([bingHybrid,myPositions,bingRoads,bingAerial,layer,mapnik,streets,cached,tiles3,sdtiles,gphy, gmap, ghyb, gsat,prevSurveyPoints]);
	*/
	
	//map.addLayers([sdtiles,bingHybrid,mapnik,bingRoads,bingAerial,gmap, ghyb, gsat,myPositions,locationPointLayer,prevSurveyPoints]);
	//map.addLayers([bingHybrid,sdtiles,mapnik,bingRoads,bingAerial,gmap, ghyb, gsat,myPositions,locationPointLayer,prevSurveyPoints]);
	

					
	map.addLayers([mapnik,bingHybrid,bingRoads,bingAerial,myPositions,locationPointLayer,prevSurveyPoints,sdtiles,localTMSTiles]);	
	
	/* Causing issues at the moment*/
	//Browser caching
	if (DEBUG_USE_BROWSER_CACHING) {
	    cacheWrite = new OpenLayers.Control.CacheWrite({
	        autoActivate: true,
	        imageFormat: "image/png",
	        eventListeners: {
	            cachefull: function() {
	            	//status.innerHTML = "Cache full.";
	            }
	        }
	    });          
	    map.addControl(cacheWrite);
	    cacheRead = new OpenLayers.Control.CacheRead();
	    map.addControl(cacheRead);    
	}
    
    
    /*
    // User interface for browser caching
    var status = document.getElementById("status");
    document.getElementById("clear").onclick = function() {
        OpenLayers.Control.CacheWrite.clearCache();
        updateStatus();
    };
    
    // update the number of cached tiles and detect local storage support
    function updateStatus() {
        if (window.localStorage) {
            status.innerHTML = localStorage.length + " entries in cache.";
        } else {
            status.innerHTML = "Local storage not supported. Try a different browser.";
        }
    }    
    */
       
	
	
	if (DEBUG_DISPLAY_PANZOOM) {
		map.addControl(new OpenLayers.Control.PanZoomBar());
	}
		 
	 
	map.addControl( new OpenLayers.Control.LoadingPanel());
	 
	
    // Google.v3 uses EPSG:900913 as projection, so we have to
    // transform our coordinates
    map.setCenter(new OpenLayers.LonLat(0.2, 28.9).transform(
        new OpenLayers.Projection("EPSG:4326"),
        map.getProjectionObject()
    ), 5);
    
		
    
	//saveLayout(0,0);

	selectControl = new OpenLayers.Control.SelectFeature(myPositions, {
		hover: true,
		highlightOnly: false,
		multiple:false,
		enderIntent: "temporary",
		clickout: false,
		toggle:false,
		onUnselect: function() {  
		
		},
		onSelect: function(feature) { 

		} 		
	});			
	map.addControl(selectControl);
	selectControl.activate();


	dragControl = new OpenLayers.Control.DragFeature(myPositions, {
		vertexRenderIntent: 'temporary',
		displayClass: 'olControlZoomBox',
		clickout: false,
		onComplete: function(feature,pixel) {
			console.log("drag ended");
			/*
			var feature2 = feature;
			testll = feature;
			
			
			var myLocation = new OpenLayers.Geometry.Point(testll.geometry.x, testll.geometry.y);
			myLocation.transform(map.getProjectionObject(),new OpenLayers.Projection("EPSG:4326"));
			
			console.log("drag ended feature: " + myLocation.x + "," +myLocation.y);
			
			currentSurveyPointLon = myLocation.x;
			currentSurveyPointLon = myLocation.y;
			*/
			//updateSurveyPointLocationInJava(myLocation.x,myLocation.y);
			
		},
		toggle:false
	});	
	map.addControl(dragControl);
	dragControl.activate();

	
	modifyControl = new OpenLayers.Control.ModifyFeature(myPositions, {
		vertexRenderIntent: 'temporary',
		displayClass: 'olControlZoomBox',
		clickout: false,
		toggle:false,

		mode: OpenLayers.Control.ModifyFeature.RESHAPE,
		createVertices: false
	});	
	map.addControl(modifyControl);
	modifyControl.activate();


	polyOptions = {sides: 4};
	regularPolygonControl = new OpenLayers.Control.DrawFeature(locationPointLayer,
									OpenLayers.Handler.RegularPolygon,
									{handlerOptions: polyOptions});
	
	map.addControl(regularPolygonControl);

	/*
	//myPositions.events.on({"beforefeaturesadded": alert("features"), "beforefeatureadded":alert("feature")});
	drawPointControl= new OpenLayers.Control.DrawFeature(myPositions,OpenLayers.Handler.Point),
	map.addControl(drawPointControl);
	drawPointControl.activate();
	*/
	
	

	var click = new OpenLayers.Control.Click( { trigger: function(e) {
		
		console.log("clicked event");		
		console.log("map click MOBILE");
		var lonlat = map.getLonLatFromViewPortPx(e.xy);
		//alert('mousedown');
		// create some attributes for the feature
		
		//myLocation.transform(new OpenLayers.Projection("EPSG:4326"), map.getProjectionObject() );
		console.log("opx" + lonlat);
		
		var myLocation = new OpenLayers.Geometry.Point(lonlat.lon, lonlat.lat );
		myLocation.transform(map.getProjectionObject(),new OpenLayers.Projection("EPSG:4326"));		
		drawCandidateSurveyPoint(myLocation.x, myLocation.y);
		
		
	}});
	 
	map.addControl(click);
    click.activate();
    
    

	//This doesn't seem to work on the Galaxy Tab / Android 2.3.4
	map.events.register("click", map , function(e){
		/*
			console.log("clicked event");		
			console.log("map click MOBILE");
			var lonlat = map.getLonLatFromViewPortPx(e.xy);
			//alert('mousedown');
			// create some attributes for the feature
			
			//myLocation.transform(new OpenLayers.Projection("EPSG:4326"), map.getProjectionObject() );
			console.log("opx" + lonlat);
	
			
			var attributes = {name: "my position"};
			
			var myLocation = new OpenLayers.Geometry.Point(lonlat.lon, lonlat.lat);
			var feature = new OpenLayers.Feature.Vector(myLocation,attributes);
				
			myPositions.removeAllFeatures();			
			myPositions.addFeatures([feature]);			
			myPositions.redraw();	
			
			
			//lonlat.transform(map.getProjectionObject(),new OpenLayers.Projection("EPSG:4326"));

			updateSurveyPointLocationInJava(lonlat.lon,lonlat.lat);
			*/
	});
	
	
	
	
	
	map.events.register('mousedown', function() { alert('mousedown')});
	
	// add animation transition when zooming 
	for (var i=map.layers.length-1; i>=0; --i) {
		map.layers[i].animationEnabled = true;
	}
    
	
	//map.setCenter(new OpenLayers.LonLat(point.x, point.y), 5);

	
	var ll = new OpenLayers.LonLat(-1, 52);
    map.setCenter(ll.transform(
        new OpenLayers.Projection("EPSG:4326"),
        map.getProjectionObject()
    ), 5);
    
	
	
	//locateMe(52.95185706277731, -1.182725429534912,50,true);
	
	var defaultLL = new OpenLayers.LonLat(-1.182725429534912,52.95185706277731);
	defaultLL.transform(	new OpenLayers.Projection("EPSG:4326"),	map.getProjectionObject());
	map.setCenter(defaultLL, 6);
    

	
	// create some attributes for the feature
	//var attributes = {name: "my name", bar: "foo"};

	var myLocation = new OpenLayers.Geometry.Point(ll.lon, ll.lat);
	//var feature = new OpenLayers.Feature.Vector(myLocation, attributes);
	var feature = new OpenLayers.Feature.Vector(myLocation);
	
	
	//Load in dummy survey points around BGS office
	var points = new Array(
				  new OpenLayers.Geometry.Point(-1.07581,52.87976),
				  new OpenLayers.Geometry.Point(-1.080536,52.878658),
				  new OpenLayers.Geometry.Point( -1.080434, 52.878576),
				  new OpenLayers.Geometry.Point(  -1.080913,  52.879008)
				  );
				  
    for (var i = 0; i < points.length; i++) {	

		var myLocation = points[i];
		myLocation.transform(new OpenLayers.Projection("EPSG:4326"), map.getProjectionObject() );
		// create some attributes for the feature
		var attributes = {name: "my name", bar: "foo"};
		var feature = new OpenLayers.Feature.Vector(myLocation, attributes);
		
		prevSurveyPoints.addFeatures([feature]);
	}
	prevSurveyPoints.redraw();
	
	
	//getLayersNames();
	//getCurrentLocation();
	
	/*
	var myLocation = new OpenLayers.Geometry.Point(-131653.22657435,6974000.4013905);
	var feature = new OpenLayers.Feature.Vector(myLocation,attributes);
	myPositions.addFeatures([feature]);		
		*/	
	 //loadSurveyPoints(-1.1841098, 52.9516616); 
} //end of init()



function drawCandidateSurveyPoint(lon, lat) {
		var attributes = {name: "my position"};		
		var myLocation = new OpenLayers.Geometry.Point(lon, lat);
		myLocation.transform(new OpenLayers.Projection("EPSG:4326"), map.getProjectionObject() );
		var feature = new OpenLayers.Feature.Vector(myLocation,attributes);           
	
		myPositions.removeAllFeatures();			
		myPositions.addFeatures([feature]);			
		myPositions.redraw();
		
		/*
	    while( map.popups.length ) {
        	map.removePopup(map.popups[0]);
        	
    	}
		popup = new OpenLayers.Popup("chicken", 
                                 feature.geometry.getBounds().getCenterLonLat(),
                                 null,
                                 "<div style='font-size:1em'>Feature: </div>",
                                 null, false);
        feature.popup = popup;
        map.addPopup(popup);
        */
        
        
		updateSurveyPointLocationInJava();
		
}
function addBaseLayers() {
	
}


function locateMe(latitude,longitude,locationAccuracy,setCentre) {
	/*document.getElementById('boldStuff2').innerHTML = "saving layout..." + latitude + ", " + longitude; */

	ll = new OpenLayers.LonLat(longitude,latitude);
	//console.log("ll " + ll);
	
	ll.transform(	new OpenLayers.Projection("EPSG:4326"),	map.getProjectionObject());
	if (setCentre) { 
		map.setCenter(ll, 17);
    }

	// create some attributes for the feature
	//var attributes = {name: "my name", bar: "foo"};

	var myLocation = new OpenLayers.Geometry.Point(ll.lon, ll.lat);
	//var feature = new OpenLayers.Feature.Vector(myLocation, attributes);
	var feature = new OpenLayers.Feature.Vector(myLocation);

	// stuff for drawing lines
	/*
   var points = new Array(
				  new OpenLayers.Geometry.Point(ll.lon, ll.lat),
				  new OpenLayers.Geometry.Point(ll.lon+10, ll.lat+150)
				  );



	var line = new OpenLayers.Geometry.LineString(points);

	var style = { strokeColor: '#0000ff', 
				strokeOpacity: 0.5,
				strokeWidth: 15,
				fillOpacity: 0.5,
				pointRadius: 15,
	};

	var lineFeature = new OpenLayers.Feature.Vector(line, null, style);
	*/

	
	locationPointLayer.removeAllFeatures();
	
	
	var origin = new OpenLayers.Geometry.Point(ll.lon, ll.lat);

    var circle = OpenLayers.Geometry.Polygon.createRegularPolygon(origin, locationAccuracy, 40,0);

	var circleFeature = new OpenLayers.Feature.Vector(circle, null);
		
	locationPointLayer.addFeatures([circleFeature,feature]);
	
	locationPointLayer.redraw();
	
}





function clearMyPositions() {
	myPositions.removeAllFeatures();
	myPositions.redraw();
}


function clearMySurveyPoints() {
	prevSurveyPoints.destroyFeatures();
}

function loadSurveyPointsOnMap(lon,lat) {
	var points = new Array(
				  new OpenLayers.Geometry.Point(lon,lat)
				  );
    for (var i = 0; i < points.length; i++) {	

		var myLocation = points[i];
		myLocation.transform(new OpenLayers.Projection("EPSG:4326"), map.getProjectionObject() );
		// create some attributes for the feature
		var attributes = {name: "my name", bar: "foo"};
		var feature = new OpenLayers.Feature.Vector(myLocation, attributes);
		
		prevSurveyPoints.addFeatures([feature]);
	}
	prevSurveyPoints.redraw();
}

function updateSurveyPointLocationInJava() {
	
	var pt = myPositions.features[0].geometry;
	var myLocation = new OpenLayers.Geometry.Point(pt.x, pt.y);

	myLocation.transform(map.getProjectionObject(),new OpenLayers.Projection("EPSG:4326"));
	console.log("updating survey point: " + myLocation.x + "," + myLocation.y);
	try {
		var jsonData = window.webConnector.loadSurveyPoint(myLocation.x, myLocation.y);
	} catch(err) {
		console.log("loadSurveyPoint err");		
	}
}

function getSurveyPoint() {
	updateSurveyPointLocationInJava();	
}





function startNextScreen() {
	var result = window.webConnector.loadLayerNames();  
}

function getCurrentLocation() {
	try	  {
		var jsonData = window.webConnector.getCurrentLocation();
		//var parsedJson = jQuery.parseJSON(jsonData);
		var lon = jsonData['longitude'];
		var lat = jsonData.latitude;
		//document.getElementById('debugText').innerHTML = "result" + jsonData + "lat" + lat + "lon" + lon;
	
	} catch(err) {
	
	}	
}



function getLayersNames() {
	var layers = map.layers;
	layerNames = [];
	
	for (var i = 0; i < layers.length; i++) {
		layerNames[i] = layers[i].name;
	}
	var jsonWriter = new OpenLayers.Format.GeoJSON();
	jsonStr = jsonWriter.write(layerNames, true);
	jsonStr = layerNames;
	
	var strFromJava = window.webConnector.loadLayerNames(jsonStr);  
	
}

function nextLayer(index) {
	var currentBaseLayer = map.baseLayer;
	var currentLayerIndex = map.getLayerIndex(currentBaseLayer);
	var layers = map.layers;
	map.setBaseLayer(layers[currentLayerIndex+index]);
}


function setMapLayer(index) {
	var layers = map.layers;
	map.setBaseLayer(layers[index]);
}


function addOfflineBaseMap(tileLocationPath,zoom) {
	var zoomLevel = parseInt(zoomLevel);
	var layers = map.layers;	
	//Remove the last layer i.e. the offline map layer
	map.removeLayer(layers[layers.length-1]);
	
	var sdtiles = new OpenLayers.Layer.XYZ(
		"OpenStreetMap (cached)",
		[
			//"file:////mnt/sdcard/maptiles/mapnik/${z}/${x}/${y}.png.tile"
			//"file:////mnt/sdcard/maptiles/binghybrid/${z}/${x}/${y}.png.tile"
			//"tiles/${z}/${x}/${y}.png.tile"
			//"file:////mnt/sdcard/idctdo/maptiles2/sdtiles/${z}/${x}/${y}.png.tile"
			tileLocationPath + "${z}/${x}/${y}.png.tile"
		], {

			attribution: "Tiles © " + 
				"Data © <a href='http://www.openstreetmap.org/'>OpenStreetMap</a> " +
				"and contributors, CC-BY-SA",
			sphericalMercator: true,
			transitionEffect: "resize",
			buffer: 1,
			numZoomLevels: 17
		}
	);	
	map.addLayer(sdtiles);
	var layers = map.layers;
	map.setBaseLayer(layers[layers.length-1]);
}


function addOfflineTMSMap(tileLocationPath,zoom) {

	var zoomLevel = parseInt(zoomLevel);
	var layers = map.layers;	
	//Remove the last layer i.e. the offline map layer
	map.removeLayer(layers[layers.length-1]);
	
	var localTMSTiles = new OpenLayers.Layer.XYZ("OpenLayers.Layer.XYZ",
	tileLocationPath,
	{ 
		type: 'png', 
		getURL: xyz_getTileURL, 
		alpha: true, 
		isBaseLayer: false,
		numZoomLevels: 18	
	});

	map.addLayer(localTMSTiles);
	var layers = map.layers;
	map.setBaseLayer(layers[layers.length-1]);
}



function addLocalKmlLayer(localFilePath) {

/*
   var sundials = new OpenLayers.Layer.Vector("KML", {
			projection: map.displayProjection,
			strategies: [new OpenLayers.Strategy.Fixed()],
			protocol: new OpenLayers.Protocol.HTTP({
				url: "http://dev.openlayers.org/releases/OpenLayers-2.12/examples/kml/sundials.kml",
				//url: localFilePath,
				format: new OpenLayers.Format.KML({
					extractStyles: true,
					extractAttributes: true
				})
			})
		});
		
	map.addLayers([sundials]);
	*/
	

}

function addKmlStringToMap(kmlString) {
	var layer = new OpenLayers.Layer.Vector("KML");
    layer.addFeatures(GetFeaturesFromKMLString(kmlString));
    map.addLayer(layer);
}



function GetFeaturesFromKMLString (strKML) {
	var format = new OpenLayers.Format.KML({
		'internalProjection': map.baseLayer.projection,
		'externalProjection': new OpenLayers.Projection("EPSG:4326")
	});
	return format.read(strKML);
};





function osm_getTileURL(bounds) {

	//console.log("zoom:" + map.getZoom());
	var res = this.map.getResolution();
	//console.log("res: "+ res);
	var x = Math.round((bounds.left - this.maxExtent.left) / (res * this.tileSize.w));	
	var y = Math.round((this.maxExtent.top - bounds.top) / (res * this.tileSize.h));
	var z = map.getZoom();
	var limit = Math.pow(2, z);
	console.log("xyz: "+ this.url + z + "/" + x + "/" + y + "." + this.type);
	if (y < 0 || y >= limit) {
		return "http://www.maptiler.org/img/none.png";
	} else {
		x = ((x % limit) + limit) % limit;
		return this.url + z + "/" + x + "/" + y + "." + this.type;
	}
}


function overlay_getTileURL(bounds) {
	var res = this.map.getResolution();
	var x = Math.round((bounds.left - this.maxExtent.left) / (res * this.tileSize.w));
	var y = Math.round((bounds.bottom - this.tileOrigin.lat) / (res * this.tileSize.h));
	var z = this.map.getZoom();
	if (this.map.baseLayer.name == 'Virtual Earth Roads' || this.map.baseLayer.name == 'Virtual Earth Aerial' || this.map.baseLayer.name == 'Virtual Earth Hybrid') {
	   z = z + 1;
	}
	if (mapBounds.intersectsBounds( bounds ) && z >= mapMinZoom && z <= mapMaxZoom ) {
	   //console.log( this.url + z + "/" + x + "/" + y + "." + this.type);
	   return this.url + z + "/" + x + "/" + y + "." + this.type;
	} else {
	   return "http://www.maptiler.org/img/none.png";
	}
}	


//This function allows a TMS tileset to be used with OpenLayers.Layer.XYZ
function xyz_getTileURL(bounds) {
	var res = this.map.getResolution();
	var x = Math.round((bounds.left - this.maxExtent.left) / (res * this.tileSize.w));
	var y = Math.round((this.maxExtent.top - bounds.top) / (res * this.tileSize.h));
	var z = this.map.getZoom();
	
	if (this.map.baseLayer.name == 'Bing Roads' || this.map.baseLayer.name == 'Bing Aerial' || this.map.baseLayer.name == 'Bing Aerial With Labels') {
	   z = z + 1;
	}
	
	var limit = Math.pow(2, z);
	console.log("xyz: "+ this.url + z + "/" + x + "/" + y + "." + this.type);
	  x = ((x % limit) + limit) % limit;
	  y = Math.pow(2,z) - y - 1;
	  return this.url + z + "/" + x + "/" + y + "." + this.type;
}
			