var first = true;
var curAddress;
var curLat;
var curLon;
var cusLat;
var cusLon;
var checked = true;
var worker;
var allCoords = [];
var calcBtns = [];
var distanceLabels = [];
var message;

window.onload = function() {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(geolocationSuccess, geolocationFailure);
	}
	else {
		console.log("This browser doesn't support geolocation.");
	}
	document.getElementById("search-bar").setAttribute("disabled","disabled");
	document.getElementById("search-bar").setAttribute("placeholder","current location is selected");
	document.getElementById("submit").setAttribute("disabled","disabled");
	document.getElementById("submit").style.cursor = "default";
	document.getElementById("switch").innerHTML = "current";
	document.getElementById("search-bar").value = "";
};

function startWorker(message) {
	if (typeof(worker) == "undefined") {
		worker = new Worker("worker.js");
	}
	worker.addEventListener("message", function(e) {
		var msg = e.data;
		//console.log("Worker said: distance is " + msg.distance + " and locIndex is " + msg.locIndex);
		distanceLabels[msg.locIndex].innerHTML = msg.distance + " km";
		stopWorker();
	}, false);

	worker.postMessage(message);
}

function stopWorker() {
	worker.terminate();
	worker = undefined;
}

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
		for (i = 0; i < pairs.length - 1; i++) {
			var locations = document.getElementById('locationsOnFile');
			var block = document.createElement("div");

			var map = document.createElement("div");
			map.setAttribute('class', 'map');

			var div = document.createElement("div");
			div.style.display = "flex";
			div.style["justify-content"] = "center";

			var label = document.createElement("span");
			distanceLabels.push(label);
			label.innerHTML = "Distance from your location to this location";
			label.style["background-color"] = "#FFFFFF";
			label.style.color = "#111111";
			label.style["border-radius"] = "3pt";
			label.style["padding-top"] = "14px";
			label.style["padding-bottom"] = "14px";
			label.style["padding-left"] = "22px";
			label.style["padding-right"] = "22px";

			var calc = document.createElement("input");
			calcBtns.push(calc);
			calc.type = "submit";
			calc.value = "calculate";
			calc.setAttribute("onclick", "calculate(this)");
			calc.setAttribute("class", "calc");
			calc.style["margin-right"] = "10px";

			block.appendChild(map);
			div.appendChild(calc);
			div.appendChild(label);
			block.appendChild(div);
			locations.appendChild(block);

			var coordinates = pairs[i].split(',');
			allCoords.push(coordinates[0]);
			allCoords.push(coordinates[1]);
			initMap(parseFloat(coordinates[0]), parseFloat(coordinates[1]), map);
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
			if (first) {
				curAddress = results[0].formatted_address;
				first = false;
			}
	        infowindow.open(map, marker);
	      } else {
	        window.alert('No results found');
	      }
	    } else {
	      window.alert('Geocoder failed due to: ' + status);
	    }
  	});
}

function toggle() {
	if (!checked) {
		document.getElementById("search-bar").setAttribute("disabled","disabled");
		document.getElementById("search-bar").setAttribute("placeholder","current location is selected");
		document.getElementById("submit").setAttribute("disabled","disabled");
		document.getElementById("submit").style.cursor = "default";
		document.getElementById("switch").innerHTML = "current";
		document.getElementById("search-bar").value = "";
		initMap(curLat, curLon, document.getElementById('curLocation'));
		checked = true;
	}
	else {
		document.getElementById("search-bar").removeAttribute("disabled");
		document.getElementById("search-bar").setAttribute("placeholder","type custom location...");
		document.getElementById("submit").removeAttribute("disabled");
		document.getElementById("submit").style.cursor = "pointer";
		document.getElementById("switch").innerHTML = "custom";
		checked = false;
	}
}

function submit() {
	var string = document.getElementById("search-bar").value;
	var address = string.replace(new RegExp(' ', 'g'), '+');
	getJSON("https://maps.googleapis.com/maps/api/geocode/json?address=" + address + "&key=AIzaSyDjvE18u3mbUrMqJQk7M_XSGlLJkbmnv5c", function(err, data) {
		if (err != null) {
			console.log("Failed to read json data");
		}
		update_curLoc(data);
	});
}

function calculate(btn) {
	var i, index;
	for (i = 0; i < calcBtns.length; i++) {
		if (btn == calcBtns[i]) {
			index = i;
			break;
		}
	}

	var ind = index * 2;

	if (checked) message = { lat1: curLat, lng1: curLon, lat2: allCoords[ind], lng2: allCoords[ind + 1], locIndex: index };
	else message = { lat1: cusLat, lng1: cusLon, lat2: allCoords[ind], lng2: allCoords[ind + 1], locIndex: index };

	/*
	console.log("Button #" + index + " was clicked");
	console.log("curLat is " + curLat);
	console.log("curLon is " + curLon);
	console.log("cusLat is " + cusLat);
	console.log("cusLon is " + cusLon);
	console.log("lat1 is " + message.lat1);
	console.log("lng1 is " + message.lng1);
	console.log("lat2 is " + message.lat2);
	console.log("lng2 is " + message.lng2);
	*/

	startWorker(message);
}

function update_curLoc(data) {
	cusLat = data.results[0].geometry.location.lat;
	cusLon = data.results[0].geometry.location.lng;
	initMap(parseFloat(cusLat), parseFloat(cusLon), document.getElementById('curLocation'));
}

function getJSON(url, callback) {
	var xhr = new XMLHttpRequest();
	xhr.open("get", url, true);
	xhr.responseType = "json";
	xhr.onload = function() {
	  var status = xhr.status;
	  if (status == 200) {
		callback(null, xhr.response);
	  } else {
		callback(status);
	  }
	};
	xhr.send();
};
