// Set up map
var Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
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
function onMapDrag() {
	const center = map.getCenter();
	const centerLat = center.lat.toFixed(2);
	const centerLon = center.lng.toFixed(2);
	$('#cords-lat').text(centerLat);
	$('#cords-lon').text(centerLon);
}

map.on('drag', onMapDrag);


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
	const weatherAPI = "http://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + lon + "&appid=0d4413a00459125fa382c5085054f312";

	// Get Bird Data through proxy server because no CORS / JSONP supoort
	const birdAPI = "https://bird-sound-proxy.herokuapp.com/?url=http://www.xeno-canto.org/api/2/recordings?query=box:" + (lat - 0.5) + "," + (lon - 0.5) + "," + (lat + 0.5) + "," + (lon + 0.5);

	$.when(
	    $.getJSON(weatherAPI),
	    $.getJSON(birdAPI)
	).done(function(rawWeatherData, rawBirdData) {

		//
		// Weather Data!
		//

		const weatherData = rawWeatherData[0];
		const rain = weatherData.rain;
		const wind = weatherData.wind.speed;

		// Wind descriptions based on the Beaufort scale
		function describeWind(d) {
				return d > 31  ? 'there is high wind' :
							 d > 25  ? 'there is a strong breeze' :
							 d > 18  ? 'there is a fresh breeze' :
							 d > 13  ? 'there is a moderate breeze' :
							 d > 8   ? 'there is a gentle breeze' :
							 d > 3   ? 'there is a light breeze' :
							 d > 0   ? 'the air is calm' :
												 '' ;
		}

		// load wind audio element based on wind speed
		function hearWind(speed){
			let windFile = '';
			if(speed > 18){
				windFile = '../audio/wind/wind05.mp3';
			} else if (speed > 8) {
				windFile = '../audio/wind/wind03.mp3';
			} else{
				windFile = '../audio/wind/wind01.mp3';
			}
			createAudio(windFile, 'wind');
		}

		// Rain description. Maybe make more descriptive based on amount of rain?
		function describeRain(rain) {return rain ? ' and it&rsquo;s raining' : '';}
		function hearRain(rain) {rain ? createAudio('../audio/rain/rain.mp3'): '';}


		//
		// Bird Data!
		//

		const birdData = rawBirdData[0];
		const birdRecordings = birdData.recordings;
		const uniqueBirds = [];
		const usableBirds = [];
		let birdList = [];

		if (birdRecordings.length > 0) {

			// Find unique birds
			birdRecordings.forEach(bird => {
				if(!uniqueBirds.includes(bird.en)){
					uniqueBirds.push(bird.en);
					usableBirds.push(bird);
				}
			});

			// Pull three random birds
			birdList = usableBirds.sort(() => 0.5 - Math.random()).slice(0,3);

			// Create audio elements
			birdList.forEach(bird => createAudio(bird.file, false));

			console.groupCollapsed('Bird data details');
				console.log(birdData);
				console.log(`Found ${birdRecordings.length} bird recordings.`);
				console.log(`There are ${uniqueBirds.length} unique species.`);
				console.log(`Here are ${birdList.length} random unique birds:`);
				console.log(birdList);
				console.groupEnd();

		} else {
			console.error('There are no bird recordings for this area!')
		}

		// function describeBirds(){
		//
		// 	return "You can hear the " + birds[bird1].birdName + ", "+ birds[bird2].birdName + " and " + birds[bird3].birdName + ".";
		//
		// }



		// Populate soundscape discription from data
		$('#soundscapeDiscription').html(`Here, ${describeWind(wind)} ${describeRain(rain)}.`);
		// ${describeBirds}

		hearRain(rain);
		hearWind(wind);

	});
}

const soundscape = [];

// Create an <audio> element and append it
function createAudio(file, loop) {
	const audio = new Audio();
	audio.src = file;
	audio.controls = false;
	audio.loop = true;
	audio.autoplay = true;
	if (loop === false) {
		audio.loop = false;
	}
	document.body.appendChild(audio);
	soundscape.push(audio);
}


// When the user hits the "Search Again" button
function startOver() {
	$("#listen").fadeOut( 200, function() {
		$('#soundscapeDiscription').html("");
		$("#select").fadeIn( 400 );
	});
	soundscape.forEach(sound => sound.remove());
}
