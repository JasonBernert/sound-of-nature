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
	const weatherAPI = `https://bird-sound-proxy.herokuapp.com/?url=https://api.darksky.net/forecast/a98ca1129fb65f6b32ca53933b44222f/${lat},${lon}`;

	// Get Bird Data through proxy server because no CORS / JSONP supoort
	const birdAPI = `https://bird-sound-proxy.herokuapp.com/?url=http://www.xeno-canto.org/api/2/recordings?query=box:${lat - 0.5},${lon - 0.5},${lat + 0.5},${lon + 0.5}`;

	$.when(
	    $.getJSON(weatherAPI),
	    $.getJSON(birdAPI)
	).done(function(rawWeatherData, rawBirdData) {

		//
		// Weather Data!
		//
		const weatherData = rawWeatherData[0].currently;
		const rain = weatherData.precipIntensity;
		const wind = weatherData.windSpeed;

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
			} else {
				windFile = '../audio/wind/wind01.mp3';
			}
			createAudio(windFile, 'wind');
		}

		// Rain description. Maybe make more descriptive based on amount of rain?
		function describeRain(rain) {return rain > 0 ? ' and it&rsquo;s raining' : '';}
		function hearRain(rain) {rain > 0 ? createAudio('../audio/rain/rain.mp3'): '';}
		hearRain(rain);
		hearWind(wind);

		//
		// Bird Data!
		//

		const birdData = rawBirdData[0];
		const birdRecordings = birdData.recordings;
		const uniqueBirds = [];
		const usableBirds = [];
		let birdList = [];
		let birdDescription = '';

		if (birdRecordings.length > 0) {

			// Find unique birds
			birdRecordings.forEach(bird => {
				if(!uniqueBirds.includes(bird.en) && (bird.en).includes != 'unknown'){
					uniqueBirds.push(bird.en);
					usableBirds.push(bird);
				}
			});

			// Pull three random birds
			birdList = usableBirds.sort(() => 0.5 - Math.random()).slice(0,3);

			if (birdList.length == 3){
				birdDescription = `You can hear the ${birdList[0].en}, ${birdList[1].en} and ${birdList[2].en}.`;
			} else if (birdList.length == 2){
				birdDescription = `You can hear the ${birdList[0].en} and ${birdList[1].en}.`;
			}	else if (birdList.length == 1){
				birdDescription = `You can hear the ${birdList[0].en}.`;
			}

			// Create audio elements
			birdList.forEach(bird => createAudio(bird.file, false));

			console.groupCollapsed('Bird data details');
				console.log(birdData);
				console.log(`Out of ${birdRecordings.length} bird recordings there are ${uniqueBirds.length} unique species. Here are ${birdList.length} random unique birds:`);
				console.log(birdList);
				console.groupEnd();

		} else {
			console.error('There are no bird recordings for this area!')
		}

		// Populate soundscape discription from data
		$('#soundscapeDiscription').html(`Here, ${describeWind(wind)}${describeRain(rain)}. ${birdDescription}`);

	});
}

let soundscape = [];

// Create an <audio> element and append it
function createAudio(file, loop) {
	const audio = new Audio();
	audio.src = file;
	audio.controls = false;
	audio.loop = loop;
	audio.autoplay = true;
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
	soundscape = [];
}
