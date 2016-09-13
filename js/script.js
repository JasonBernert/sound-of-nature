// Set up map

  var Esri_WorldImagery = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  	// attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  });

  var map = L.map('map', {
    scrollWheelZoom: false,
    center: [40, -98],
    zoom: 4
   });

  map.addLayer(Esri_WorldImagery);
  $('.leaflet-top').hide();


  // function onMapClick(e) {
  //
  //   // Leaflet funtion to get lat and lon of clicked location on the map
  //   var lat = e.latlng.lat.toFixed(2);
  //   var lon = e.latlng.lng.toFixed(2);
  //
  //   var birdAPI = "http://www.xeno-canto.org/api/2/recordings?query=lat:" + lat + ",lon:" + lon +"callback=?";
  //
  //   // console.log(birdAPI);
  //
  //   // $.getJSON("http://www.xeno-canto.org/api/2/recordings?query=bearded%20bellbird%20q:A?callback=?",function(json){
  //   //   console.log(json);
  //   // });
  // }
  //
  // // map.on('click', onMapClick);





// Disable drag and zoom handlers.
// map.dragging.disable();
// map.touchZoom.disable();
// map.doubleClickZoom.disable();
// map.scrollWheelZoom.disable();
// map.keyboard.disable();
//
// // Disable tap handler, if present.
// if (map.tap) map.tap.disable();


function next(){
  $('#welcome').hide();
  $('#select').show();
  // $('.leaflet-top').show();

}
