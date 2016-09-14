  // Set up map
  var Esri_WorldImagery = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  });

  var map = L.map('map', {
    scrollWheelZoom: false,
    center: [40, -98],
    zoom: 4,
    minZoom: 3,
    maxZoom: 10
   });

  map.addLayer(Esri_WorldImagery);

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



function next(){
  $('#welcome').hide();
  $('#select').show();
  // $('.leaflet-top').show();
  // $('.leaflet-control-attribution').show();
}

function listen(){
  $('#select').hide();
  $('#listen').show();

  // Leaflet funtion to get lat and lon of center of the map
  var center = map.getCenter();
  var lat = center.lat;
  var lon = center.lng;
  console.log(lat + ", " + lon);

  var weatherAPI = "http://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + lon + "&appid=0d4413a00459125fa382c5085054f312";
  // $.getJSON(weatherAPI, function(weatherData){
  //   console.log(weatherData.name);
  // });

  var birdAPI = "http://www.xeno-canto.org/api/2/recordings?query=lat:" + lat + ",lon:" + lon + "callback=?";
  // console.log('http://www.xeno-canto.org/api/2/recordings?query=box:45.5,-122.0,46.0,-121.0&callback=?');
  // $.getJSON('http://www.xeno-canto.org/api/2/recordings?query=box:45.5,-122.0,46.0,-121.0&callback=?', function(birdData){
  //   console.log(birdData);
  // });

}

function startOver() {
  $('#listen').hide();
  $('#welcome').show();
}
