var Client = {};
// change this ip address to address of whoever is running the server.
Client.socket = io.connect("http://192.168.1.26:700");

Client.askNewPlayer = function() {
  Client.socket.emit('newplayer');
};


Client.getPlayerID = function() {
  Client.socket.emit('getPlayerID');
};

Client.updatePosition = function(data) {
  Client.socket.emit('updatePosition', data);
};

Client.updateWeapon = function(data) {
  Client.socket.emit('updateWeapon', data);
};

Client.updateAmmunition = function(data) {
  Client.socket.emit('updateAmmo', data);
}

Client.socket.on('newplayer', function(data){
  game.addNewPlayer(data.id,data.x,data.y,data.dx,data.dy);
});

Client.socket.on('allplayers', function(data){
  for(var i =0; i < data.length; i++) {
    game.addNewPlayer(data[i].id,data[i].x,data[i].y,data[i].dx,data[i].dy);
  }
});

Client.socket.on('remove', function(id){
  game.removePlayer(id);
});

Client.sendShot = function(data) {
  Client.socket.emit('fire', data);
};


Client.socket.on("sendID", function(id) {
  game.getPlayerID(id);
});

Client.socket.on("updateLocation", function(data) {
  game.relocateToServer(data.id,data.x,data.y);
});

Client.socket.on("fired", function(bullet){
  game.createBullet(bullet.id,bullet.x, bullet.y, bullet.endX, bullet.endY);
});

Client.socket.on("spawnItem", function(data) {
  game.spawnPowerUp(data.item,data.x,data.y);
});

Client.socket.on('updatedTheWeapon', function(data) {
  game.weaponUpdate(data.id,data.weapon);
});

Client.socket.on('updatedTheAmmo', function(data) {
  game.updateAmmo(data.id,data.ammo);
});
