/* global L */

// Set up map
const esriWorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}');

let lat = 40;
let lon = -98;
const map = L.map('map', {
  scrollWheelZoom: false,
  center: [lat, lon],
  zoom: 4,
  zoomControl: false,
  minZoom: 4,
  maxZoom: 4,
  worldCopyJump: true,
});
map.addLayer(esriWorldImagery);
map.doubleClickZoom.disable();

// If allowed, find user location
function locationSuccess(position) {
  const userLat = position.coords.latitude;
  const userLon = position.coords.longitude;
  map.panTo([userLat, userLon]);
  lat = userLat;
  lon = userLon;
  $('#cords-lat').text(lat.toFixed(2));
  $('#cords-lon').text(lon.toFixed(2));
}

navigator.geolocation.getCurrentPosition(locationSuccess);

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
function next() {
  $('#welcome').fadeOut(500, () => {
    $('#select').fadeIn(500);
  });
}

// When the user hits the listen button
function listen() {
  $('#select').fadeOut(500, () => {
    $('#listen').fadeIn(1000);
  });

  // Leaflet funtion to get lat and lon of center of the map
  const center = map.getCenter();
  const lat = center.lat;
  const lon = center.lng;

  // Format API call with latitude and longitude
  const weatherAPI = `https://bird-sound-proxy.herokuapp.com/?url=https://api.darksky.net/forecast/a98ca1129fb65f6b32ca53933b44222f/${lat},${lon}`;

  // Get Bird Data through proxy server because no CORS / JSONP supoort
  const birdAPI = `https://bird-sound-proxy.herokuapp.com/?url=http://www.xeno-canto.org/api/2/recordings?query=box:${lat - 0.5},${lon - 0.5},${lat + 0.5},${lon + 0.5}`;

  function getData(url) {
    const promise = new Promise(((resolve, reject) => {
      fetch(url)
        .then(response => response.json())
        .then((data) => {
          resolve(data);
        }).catch((err) => {
          console.error(err);
        });
    }));
    return promise;
  }

  const describeWeather = (weather) => {
    const rain = weather.currently.precipIntensity;
    const wind = weather.currently.windSpeed;

    // Wind descriptions based on the Beaufort scale
    function describeWind(speed) {
      return speed > 31 ? 'there is high wind'
							 : speed > 25 ? 'there is a strong breeze'
							 : speed > 18 ? 'there is a fresh breeze'
							 : speed > 13 ? 'there is a moderate breeze'
							 : speed > 8 ? 'there is a gentle breeze'
							 : speed > 3 ? 'there is a light breeze'
							 : speed > 0 ? 'the air is calm'
												 : '';
    }

    function describeRain(rain) {
      return rain > 0 ? ' and it&rsquo;s raining' : '';
    }

    // Populate soundscape discription from data
    $('#soundscapeDiscription').html(`Here, ${describeWind(wind)}${describeRain(rain)}.`);
    return weather;
  };

  const hearWeather = (weather) => {
    const rain = weather.currently.precipIntensity;
    const wind = weather.currently.windSpeed;

    function hearWind(windSpeed) {
      let windFile = '';
      if (windSpeed > 13) {
        windFile = 'http://www.zapsplat.com/wp-content/uploads/2015/sound-effects-four/nature_wind_trees_strong_park_001.mp3';
      } else {
        windFile = 'http://www.zapsplat.com/wp-content/uploads/2015/sound-effects-four/nature_wind_breeze_against%20slighty_open_window_from_inside.mp3';
      }
      createAudio(windFile, true);
    }

    function hearRain(rain) {
      rain > 0 ? createAudio('http://www.zapsplat.com/wp-content/uploads/2015/sound-effects-one/weather_rain_med_light_back_yard.mp3', true) : '';
    }

    hearRain(rain);
    hearWind(wind);
  };

  function describeBirds(birds) {
    const birdRecordings = birds.recordings;
    let birdList = [];
    const uniqueBirds = [];
    const usableBirds = [];
    let birdDescription = '';

    if (birdRecordings.length > 0) {
      // Find unique birds
      birdRecordings.forEach((bird) => {
        if (!uniqueBirds.includes(bird.en) && (bird.en).includes !== 'unknown') {
          uniqueBirds.push(bird.en);
          usableBirds.push(bird);
        }
      });

      // Pull three random birds
      birdList = usableBirds.sort(() => 0.5 - Math.random()).slice(0, 3);

      if (birdList.length === 3) {
        birdDescription = `You can hear the ${birdList[0].en}, ${birdList[1].en} and ${birdList[2].en}.`;
      } else if (birdList.length === 2) {
        birdDescription = `You can hear the ${birdList[0].en} and ${birdList[1].en}.`;
      } else if (birdList.length === 1) {
        birdDescription = `You can hear the ${birdList[0].en}.`;
      }

      // Populate soundscape discription from data
      $('#soundscapeDiscription').append(` ${birdDescription}`);
    }

    if (birdList.length > 0) {
      return birdList;
    }
    console.log('There are no bird recordings for this area!');
  }

  function hearBirds(birdList) {
    if (!birdList) { return; }
    birdList.forEach(bird => createAudio(bird.file, false));
  }

  getData(weatherAPI)
    .then(describeWeather)
    .then(hearWeather);

  getData(birdAPI)
    .then(describeBirds)
    .then(hearBirds);
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

  audio.addEventListener('timeupdate', () => {
    const buffer = 0.6;
    if (this.currentTime > this.duration - buffer) {
      this.currentTime = 0;
      this.play();
    }
  }, false);
}

// When the user hits the "Search Again" button
function startOver() {
  $('#listen').fadeOut(200, () => {
    $('#select').fadeIn(400);
  });
  soundscape.forEach(sound => sound.remove());
  soundscape = [];
}

$('#startOverButton').click(startOver);
$('#listenButton').click(listen);
$('#startButton').click(next);
