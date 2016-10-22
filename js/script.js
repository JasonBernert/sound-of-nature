// Set up map
var Esri_WorldImagery = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});

var map = L.map('map', {
  scrollWheelZoom: false,
  center: [40, -98],
  zoom: 4,
  minZoom: 4,
  maxZoom: 4,
	worldCopyJump: true
 });

map.addLayer(Esri_WorldImagery);
map.doubleClickZoom.disable();

// Hiding with jQuery to later show with jQuery
$('.leaflet-top').hide();
$('.leaflet-control-attribution').hide();

// Populates cordinates when you move the map on the explore screen
map.on('drag', onMapDrag);

function onMapDrag(e) {
  var center = map.getCenter();
  var centerLat = center.lat.toFixed(2);
  var centerLon = center.lng.toFixed(2);
  $('#cords-lat').text(centerLat);
  $('#cords-lon').text(centerLon);
}

// When the user hits the explore button
function next(){
    $("#welcome").fadeOut( 500, function() {
      $("#select").fadeIn( 500 );
      // $('.leaflet-top').fadeIn( 500 );
      // $('.leaflet-control-attribution').fadeIn( 500 );
    });
}

// Create audio context
var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioCtx = new AudioContext();
var bufferLoader;
var gainNode = audioCtx.createGain();

// When the user hits the listen button
function listen(){

  $("#select").fadeOut( 500, function() {
    $("#listen").fadeIn( 1000 );
  });

  // Leaflet funtion to get lat and lon of center of the map
  var center = map.getCenter();
  var lat = center.lat;
  var lon = center.lng;


  // Format API calls with latitude and longitude
  var weatherAPI = "http://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + lon + "&appid=0d4413a00459125fa382c5085054f312";

	// Get Bird Data methods: point of box
  var birdAPI = "http://www.xeno-canto.org/api/2/recordings?query=lat:" + lat + ",lon:" + lon + "callback=?";
	var birdExampleAPI = "js/birdExampleData.json";
	var birdBoxAPI = "http://www.xeno-canto.org/api/2/recordings?query=box:" + (lat - 0.5) + "," + (lon - 0.5) + "," + (lat + 0.5) + "," + (lon + 0.5)+ "callback=?";
  var birdBoxExampleAPI = "http://www.xeno-canto.org/api/2/recordings?query=box:45.5,-122.0,46.0,-121.0";
	// console.log(birdAPI);

	$.when(
	    $.getJSON(weatherAPI),
	    $.getJSON(birdExampleAPI)
	).done(function(rawWeatherData, rawBirdData) {

		// Weather Data!
		var weatherData = rawWeatherData[0];
		// console.log(weatherData);
		// Wind descriptions based on the Beaufort scale
		function describeWind(d) {
				return d > 31  ? 'there is high wind' :
							 d > 25  ? 'there is a strong breeze' :
							 d > 18  ? 'there is a fresh breeze' :
							 d > 13  ? 'there is a moderate breeze' :
							 d > 8   ? 'there is a gentle breeze' :
							 d > 3   ? 'there is a light breeze' :
							 d > 0   ? 'the air is calm' :
												 '';
		}

		function hearWind(d){
			return d > 31  ? '../audio/wind/wind01.mp3' :
						 d > 25  ? '../audio/wind/wind01.mp3' :
						 d > 18  ? '../audio/wind/wind01.mp3' :
						 d > 13  ? '../audio/wind/wind01.mp3' :
						 d > 8   ? '../audio/wind/wind01.mp3' :
						 d > 3   ? '../audio/wind/wind01.mp3' :
						 d > 0   ? '../audio/wind/wind01.mp3' :
											 '';
		}

		// Rain description. Maybe make more descriptive based on amount of rain?
		function describeRain(d) {
				if (d.rain){
					return ' and it&rsquo;s raining'
				} else {
					return ''
				}
		}


		// Bird Data!
		var birdData = rawBirdData[0];
		// console.log(birdData);

		var flags = [], birds = [], l = birdData.recordings.length, i;
		for( i=0; i<l; i++) {
		    if( flags[birdData.recordings[i].en]) continue;
		    flags[birdData.recordings[i].en] = true;
		    birds.push({birdName: birdData.recordings[i].en.toLowerCase(), birdCall: birdData.recordings[i].file});
		}

		// console.log(birds);

		// Bird description.
		function describeBirds(d){
			return "You can hear the " + d[0].birdName + ", " + d[1].birdName + ", and " + d[2].birdName;
		}

		// Populate soundscape discription from data
		$('#soundscapeDiscription').html("Here, "
			+ describeWind(weatherData.wind.speed)
			+ describeRain(weatherData)
			+ ". "
			+ describeBirds(birds)
			+ "."
		);




		// Create list of sound links for buffers
		var bufferList = []
		bufferList.push(hearWind(weatherData.wind.speed));
		if (weatherData.rain){
			bufferList.push('../audio/rain/rain.mp3');
		}

		// Load buffers
		bufferLoader = new BufferLoader(audioCtx,bufferList,finishedLoading);
		bufferLoader.load();

		function finishedLoading(bufferList) {
			for (var i = 0; i < bufferList.length; i++) {
				var source = audioCtx.createBufferSource();
				source.buffer = bufferList[i];
		    gainNode.gain.value = 1;
				source.connect(gainNode);
				gainNode.connect(audioCtx.destination);
				source.loop = true;
				source.start();
			}
		}

	});
}

// When the user hits the "Search Again" button
function startOver() {
	$("#listen").fadeOut( 200, function() {
		$('#soundscapeDiscription').html("");
    $("#select").fadeIn( 400 );
  });

	gainNode.disconnect();

}
