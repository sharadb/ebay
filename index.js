var server = require("./server");
var router = require("./router");
var requestHandlers = require("./requestHandlers");

var handle = {}
handle["/"] = requestHandlers.leaderboard;
//handle["/start"] = requestHandlers.start;
//handle["/upload"] = requestHandlers.upload;
handle["/leaderboard"] = requestHandlers.leaderboard;
handle["/home"] = requestHandlers.home;
handle["/checkin"] = requestHandlers.checkin;
handle["/getleaderboard"] = requestHandlers.getleaderboard;
handle["/getuserdata"] = requestHandlers.getuserdata;


server.start(router.route, handle);