var express = require('express');
var app = express();
var serv = require('http').Server(app);
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

app.get('/',function(req,res) {
	res.sendFile(__dirname + '/client/index.html');
});
app.use('/client',express.static(__dirname + '/client'));

app.set('port', process.env.PORT || 2000);
app.set('host', process.env.HOST || '0.0.0.0')
serv.listen(app.get('port'), app.get('host'), function(){
  console.log("Express server listening on port " + app.get('port')+"and host"+app.get('host'));
});

var USER_LIST = [];
var SOCKET_LIST = [];

var map_data;
var xmlhttp = new XMLHttpRequest();
xmlhttp.onreadystatechange = function() {
  if (this.readyState == 4 && this.status == 200) {
    map_data = JSON.parse(this.responseText);
  }
};

function newuser(id){
	var self = {
		id:id,
	}
	return self;
}

var io = require('socket.io')(serv,{});
io.sockets.on('connection', function(socket){
	var user = newuser(socket.client.conn.remoteAddress);
	socket.emit("newUser", user.id)
	SOCKET_LIST[socket.id] = socket;

	console.log(socket.client.conn.remoteAddress , socket.id)
	USER_LIST[socket.id] = user;

	socket.on("submit", function(answer){
		console.log(answer)
	})

	socket.on('disconnect', function(){
		console.log(USER_LIST[socket.id].name+", "+USER_LIST[socket.id].answer)
		delete SOCKET_LIST[socket.id];
		delete USER_LIST[socket.id];
	})

	socket.on('disconnect',function(){
		delete SOCKET_LIST[socket.id];
	})
});