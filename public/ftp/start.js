function randomInt (low, high) {
  return Math.floor(Math.random() * (high-low) + low);
}


var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'area', {
  preload: preload,
  create: create,
  update: update,
  render: render
});
WebFontConfig = {
  google: {
    families: ['Acme']
  }
}

function preload() {
  game.load.script('webfont','//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');
  game.load.image('naruto', 'ftp/imgs/right3.png');
  game.load.image('shade', 'ftp/imgs/shade.png');
  game.load.image('bullet', 'ftp/imgs/bullet.png');
  game.load.image('shotgun', 'ftp/imgs/shotgun.png');
  game.load.image('shotgunBullet', 'ftp/imgs/bullet2.png');
  game.load.image('heart', 'ftp/imgs/heart.PNG');
  game.load.tilemap('map', 'ftp/runTwo.json', null, Phaser.Tilemap.TILED_JSON);
  game.load.spritesheet('tileset', 'ftp/Downloads/ground_tiles.png', 32, 32);
  game.load.spritesheet('cliff_tiles', 'ftp/Downloads/Cliff_tileset.png', 32, 32);
  game.load.spritesheet('waterflow_tiles', 'ftp/Downloads/graphics-tiles-waterflow.png', 32, 32);
  game.load.spritesheet('tree_tiles', 'ftp/Downloads/trees.png', 32, 32);

  game.load.spritesheet('main_guy', 'ftp/imgs/firstspritesheet.png', 64, 64);
  game.load.spritesheet('second_guy', 'ftp/imgs/thirdspritesheet.png', 64, 64);
}

var cursors;
var bulletCounter = 0;
var itemCounter = 0;
var qKey;
var eKey;
var ammoText;


function create() {

  game.physics.startSystem(Phaser.Physics.ARCADE);
  game.time.desiredFps = 60;
  game.world.setBounds(0, 0, 3200, 3200);
  var map = game.add.tilemap('map');
  map.addTilesetImage("ground_tiles", 'tileset');
  map.addTilesetImage("Cliff_tileset", 'cliff_tiles');
  map.addTilesetImage("graphics-tiles-waterflow", 'waterflow_tiles');
  map.addTilesetImage("trees", 'tree_tiles');
  var layer;
  for (var i = 0; i < map.layers.length; i++) {
    layer = map.createLayer(i);
  }
  layer.inputEnabled = true;
  cursors = game.input.keyboard.createCursorKeys();
  qKey = game.input.keyboard.addKey(Phaser.Keyboard.Q);
  eKey = game.input.keyboard.addKey(Phaser.Keyboard.E);
  aKey = game.input.keyboard.addKey(Phaser.Keyboard.A);
  sKey = game.input.keyboard.addKey(Phaser.Keyboard.S);
  dKey = game.input.keyboard.addKey(Phaser.Keyboard.D);
  wKey = game.input.keyboard.addKey(Phaser.Keyboard.W);

  game.playerMap = {};
  game.bulletMap = {};
  game.itemMap = {};

  game.scale.pageAlignHorizontally = true;
  game.scale.pageAlignVertically = true;
  game.foundID = false;
  game.stage.disableVisibilityChange = true;

  healthArray = [];
  for (var i = 0; i < 3; i++) {
    healthArray[i] = game.add.sprite(32+(i*34), 32, "heart");
    healthArray[i].fixedToCamera = true;
  }

  Client.askNewPlayer();
  Client.getPlayerID();
  game.startCamera();




}


