self.addEventListener("message", function(e) {

	var msg = e.data;

	var lat1 = msg.lat1;
	var lng1 = msg.lng1;
	var lat2 = msg.lat2;
	var lng2 = msg.lng2;

	var r = 6371e3;

	var la1 = toRadians(lat1);
	var la2 = toRadians(lat2);

	var deltaLa = toRadians(lat2 - lat1);
	var deltaLn = toRadians(lng2 - lng1);

	var a = Math.sin(deltaLa / 2) * Math.sin(deltaLa / 2) + Math.cos(la1) * Math.cos(la2) * Math.sin(deltaLn / 2) * Math.sin(deltaLn / 2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	var d = r * c;

	self.postMessage({ distance: Math.round(d / 1000), locIndex: msg.locIndex });

}, false);

function toRadians(x) {
	return x * Math.PI / 180;
}
