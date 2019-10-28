function setup (){
	if (!PIXI.utils.isWebGLSupported())
		alert("Your browser does not support WebGL, it will run less smooth because of it.");

	game = new Game();
	game.hud = new Hud();
	game.pauseMenu = new PauseMenu();

	PIXI.loader
		.add("images/player.png")
		.add("images/bullet.png")
		.add("images/blok.png")
		.add("images/zombie.png")
		.add("images/ammo.png")
		.add("maps/map.png")
		.load(positioner);
}

function positioner(){
	map = new Maps();
	map.init();
	map.collision = new Collisions();
	player = new Player();
	bullets = new Bullets();
	input = new Input();
	input.init();
	game.waves();
	Csetup();
	pathfinding = new Pathfinding();

	game.app.stage.addChild(map.sprite);
	game.app.stage.addChild(player.sprite);
	game.app.stage.addChild(player.weapon.ammoPackContainer);
	game.app.stage.addChild(game.zombiesContainer);
	game.app.stage.addChild(bullets.container);
	game.app.stage.addChild(game.hud.container);
	game.app.stage.addChild(game.pauseMenu.container);
	game.app.ticker.add(delta => mainLoop(delta));
}

var endingLoop = function(delta){
	game.frameNum += 1;
}

var mainLoop = function(delta) {
	if(game.pauseMenu.visible) return;
	game.deltaLag = delta;

	input.keyCheck();
	map.move();
	input.playerRotate();
	input.bulletFireCheck();
	player.update();
	game.hud.update();

	game.frameNum += 1;
	
	game.waves();
}

///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////

setup();