function update() {


  if (game.foundID) {
    startUp();


  }



  function startUp () {

    var player = game.playerMap[game.localID];
    const MAX_SPEED = 3;
    const PLAYER_ACCELERATION = .4;
    const PLAYER_FRICTION = .4;

    if (game.localID > -1) {
      game.world.wrap(player, 0, true);

      if (wKey.isDown && !(sKey.isDown)) {
        if (player.body.velocity.y < MAX_SPEED) {
          player.body.velocity.y += PLAYER_ACCELERATION;
        }
        player.animations.play('down', true);

      } else if (sKey.isDown && !(wKey.isDown)) {

        if (Math.abs(player.body.velocity.y) < MAX_SPEED) {
          player.body.velocity.y -= PLAYER_ACCELERATION;

        }
        player.animations.play('down', true);
      } else {
        if (Math.abs(player.body.velocity.y) > 0) {
          if (player.body.velocity.y > 0) {
            player.body.velocity.y -= PLAYER_FRICTION;;
          }
          if (player.body.velocity.y < 0) {
            player.body.velocity.y += PLAYER_FRICTION;
          }
          if (Math.abs(player.body.velocity.y) < .4) {
            player.body.velocity.y = 0;
            player.animations.stop('down', true)
          }
        }
      }

      if (dKey.isDown && !(aKey.isDown)) {
        if (player.body.velocity.x < MAX_SPEED) {
          player.body.velocity.x += PLAYER_ACCELERATION;
        }
        player.animations.play('down', true);

      } else if (aKey.isDown && !(dKey.isDown)) {

        if (Math.abs(player.body.velocity.x) < MAX_SPEED) {
          player.body.velocity.x -= PLAYER_ACCELERATION;

        }
        player.animations.play('down', true);
      } else {
        if (Math.abs(player.body.velocity.x) > 0) {
          if (player.body.velocity.x > 0) {
            player.body.velocity.x -= PLAYER_FRICTION;;
          }
          if (player.body.velocity.x < 0) {
            player.body.velocity.x += PLAYER_FRICTION;
          }
          if (Math.abs(player.body.velocity.x) < .4) {
            player.body.velocity.x = 0;
            player.animations.stop('down', true)
          }
        }
      }

      game.input.onDown.addOnce(game.shoot, this);
      qKey.onDown.addOnce(game.weaponSelectPrevious, this);
      eKey.onDown.addOnce(game.weaponSelectNext, this);
      itemCollisionDetection();
      velocityUpdate();
      serverLocationUpdate();
      updateSelectedWeapon();
      if (ammoText) {
        ammoText.text = capitalizeFirstLetter(game.playerMap[game.localID].equippedWeapon) + " ammo: " + game.playerMap[game.localID].ammo[game.playerMap[game.localID].equippedWeapon];
      }
      updateAmmo();





    } else {
      setTimeout(function(){
        startUp();
        console.log("Working");
      },200);
    }
  };

  function velocityUpdate() {

    if (game.foundID === true) {


      Object.keys(game.playerMap).map(function(objectKey, index){
        game.playerMap[objectKey].body.x += game.playerMap[objectKey].body.velocity.x;
        game.playerMap[objectKey].body.y -= game.playerMap[objectKey].body.velocity.y;
        if (game.playerMap[objectKey].body.velocity.y !== 0 || game.playerMap[objectKey].body.velocity.x !== 0) {
          game.playerMap[objectKey].hasMoved = true;
        }
      });

      Object.keys(game.bulletMap).map(function(objectKey, index){
        game.bulletMap[objectKey].body.x += game.bulletMap[objectKey].body.velocity.x;
        game.bulletMap[objectKey].body.y -= game.bulletMap[objectKey].body.velocity.y;
      });



    } else {
      setTimeout(function(){
        console.log("Working on it");
      },200);
    }

  };

  function serverLocationUpdate() {



    Object.keys(game.playerMap).map(function(objectKey, index){
      if (game.playerMap[objectKey].hasMoved === true) {
        game.updatePosition(objectKey, game.playerMap[objectKey].body.x, game.playerMap[objectKey].body.y);
        game.playerMap[objectKey].hasMoved = false;
      }
    });

  };

  function itemCollisionDetection() {
    Object.keys(game.playerMap).forEach(function(player) {
      if (Object.keys(game.itemMap).length !== 0) {
        Object.keys(game.itemMap).forEach(function(item){
          game.physics.arcade.collide(game.playerMap[player],game.itemMap[item]);
        });
      }
    });
  }

  function updateSelectedWeapon() {
    var data = {
      id: game.localID,
      weapon: game.playerMap[game.localID].equippedWeapon
    };
    Client.updateWeapon(data);

  }

  function updateAmmo () {
    if (game.foundID) {
      var data = {
        id: game.localID,
        ammo: game.playerMap[game.localID].ammo
      };
      Client.updateAmmunition(data);
    }
  }




}

