/**
 * 
 */

var SimpleUpload = function(){}

SimpleUpload.serverUrl = 'http://127.0.0.1:8000/'

SimpleUpload.save = function (filename, data) {
	var request = new XMLHttpRequest();

	// We define what will happen if the data is successfully sent
	request.addEventListener('load', function(event) {
		// alert('Yeah! Data sent and response loaded.');
		console.log('event load')
	});
	
	// We define what will happen in case of error
	request.addEventListener('error', function(event) {
		// alert('Oups! Something goes wrong.');
		console.log('event error')
	});
	
	// We setup our request
	request.open('POST', SimpleUpload.serverUrl + '?filename='+filename);
	
	// And finally, We send our data.
	var dataJson = JSON.stringify(data)
	request.send(dataJson);
}
