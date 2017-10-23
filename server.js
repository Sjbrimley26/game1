const express = require('express');
var app = express();
const server = require('http').Server(app);
const serveIndex = require('serve-index');
var io = require('socket.io')(server);


app.use(express.static(__dirname));
app.use('/ftp', express.static('public/ftp'), serveIndex('public/ftp', {'icons': true}));

app.get('/', (req, res) => {
  res.render("index.html");
});

server.listen(700);
console.log("Listening on port 700");

server.lastPlayerID = 0;

var itemArray = ["shotgun"];

io.on('connection', function(socket){

  socket.on('newplayer', function(){
    socket.player = {
      id: server.lastPlayerID++,
      x: randomInt(100,400),
      y: randomInt(100,400),
      dx: 0,
      dy: 0
    };
    socket.emit('allplayers', getAllPlayers());
    socket.broadcast.emit('newplayer', socket.player);
    console.log("Connected");

    /*
    socket.on('click', function(data){
      console.log('click to ' + data.x + "," + data.y);
      socket.player.x = data.x;
      socket.player.y = data.y;
      io.emit('move', socket.player);
    });
    */

    socket.on('getPlayerID', function(){
      socket.emit('sendID', socket.player.id);
    });

    socket.on('disconnect', function(){
      io.emit('remove', socket.player.id);
    });

    socket.on('updatePosition', function(data) {
      socket.player.x = data.x;
      socket.player.y = data.y;
      io.emit('updateLocation', socket.player);
    });

    socket.on('fire', function(data){
      var bullet = {};
      bullet.id = data.id;
      bullet.x = socket.player.x+32;
      bullet.y = socket.player.y+32;
      bullet.endX = data.x;
      bullet.endY = data.y;
      io.emit('fired', bullet);
    });

    socket.on('updateWeapon', function(data){
      io.emit('updatedTheWeapon', data);
    });

    socket.on('updateAmmo', function(data){
      io.emit('updatedTheAmmo', data);
    });



  });


});

setInterval(function(){

  var data = {
    item: itemArray[randomInt(0,itemArray.length)],
    x: randomInt(100,3100),
    y: randomInt(100,3100)
  };
  io.sockets.emit('spawnItem', data);

}, 30000);

function getAllPlayers(){
  var players = [];
  Object.keys(io.sockets.connected).forEach(function(socketID){
    var player = io.sockets.connected[socketID].player;
    if(player) players.push(player);
  });
  return players;
}

function randomInt (low, high) {
  return Math.floor(Math.random() * (high-low) + low);
}
