var mongo = require('mongodb'),
  	Server = mongo.Server,
  	Db = mongo.Db,
		fs = require('fs');



var server = new Server('localhost', 27017, {auto_reconnect: true});
var db = new Db('recycleBin', server,{safe: true});

db.open(function(err, db) {
	if(!err) {
    console.log("We are connected");
		db.createCollection('cans', function(err, collection) {});
  }
});


function makeHTML(obj,html) {
	var data = "";
	if(obj.scripts) {
		for(var i=0; i<scripts.length;++i) {
			var c = fs.readFileSync(scripts[i],"utf8");
			data = "<script type='text/javascript'>" + c + "</script>";		
		}
	}
	if(obj.css) {
		for(var i=0; i<css.length;++i) {
			var c = fs.readFileSync(css[i],"utf8");
			data = "<style type='text/css'>" + c + "</style>";		
		}
	}
	
	var st = html.indexOf("<head>")+6;
	html = html.substring(0,st) + data + html.substring(st);
	
	return html;
}




function home(response, postData,getData) {
	var pdata = "var data ="+getData+";";
	fs.readFile('html/user.html',"utf8", function (err, data) {
	  if (err) throw err;
	  response.writeHead(200, {"Content-Type": "text/html"});
		var st = data.indexOf("<head>")+6;
		data = data.substring(0,st) +"<script type='text/javascript'>"+ pdata + "</script>" + data.substring(st);
		data = makeHTML({},data);
		response.write(data);
		response.end();
	});
}


function checkin(response, postData,getData) {
	var data = JSON.parse(postData);
	if(data.user && data.bottles) {
		var entry = {"user":data.user, 
								 "bottle": data.bottles,
								 "ts":new Date().getTime() };
								
		db.collection('cans', {safe:true}, function(err, collection) {
		      collection.insert(entry, function (err, results) {
							if(!err) {
								response.writeHead(200, {"Content-Type": "JSON"});
								response.write("{success:true}");
								response.end();
							} else {
								response.writeHead(200, {"Content-Type": "JSON"});
								response.write("{err:\""+ JSON.stringify(err) + "\",success:true}");
								response.end();
							}
							
					});
		});
	} else {
		  response.writeHead(200, {"Content-Type": "JSON"});
			response.write("{error:'Invalid data format'}");
			response.end();
	}
}


function getuserdata(response, postData,getData) {
		console.log(postData);
		if(postData && JSON.parse(postData)) {
				var data = JSON.parse(postData);
				db.collection('cans', {safe:true}, function(err, collection) {
						collection.find({"user":data.user}).toArray(function(err, items) {
							response.writeHead(200, {"Content-Type": "JSON"});
							response.write(JSON.stringify(items));
							response.end();
						});
				 });
		} else {
			  response.writeHead(200, {"Content-Type": "JSON"});
				response.write("{error:'Invalid data format'}");
				response.end();
		}
}

function getleaderboard(response, postData,getData) {
	db.collection('cans', {safe:true}, function(err, collection) {
			var obj =	{keys: { user:true },
          condition: {},
          reduce: function(obj,prev) { prev.nBottles += obj.bottle; },
          initial: { nBottles: 0 },
					callback: function(err,items){
											items.sort(function(a,b){return b.nBottles-a.nBottles});
											response.writeHead(200, {"Content-Type": "JSON"});
											response.write(JSON.stringify(items));
											response.end();
										}
					};
				
				collection.group(obj.keys, obj.condition, obj.initial, obj.reduce,obj.callback);
			});
}

function leaderboard(response, postData,getData) {
	fs.readFile('html/leaderboard.html', function (err, data) {
	  if (err) throw err;
	  response.writeHead(200, {"Content-Type": "text/html"});
		response.write(data);
		response.end();
	});
}



exports.leaderboard = leaderboard;
exports.home = home;
exports.checkin = checkin;
exports.getleaderboard = getleaderboard;
exports.getuserdata = getuserdata;