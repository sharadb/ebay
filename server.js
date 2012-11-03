var http = require("http");
var url = require("url");
var querystring = require('querystring');

function start(route, handle) {
  function onRequest(request, response) {
    
		var postData = "";
    var pathname = url.parse(request.url).pathname;
		var getData = JSON.stringify(querystring.parse(url.parse(request.url).query));
		
    console.log("Request for " + pathname + " received.");

    request.setEncoding("utf8");

    request.addListener("data", function(postDataChunk) {
      postData += postDataChunk;
    });

    request.addListener("end", function() {
			console.log(postData);
      route(handle, pathname, response, postData,getData);
    });

  }

  http.createServer(onRequest).listen(8888, function() {
		console.log("Server has started.");
	});
 
}

exports.start = start;