var curLat;
var curLon;

window.onload = function() {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(geolocationSuccess, geolocationFailure);
	}
	else {
		console.log("This browser doesn't support geolocation.");
	}
};

function geolocationSuccess(position) {
	curLat = position.coords.latitude;
	curLon = position.coords.longitude;
	initMap(curLat, curLon, document.getElementById('curLocation'));
}

function geolocationFailure(error) {
	console.log("Geolocation failed: " + error.message);
}



function drag(e) {
    e.dataTransfer.setData("text", e.target.id);
}

function drop(e) {
    e.preventDefault();

    var file = e.dataTransfer.files[0],
    reader = new FileReader();
    reader.onload = function(e) {
		document.getElementById("droppable-text").innerText = "File successfully loaded.";
		var r = reader.result;
        var pairs = r.split('\n');
		var i;
		console.log("pairs = " + pairs);
		for (i = 0; i < pairs.length - 1; i++) {
			var locations = document.getElementById('locationsOnFile');
			var location = document.createElement("div");
			location.setAttribute('class', 'map');
			locations.appendChild(location);

			var coordinates = pairs[i].split(',');
			console.log("coordinates = " + coordinates);
			console.log("lat:" + coordinates[0]);
			console.log("lon:" + coordinates[1]);
			initMap(parseInt(coordinates[0]), parseInt(coordinates[1]), location);
		}
    };
	reader.readAsText(file);
}

function allowDrop(e) {
    e.preventDefault();
}

function initMap(latitude, longitude, container) {
    var location = {lat: latitude, lng: longitude};
    var map = new google.maps.Map(container, {
      zoom: 5,
      center: location
    });
    var marker = new google.maps.Marker({
      position: location,
      map: map
    });
	var geocoder = new google.maps.Geocoder;
	var infowindow = new google.maps.InfoWindow;
	var latlng = {lat: latitude, lng: longitude};
	geocoder.geocode({'location': latlng}, function(results, status) {
	    if (status === 'OK') {
	      if (results[0]) {
	        map.setZoom(10);
	        var marker = new google.maps.Marker({
	          position: latlng,
	          map: map
	        });
	        infowindow.setContent(results[0].formatted_address);
	        infowindow.open(map, marker);
	      } else {
	        window.alert('No results found');
	      }
	    } else {
	      window.alert('Geocoder failed due to: ' + status);
	    }
  	});
}