function render() {





}

game.addNewPlayer = function(id, x, y, dx, dy, ammo) {
  if (id != 1) {

    game.playerMap[id] = game.add.sprite(x, y, 'second_guy');
    game.playerMap[id].frame = 0;
    game.playerMap[id].animations.add('down', [0, 1, 2, 3,4,5,6,7], 8, true);
  } else {
    game.playerMap[id] = game.add.sprite(x, y, 'shade');
    //add animations for hiatt's guy
    game.playerMap[id].hasMoved = false;
  }

  game.playerMap[id].anchor.set(0.5, 0.5);
  game.playerMap[id].id = id;
  game.playerMap[id].health = 3;
  game.playerMap[id].inventory = ["pistol"];
  game.playerMap[id].equippedWeapon = "pistol";
  game.physics.enable(game.playerMap[id], Phaser.Physics.ARCADE);
  game.playerMap[id].body.onCollide = new Phaser.Signal();
  game.playerMap[id].body.onCollide.add(game.equipPowerUp, this);
  game.playerMap[id].body.velocity.x = dx;
  game.playerMap[id].body.velocity.x = dy;
  game.playerMap[id].ammo = {
    "shotgun": 0,
    "pistol": 100
    };

};

game.removePlayer = function(id) {
  game.playerMap[id].destroy();
  delete game.playerMap[id];
};


game.getPlayerID = function(id) {
  game.localID = id;
  game.foundID = true;
  console.log("Finished " + id);
};

game.updatePosition = function(id, x, y) {
  var data = {};
  data.id = id;
  data.x = x;
  data.y = y;
  Client.updatePosition(data);
};

game.relocateToServer = function(id, x, y) {
  if (game.playerMap[id]) {
    var player = game.playerMap[id];
    if (player !== game.playerMap[game.localID]) {
      if (player.body.x !== (x + 32)) {
        player.animations.play("down", true);
      } else {
        player.animations.stop("down", true);
      }
      player.x = x+32;
      player.y = y+32;
    }
  }





};

game.shoot = function(pointer) {
  var data = {};
  data.id = game.localID;
  data.x = pointer.worldX;
  data.y = pointer.worldY;
  Client.sendShot(data);
};

game.createBullet = function (id,x,y,endX,endY) {

  switch (game.playerMap[id].equippedWeapon) {

    case "shotgun":
      if (game.playerMap[id].ammo["shotgun"] > 0) {
        game.bulletMap[bulletCounter++] = game.add.sprite(x,y,'shotgunBullet');
        game.bulletMap[bulletCounter++] = game.add.sprite(x,y,'shotgunBullet');
        game.bulletMap[bulletCounter] = game.add.sprite(x,y,'shotgunBullet');
        var bulletArr = [game.bulletMap[bulletCounter],game.bulletMap[bulletCounter-1],game.bulletMap[bulletCounter-2]];
        var speed = 8;
        var angle = Math.atan2(endY - y, endX - x);
        var skew = 10 * Math.PI / 180;
        for (var i = 0; i < 3; i++) {
          bulletArr[i].damage = 2;
          bulletArr[i].anchor.setTo(0.5, 0.5);
          bulletArr[i].lifespan = 600;
          game.physics.enable(bulletArr[i], Phaser.Physics.ARCADE);
          if (i === 0) {
            bulletArr[i].angle = (angle * 180 / Math.PI);
            bulletArr[i].body.velocity.x = speed * Math.cos(angle);
            bulletArr[i].body.velocity.y = -speed * Math.sin(angle);
          } else if (i === 1) {
            bulletArr[i].angle = ((angle + skew) * 180 / Math.PI);
            bulletArr[i].body.velocity.x = speed * Math.cos(angle+skew);
            bulletArr[i].body.velocity.y = -speed * Math.sin(angle+skew);
          } else if (i === 2) {
            bulletArr[i].angle = ((angle - skew) * 180 / Math.PI);
            bulletArr[i].body.velocity.x = speed * Math.cos(angle-skew);
            bulletArr[i].body.velocity.y = -speed * Math.sin(angle-skew);
          }
        }
        game.playerMap[id].ammo["shotgun"]--;
      } else {

      }
      break;

    default:
      game.bulletMap[bulletCounter] = game.add.sprite(x,y,'bullet');
      var bullet = game.bulletMap[bulletCounter];
      bullet.damage = 1;
      var speed = 12;
      bullet.anchor.setTo(0.5, 0.5);
      var angle = Math.atan2(endY - y, endX - x);
      bullet.angle = (angle * 180 / Math.PI);
      bullet.lifespan = 1400;
      game.physics.enable(bullet, Phaser.Physics.ARCADE);
      bullet.body.velocity.x = speed * Math.cos(angle);
      bullet.body.velocity.y = -speed * Math.sin(angle);
      break;
  }
  bulletCounter++;
};

