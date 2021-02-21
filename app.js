var express = require('express');
var app = express();
var serv = require('http').Server(app);
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const fs = require('fs');
var bcrypt = require('bcryptjs');

app.get('/',function(req,res) {
	res.sendFile(__dirname + '/client/index.html');
});
app.use('/client',express.static(__dirname + '/client'));

app.set('port', process.env.PORT || 2000);
app.set('host', process.env.HOST || '0.0.0.0')
serv.listen(app.get('port'), app.get('host'), function(){
  console.log("Express server listening on port " + app.get('port')+"and host"+app.get('host'));
});

var userdb = fs.readFileSync( "jsdb.txt", 'utf8' ).split("\n");

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
		name:id
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



	socket.on("joinedUser", function(user){
		console.log("yzy")
		
		var pos = 0;
		var x=0
		while(pos == 0 && x<=userdb.length-1){
			//console.log(pos)
			if(user[0] == userdb[x].split(" ")[0]){
				console.log(user[0], 1)
				pos = x;
				socket.emit("retUsr", userdb[pos].split(" ")[2])
				socket.on("login", k => {
					while(!k){
						socket.on("updPwd", hsh =>{user[2] = hsh})
					}
				})
				user.id = userdb[x].split(" ")[1]
			}else if(x == userdb.length-1){
				
				console.log(x, 2)
				socket.emit("newUsr", user[0])
				fs.appendFileSync("jsdb.txt", user[0]+" "+user[1]+" "+user[2]+"\n")
				userdb.push(user[0]+" "+user[1] +" "+ user[2])
				break;
			}x++
		}
	})
	socket.on("hashPwd", c => {
		console.log("yaaaaay"+c)
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