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

// Create audio context
var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioCtx = new AudioContext();
var bufferLoader;
var masterGain = audioCtx.createGain();
masterGain.gain.value = 0.8;
masterGain.connect(audioCtx.destination);

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

	// Get Bird Data through proxy server because no CORS / JSONP supoort
	var birdExampleAPI = "js/birdExampleData.json";
	var birdAPI = "http://bird-sound-proxy.herokuapp.com/?url=http://www.xeno-canto.org/api/2/recordings?query=lat:" + lat + ",lon:" + lon;
	var birdBoxAPI = "http://bird-sound-proxy.herokuapp.com/?url=http://www.xeno-canto.org/api/2/recordings?query=box:" + (lat - 0.5) + "," + (lon - 0.5) + "," + (lat + 0.5) + "," + (lon + 0.5);

	$.when(
	    $.getJSON(weatherAPI),
	    $.getJSON(birdBoxAPI)
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
			return d > 31  ? '../audio/wind/wind05.mp3' :
						 d > 25  ? '../audio/wind/wind05.mp3' :
						 d > 18  ? '../audio/wind/wind05.mp3' :
						 d > 13  ? '../audio/wind/wind03.mp3' :
						 d > 8   ? '../audio/wind/wind03.mp3' :
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

		// Bird description.
		function describeBirds(d){
			if (d.numRecordings > 0) {
				console.log('Found ' + d.numRecordings + ' birds');
				// console.log(d);

				// Get unique Birds
				var flags = [], birds = [], l = birdData.recordings.length, i;
				for( i=0; i<l; i++) {
				    if( flags[birdData.recordings[i].en]) continue;
				    flags[birdData.recordings[i].en] = true;
						birds.push({birdName: birdData.recordings[i].en.toLowerCase(), birdCall: birdData.recordings[i].file});
				}
				console.log('There are ' + birds.length + ' unique birds.');
				// console.log(birds);

				if (birds.length >= 3) {
					var bird1 = randomNumber(birds);
					var bird2 = randomNumber(birds);
					var bird3 = randomNumber(birds);
					console.log('Reducing to three just birds, becuase I like the rule of threes.');
					// $("#birdAudio").html('<audio><source src="' + birds[bird1].birdCall + '"></audio>');
					createAudio(birds[bird1].birdCall);


					return "You can hear the " + birds[bird1].birdName + ", "+ birds[bird2].birdName + " and " + birds[bird3].birdName + ".";

				} else if (birds.length == 3){
					return "You can hear the " + birds[0].birdName + ", " + birds[1].birdName + " and " + birds[2].birdName + ".";
				} else if (birds.length == 2){
					return "You can hear the " + birds[0].birdName + " and " + birds[1].birdName + ".";
				} else if (birds.length == 1) {
					return "You can hear the " + birds[0].birdName + ".";
				}

			} else {
				return ""
			}
		}

		// Populate soundscape discription from data
		$('#soundscapeDiscription').html("Here, "
			+ describeWind(weatherData.wind.speed)
			+ describeRain(weatherData)
			+ ". "
			+ describeBirds(birdData)
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

		// Create AudioBufferSource Nodes
		function finishedLoading(bufferList) {
			for (var i = 0; i < bufferList.length; i++) {
				var source = audioCtx.createBufferSource();
				source.buffer = bufferList[i];
				source.connect(masterGain);
				masterGain.connect(audioCtx.destination);
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
	masterGain.disconnect();
}

function randomNumber(d){
	return Math.floor(Math.random() * d.length);
}

// Create an <audio> element and append to Bird Sounds div
function createAudio(file) {
	var audio = new Audio();
	audio.src = file;
	audio.controls = false;
	audio.autoplay = true;
	document.body.appendChild(audio);

	audio.addEventListener('canplaythrough', function() {
		var source = audioCtx.createMediaElementSource(audio);
		console.log(source);
		source.connect(masterGain);
	}, false);

}