game.spawnPowerUp = function(powerup,x,y) {
  console.log("Spawned a " + powerup + " at " + x + ", " + y);
  switch (powerup) {

    case "shotgun":
      game.itemMap[itemCounter] = game.add.sprite(x,y,'shotgun');
      game.itemMap[itemCounter].anchor.set(0.5);
      game.itemMap[itemCounter].lifespan = 120000;
      game.physics.enable(game.itemMap[itemCounter], Phaser.Physics.ARCADE);
      game.itemMap[itemCounter].body.onCollide = new Phaser.Signal();
      game.itemMap[itemCounter].body.onCollide.add(game.usedUp, this);
      itemCounter++;
      break;
    }
};

game.usedUp = function (sprite1,sprite2) {
  sprite1.destroy();
};

game.equipPowerUp = function (sprite1,sprite2) {
  switch (sprite2["key"]) {
    case "shotgun":
      game.playerMap[sprite1.id].equippedWeapon = "shotgun";
      game.playerMap[sprite1.id].ammo["shotgun"] += 15;
      game.playerMap[sprite1.id].inventory.push("shotgun");
      break;
  }
};

game.secretWeapon = function (weapon) {
  game.playerMap[game.localID].equippedWeapon = weapon;
  game.playerMap[game.localID].ammo[weapon] += 100;
  game.playerMap[game.localID].inventory.push(weapon);
  console.log("Cheater!");
  console.log(game.playerMap[game.localID].equippedWeapon + " equipped!")
}


game.weaponSelectPrevious = function() {
    var currentIndex = game.playerMap[game.localID].inventory.indexOf(game.playerMap[game.localID].equippedWeapon);
    if (currentIndex !== 0) {
      game.playerMap[game.localID].equippedWeapon = game.playerMap[game.localID].inventory[currentIndex-1];
    } else {
      game.playerMap[game.localID].equippedWeapon = game.playerMap[game.localID].inventory[game.playerMap[game.localID].inventory.length-1];
    }



}

game.weaponSelectNext = function() {
    var currentIndex = game.playerMap[game.localID].inventory.indexOf(game.playerMap[game.localID].equippedWeapon);
    if (currentIndex !== game.playerMap[game.localID].inventory.length-1 && !(currentIndex > game.playerMap[game.localID].inventory.length)) {
      game.playerMap[game.localID].equippedWeapon = game.playerMap[game.localID].inventory[currentIndex+1];
    } else {
      game.playerMap[game.localID].equippedWeapon = game.playerMap[game.localID].inventory[0];
    }


}

game.weaponUpdate = function (id, weapon) {
  if (game.foundID) {
    game.playerMap[id].equippedWeapon = weapon;
  }
}

game.updateAmmo = function (id, ammo) {
  if (game.foundID) {
    game.playerMap[id].ammo = ammo;
  }
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

game.startCamera = function() {
  if (game.localID > -1) {
    game.camera.follow(game.playerMap[game.localID]);
    ammoText = game.add.text(32,568,("Shotgun ammo " + game.playerMap[game.localID].ammo["shotgun"]));
    ammoText.fixedToCamera = true;
    ammoText.font = 'Acme';
  } else {
    setTimeout(game.startCamera,500);
  }
}
