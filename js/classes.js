var Game = function(){
	this.width = 0;
	this.height = 0;
	this.deltaLag = 0;

	this.frameNum = 0;
	
	this.wave = 0;
	this.beginAantalZombies = 10;
	this.zombiesExtraPerWave = 5;
	this.maxLevendeZombies = 20;
	this.zombies;
	this.zombiesContainer = new PIXI.Container();

	this.startEnding = false;

	this.ending = function(){
		this.startEnding = true;
		this.endMenu = new EndMenu();
		this.app.stage.addChild(this.endMenu.container);

	}

	this.restart = function(){
		this.startEnding = true;
		this.endMenu = new EndMenu();
		this.app.stage.addChild(this.endMenu.container);

		game.app.ticker._head.next.fn = (delta=>endingLoop(delta));
	}

	this.setSize = function(width, height){
		this.width = width;
		this.height = height;
		this.app.renderer.resize(width, height);
		document.getElementsByTagName("canvas")[0].width = width;
		document.getElementsByTagName("canvas")[0].height = height;
	}

	this.update = function(vx,vy){
		player.weapon.update(vx,vy);
	}

	this.newWave = function(){
		var aantal = this.beginAantalZombies + this.zombiesExtraPerWave * this.wave;
		this.zombies = new Zombies(aantal);
		this.wave += 1;
	}

	this.waves = function(){
		if(!this.zombies){
			this.newWave();
		}
		else if((this.zombies.array.length == 0 && this.zombies.nogSpawnen == 0)){
			this.newWave();
		}
	}

	this.init = function(){
		this.app = new PIXI.Application({
			width:0, 
			height:0,
			antialias: false
		});

		this.app.renderer.view.style.position = "absolute";
		this.app.renderer.view.style.display = "block";
		this.app.renderer.autoResize = true;
		this.app.renderer.backgroundColor = 0x92c939;
		document.body.appendChild(this.app.view);
		this.setSize(window.innerWidth, window.innerHeight);

		window.addEventListener("resize", function (e){
			game.setSize(window.innerWidth, window.innerHeight);
		});
	}
	this.init();
}

///////////////////////////////////////////////////
//////////////////////Button///////////////////////
///////////////////////////////////////////////////

var EndMenu = function(){
	this.container = new PIXI.Container();

	this.textStyle = new PIXI.TextStyle({
		fontSize: 20,
		fontWeight: 200,
		align: "center",
		fill: "yellow"
	});

	this.buttonTextStyle = new PIXI.TextStyle({
		fontSize: 18,
		fontWeight: 200,
	});

	this.maskMargin = 5;

	///////////////////////////////////////////////////


	this.onButtonDown = function(){
		location.reload();
	}

	this.init = function(){
		var a = new PIXI.Graphics();
		a.beginFill(0x000000, 0.8);
		a.drawPolygon(new PIXI.Polygon(
			0,0,
			0, game.app.renderer.height,
			game.app.renderer.width, game.app.renderer.height,
			game.app.renderer.width, 0
		));
		a.endFill();
		this.container.addChild(a);

		///////////////////////////////////////////////////

		var txt = new PIXI.Text(
			"You died!!\n" +
			"You made it to wave " +
			game.wave,
			this.textStyle
		);
		var x = (game.app.renderer.width / 2) - (txt.width / 2);
		var y = (game.app.renderer.height / 2) - (txt.height / 2) - 100;
		txt.position.set(x,y);
		
		this.container.addChild(txt);

		///////////////////////////////////////////////////
		
		var button = new PIXI.Graphics();
		button.beginFill(0xc66b6b, 1);
		button.drawRoundedRect(0,0,200,50,5);
		button.endFill();
		var x = (game.app.renderer.width / 2) - (button.width / 2);
		var y = txt.y + txt.height + 30;
		button.position.set(x,y);

		var white = new PIXI.Graphics();
		white.beginFill(0xff0000);
		white.drawRoundedRect(0,0,200,50,5);
		white.endFill();
		var x = (game.app.renderer.width / 2) - (white.width / 2);
		var y = txt.y + txt.height + 30;
		white.position.set(x,y);

		var mask = new PIXI.Graphics();
		mask.beginFill();
		mask.drawRoundedRect(0,0,button.width - (this.maskMargin * 2), button.height - (this.maskMargin * 2),5);
		mask.endFill();
		var x = button.x + this.maskMargin;
		var y = button.y + this.maskMargin;
		mask.position.set(x,y);

		button.mask = mask;

		this.container.addChild(white);
		this.container.addChild(button);
		this.container.addChild(mask);

		button.interactive = true;
		button.buttonMode = true;
	
		button
			.on('pointerdown', this.onButtonDown);

		///////////////////////////////////////////////////

		var buttonTxt = new PIXI.Text(
			"Restart the game!!",
			this.buttonTextStyle
		);
		var x = button.x + (button.width / 2) - (buttonTxt.width / 2);
		var y = button.y + (button.height / 2) - (buttonTxt.height / 2);
		buttonTxt.position.set(x,y);
		
		this.container.addChild(buttonTxt);
	}
	this.init();
}

///////////////////////////////////////////////////
/////////////////////ammoPack//////////////////////
///////////////////////////////////////////////////

var AmmoPack = function(id, spawn){
	this.x = 0;
	this.y = 0;
	this.id = id;

	this.sprite = null;
	this.collision = null;

	this.setPos = function(x,y){
		this.x = x;
		this.y = y;

		this.sprite.position.set(x,y);

		this.collision.x = x;
		this.collision.y = y;
	}

	this.init = function(){

		this.sprite = new PIXI.Sprite(PIXI.loader.resources["images/ammo.png"].texture);
		this.sprite.scale.set(1);
		this.sprite.width = player.weapon.ammoWidth;
		this.sprite.height = player.weapon.ammoHeight;

		this.collision = new Polygon(
			0, 0, 
			[
				[0,player.weapon.ammoHeight],
				[player.weapon.ammoWidth,player.weapon.ammoHeight],
				[player.weapon.ammoWidth,0]
			]
		);
		this.collision.type = "ammo";
		this.collision.id = id;
		map.collision.insert(this.collision);

		this.setPos(spawn.x,spawn.y);
	}
	this.init();
}

///////////////////////////////////////////////////
//////////////////////Weapon///////////////////////
///////////////////////////////////////////////////

var Weapon = function(magazineSize, ammoSize){
	this.ammoPackContainer = new PIXI.Container();

	this.totalAmmo = ammoSize;
	this.magazineSize = magazineSize;
	this.currentTotalAmmo = ammoSize;
	this.currentMagazineAmmo = magazineSize;
	this.fireRate = 15;

	this.ammoPacks = [];
	this.ammoTime = 60;
	this.ammoPackAmount = 120;
	this.alSpawn = [];
	this.ammoWidth = 60;
	this.ammoHeight = 35;

	this.reloadTime = 2;

	this.oldFrame = game.frameNum;
	this.oldReloadTime = 0;
	this.reloading = false;
	this.needReloading = false;
	
	///////////////////////////////////////////////////

	this.shoot = function(){
		if(player.tooClose) return;
		if((game.frameNum - this.oldFrame) < this.fireRate){
			return;
		}

		if(this.reloading) return;
		if(this.currentMagazineAmmo == 1) {
			if(this.currentTotalAmmo == 0) return;
			
			var d = new Date();
			this.oldReloadTime = d.getTime();
			this.reloading = true;
		}

		var bul = new Bullet(clone(bullets.array.length));
		bullets.array.push(bul);
		bullets.container.addChild(bul.sprite);
		bullets.array.sort(sortingFunc);

		this.currentMagazineAmmo -= 1;
		
		this.oldFrame = game.frameNum;
	}

	this.insertPack = function(){
		var rand = Math.floor(Math.random() * this.alSpawn.length);
		var spawn = map.objects["ammoPack"][this.alSpawn[rand]];
		this.alSpawn.splice(rand, 1);

		var a = new AmmoPack(this.ammoPacks.length, spawn);
		a.spawn = rand;
		
		this.ammoPacks.push(a);
		this.ammoPackContainer.addChild(a.sprite);
	}

	this.removePack = function(id){	
		this.ammoPacks[id].collision.remove();				
		this.ammoPacks.splice(id,1);
		this.ammoPackContainer.removeChildAt(id);

		this.alSpawn = [...Array(map.objects["ammoPack"].length).keys()];
		for(var x = 0; x < this.alSpawn.length; x++){
			for(var y = 0; y < this.ammoPacks.length; y++){
				if(this.alSpawn[x] == this.ammoPacks[y].spawn) {
					this.alSpawn.splice(x,1);
					continue;
				}
			}
		}

		var number = 0;
		for(var obj of this.ammoPacks){
			obj.id = number;
			obj.collision.id = number;
			number += 1;
		}
	}

	this.update = function (vx, vy){
		var a = map.objects["ammoPack"];
		for(var obj of a){
			obj.x -= vx;
			obj.y -= vy;
		}

		for(var obj of this.ammoPacks){
			obj.setPos(obj.x - vx, obj.y - vy);
		}

		var d = new Date();
		if((d.getTime() - this.oldAmmoTime) > (this.ammoTime * 1000)){
			if(this.alSpawn.length != 0){
				this.insertPack();
			}
			var d = new Date();
			this.oldAmmoTime = d.getTime();
		}

		///////////////////////////////////////////////////

		if(this.needReloading){
			if (this.currentMagazineAmmo != this.magazineSize){
				var d = new Date();
				this.oldReloadTime = d.getTime();
				this.reloading = true;
			}

			this.needReloading = false;
		}

		if(!this.reloading) return;
		
		var d = new Date();
		if((d.getTime() - this.oldReloadTime) > (this.reloadTime * 1000)){
			this.currentTotalAmmo -= (this.magazineSize - this.currentMagazineAmmo);
			this.currentMagazineAmmo = this.magazineSize;
			this.oldReloadTime = 0;
			this.reloading = false;
			this.needReloading = false;
		}
	}

	this.init = function(){
		var d = new Date();
		this.oldAmmoTime = d.getTime();
		
		var a = map.objects["ammoPack"];
		for(var obj of a){
			obj.x = obj.x * map.scale + map.x - (this.ammoWidth / 2);
			obj.y = obj.y * map.scale + map.y - (this.ammoHeight / 2);
		}

		for(var x = 0; x < a.length; x++){
			this.alSpawn.push(x);
		}
	}

	this.init();
}

///////////////////////////////////////////////////
/////////////////////PauseMenu/////////////////////
///////////////////////////////////////////////////

var PauseMenu = function(){
	this.container = new PIXI.Container();
	this.visible = false;

	this.buttonWidth = 300;
	this.buttonHeight = 25;
	this.lineDikte = 2;
	this.lineMargin = 20;
	this.topMargin = 50;
	this.leftMargin = 70;

	this.topTextStyle = new PIXI.TextStyle({
		fontSize: 50,
		fontWeight: 300,
		fill: "white"
	});

	this.buttonTextStyle = new PIXI.TextStyle({
		fontSize: 20,
		fill: "white"
	});

	this.controlTextStyle = new PIXI.TextStyle({
		fontSize: 20,
		fill: "white"
	});

	///////////////////////////////////////////////////

	this.controlText = 
	`How to play:
	
	Move up:
	Move down:
	Move left:
	Move right:
	
	Shoot:
	Sprint:
	Reload:`;

	this.controlTextBind = 
	`
	
	W
	S
	A
	D
	
	Right Mouse-Button
	Shift
	R`;

	///////////////////////////////////////////////////

	this.show = function(){
		if(!this.visible){
			this.visible = true;
			this.container.visible = true;

		} else {
			this.visible = false;
			this.container.visible = false;
		}
	}

	this.onContinue = function(){
		game.pauseMenu.show();
	}

	this.onRestart = function(){
		location.reload();
	}

	this.init = function(){
		this.background = new PIXI.Graphics();
		this.background.beginFill(0x000000, 0.8);
		this.background.drawPolygon(new PIXI.Polygon(
			0,0,
			0, game.app.renderer.height,
			game.app.renderer.width, game.app.renderer.height,
			game.app.renderer.width, 0
		));
		this.background.endFill();


		this.topText = new PIXI.Text("Pause Menu", this.topTextStyle);
		this.topText.position.set(this.leftMargin,this.topMargin);


		var c = document.createElement('canvas');
		c.width = this.buttonWidth;
		c.height = this.buttonHeight;
		var ctx = c.getContext("2d");
		var grd = ctx.createLinearGradient(0, 0, this.buttonWidth, 0);
		grd.addColorStop(0, "rgba(255,0,0,0.8)");
		grd.addColorStop(1, "rgba(0,0,0,0.0)");
		ctx.fillStyle = grd;
		ctx.fillRect(0,0,this.buttonWidth, this.buttonHeight);
		this.continueButton = new PIXI.Sprite(PIXI.Texture.fromCanvas(c));
		this.continueButton.position.set(this.topText.x, this.topText.y + this.topText.height + 30);
		this.continueButton.interactive = true;
		this.continueButton.buttonMode = true;	
		this.continueButton.on('pointerdown', this.onContinue);
		this.continueText = new PIXI.Text("Continue", this.buttonTextStyle);
		var x = this.continueButton.x + 5;
		var y = this.continueButton.y + (this.continueButton.height / 2) - (this.continueText.height / 2);
		this.continueText.position.set(x, y);


		this.restartButton = new PIXI.Sprite(PIXI.Texture.fromCanvas(c));	
		var x = this.continueButton.x;
		var y = this.continueButton.y + this.continueButton.height + 6;
		this.restartButton.position.set(x, y);
		this.restartButton.interactive = true;
		this.restartButton.buttonMode = true;	
		this.restartButton.on('pointerdown', this.onRestart);
		this.restartText = new PIXI.Text("Restart", this.buttonTextStyle);
		var x = this.restartButton.x + 5;
		var y = this.restartButton.y + (this.restartButton.height / 2) - (this.restartText.height / 2);
		this.restartText.position.set(x, y);


		this.line = new PIXI.Graphics();
		var x = game.app.renderer.width / 2;
		var y = this.lineMargin;
		this.line.beginFill(0xffffff, 0.7);
		this.line.drawPolygon(new PIXI.Polygon(
			0,0,
			0, game.app.renderer.height - (y * 2),
			this.lineDikte, game.app.renderer.height - (y * 2),
			this.lineDikte, 0
		));
		this.line.endFill();
		this.line.position.set(x,y);


		this.control = new PIXI.Text(this.controlText, this.controlTextStyle);
		var x = this.leftMargin + this.line.x;
		var y = this.topMargin;
		this.control.position.set(x,y);
		this.controlBind = new PIXI.Text(this.controlTextBind, this.controlTextStyle);
		var x = this.control.x + this.control.width + 30;
		var y = this.control.y;
		this.controlBind.position.set(x,y);
		
		this.container.addChild(this.background);
		this.container.addChild(this.topText);
		this.container.addChild(this.continueButton);
		this.container.addChild(this.continueText);
		this.container.addChild(this.restartButton);
		this.container.addChild(this.restartText);
		this.container.addChild(this.line);
		this.container.addChild(this.control);
		this.container.addChild(this.controlBind);
		
		this.visible = false;
		this.container.visible = false;
	}
	this.init();
}


///////////////////////////////////////////////////
////////////////////////Hud////////////////////////
///////////////////////////////////////////////////

var Hud = function(){
	this.container = new PIXI.Container();

	this.ammoBackground = null;
	this.ammoText = null;
	this.waveText = null;
	this.zleftText = null;

	//////////////////////////////////////

	this.ammoAfmetingen = {
		marginX: 30, 
		marginY: 30,
		width: 200,
		height: 80,
		radius: 5
	};
	this.ammoAfmetingen.x = game.app.renderer.width - this.ammoAfmetingen.marginX - this.ammoAfmetingen.width;
	this.ammoAfmetingen.y = game.app.renderer.height - this.ammoAfmetingen.marginY - this.ammoAfmetingen.height;

	this.ammoStyle = new PIXI.TextStyle({
		fontSize: 20
	});

	//////////////////////////////////////

	this.waveStyle = new PIXI.TextStyle({
		fontSize: 80,
		fontFamily: "oke",
		padding: 10
	});

	this.waveAfmetingen = {
		marginX: 50, 
		marginY: 20,
	};
	this.waveAfmetingen.x = this.waveAfmetingen.marginX;
	this.waveAfmetingen.y = game.app.renderer.height - this.waveAfmetingen.marginY - this.waveStyle.fontSize;

	///////////////////////////////////////////////////

	this.zleftStyle = new PIXI.TextStyle({
		fontSize: 30,
		fontFamily: "oke",
		padding: 15
	});
	
	this.zleftMarginY = 20;

	///////////////////////////////////////////////////
	///////////////////////////////////////////////////
	
	this.update = function(){
		this.ammoText.text = 
			"Ammo:\t" + 
			String(player.weapon.currentMagazineAmmo) +
			" / " + 
			String(player.weapon.currentTotalAmmo);
		this.ammoText.position.set(	this.ammoAfmetingen.x + (this.ammoBackground.width / 2) - (this.ammoText.width/2),
									this.ammoAfmetingen.y + 10);	
			
		this.healthText.text = 
			"Health:\t" +
			Math.floor(player.health);
		this.healthText.position.set(this.ammoText.x, this.ammoText.y + this.ammoText.height + 10);


		this.waveText.text = String(game.wave);
		
		this.zleftText.text = 
			game.zombies.nogTeKillen +
			" zombies left"
			
		this.zleftText.position.set((game.app.renderer.width / 2) - (this.zleftText.width / 2),
									this.zleftMarginY);
	}

	this.init = function(){
		this.ammoBackground = new PIXI.Graphics();
		this.ammoBackground.beginFill(0xff0000, 0.8);
		this.ammoBackground.drawRoundedRect(
			this.ammoAfmetingen.x, 
			this.ammoAfmetingen.y,
			this.ammoAfmetingen.width,
			this.ammoAfmetingen.height,
			this.ammoAfmetingen.radius
		);
		this.ammoBackground.endFill();


		this.ammoText = new PIXI.Text("",this.ammoStyle);
		this.ammoText.position.set(0,0);


		this.healthText = new PIXI.Text("",this.ammoStyle);
		this.healthText.position.set(0,0);

		
		this.container.addChild(this.ammoBackground);
		this.container.addChild(this.ammoText);
		this.container.addChild(this.healthText);

		///////////////////////////////////////////////////	

		this.waveText = new PIXI.Text(
			"",
			this.waveStyle
		);
		this.waveText.position.set(this.waveAfmetingen.x, this.waveAfmetingen.y);

		this.container.addChild(this.waveText);

		///////////////////////////////////////////////////

		this.zleftText = new PIXI.Text(
			"",
			this.zleftStyle
		);
		this.zleftText.position.set(0, 0);

		this.container.addChild(this.zleftText);
	}
	this.init();
}

///////////////////////////////////////////////////
///////////////////////Player//////////////////////
///////////////////////////////////////////////////

var Player = function(){
	this.x = 0;
	this.y = 0;
	this.walkSpeed = 2;
	this.sprintSpeed = 4;
	this.speed = 0;
	this.hoek = 0;
	this.tooClose = false;
	this.bulletRelx = 300;
	this.bulletRely = 117;
	this.pivot = {x:70,y:80};
	this.rotPoint = {x:this.pivot.x,y:this.pivot.y + 40};
	this.sprite = null;
	this.collision = null;
	this.collisionPos = {x:0,y:0,radius:20};
	this.health = 100;
	this.weapon = null;
	this.oldTime = 0;
	this.sprinting = false;
	this.sprintTime = 4;
	this.sprintCooldown = false;
	this.sprintCooldownTime = 3;

	this.setDamage = function(damage) {
		this.health -= damage;
		if(this.health < 0) {
			game.ending();
		}
	}

	this.setSprint = function(sprint){
		var d = new Date();
		if(sprint && !this.sprinting){
			if(this.sprintCooldown){
				if((d.getTime() - this.oldTime) > (this.sprintCooldownTime * 1000)) {
					this.sprinting = true;
					this.oldTime = d.getTime();
				}
			} else {
				this.sprinting = true;
				this.oldTime = d.getTime();
			}
		} else if (!sprint && this.sprinting) {
			this.sprinting = false;
			this.sprintCooldown = false;
			this.oldTime = 0;
		} else if (sprint && this.sprinting){
			if((d.getTime() - this.oldTime) > (this.sprintTime * 1000)) {
				this.sprinting = false;
				this.sprintCooldown = true;
				this.oldTime = d.getTime();
			}
		}
	}

	this.update = function(){
		if(this.health < 100)
			this.health += 0.01;
	}

	this.setRotation = function(hoek){
		this.hoek = hoek;
		this.sprite.rotation = hoek;

		this.collision.x = this.x;
		this.collision.y = this.y;
	}

	this.localToGlobal = function(coords){
		var x = coords.x;
		var y = coords.y;

		var relx = (x - player.pivot.x) * player.sprite.scale.x;
		var rely = (y - player.pivot.y) * player.sprite.scale.y;
		var hoek = (player.hoek + Math.atan(rely/relx)) % (2*Math.PI);
		var distance = Math.sqrt((relx**2)+(rely**2));
		var x = player.x + Math.cos(hoek)*distance;
		var y = player.y + Math.sin(hoek)*distance;
		return {x:x,y:y};
	}

	this.setPos = function(x,y){
		this.x = x;
		this.y = y;
		this.sprite.position.set(x,y);
	}

	this.init = function(){
		this.sprite = new PIXI.Sprite(PIXI.loader.resources["images/player.png"].texture);
		this.sprite.scale.set(0.3);
		this.sprite.pivot.set(this.pivot.x,this.pivot.y);
		this.collision = new Circle(0, 0, this.collisionPos.radius);
		this.collision.type = "player";
		map.collision.insert(this.collision);

		this.setPos(game.app.renderer.width/2, game.app.renderer.height/2);
		this.setRotation(0);

		this.weapon = new Weapon(30, 240);
	}
	this.init();
}

///////////////////////////////////////////////////
///////////////////////Input///////////////////////
///////////////////////////////////////////////////

var Input = function(){
	this.vx = 0;
	this.vy = 0;
	this.keys = [];
	this.mouse = {
		x:0,
		y:0,
		hoek:0,
		buttons:[]
	}

	this.keyCheck = function() {
		var sprint = false;
		if (this.keys[16]){
			sprint = true;
		}if (this.keys[87]){
			this.vy -= player.walkSpeed;
		}if (this.keys[68]){
			this.vx += player.walkSpeed;
		}if (this.keys[83]){
			this.vy += player.walkSpeed;
		}if (this.keys[65]){
			this.vx -= player.walkSpeed;
		}if (this.keys[82]){
			player.weapon.needReloading = true;
		}if (this.keys[74]){
			game.app.ticker._head.next.fn = (delta=>endingLoop(delta));
		}
		player.setSprint(sprint);
		var mult = player.sprinting ? player.sprintSpeed : player.walkSpeed;
		mult += game.deltaLag;
		var a = normalize({x:this.vx,y:this.vy}, mult);
		this.vx = a.x;
		this.vy = a.y;
	}

	this.playerRotate = function() {
		if(this.mouse.x == this.mouse.oudx && this.mouse.y == this.mouse.oudy) return;
		if(
			new Circle(
				player.collision.x,
				player.collision.y,
				player.collision.radius-5
			).collides(
				new Point(
					this.mouse.x,
					this.mouse.y
				)
			)
		){
			player.tooClose = true;
			return;
		}
		player.tooClose = false;

		var a = player.localToGlobal(player.rotPoint);
		dx = this.mouse.x - a.x;
		dy = this.mouse.y - a.y;

		if (dx >= 0 && dy >= 0){
			this.mouse.hoek = Math.atan(dy/dx);
		} if (dx < 0){
		 	this.mouse.hoek = Math.atan(dy/dx) + Math.PI;
		} if (dx >= 0 && dy < 0){
			this.mouse.hoek = Math.atan(dy/dx) + (2*Math.PI);
		}

		player.rotation = this.mouse.hoek;
		player.setRotation(player.rotation);
	}
	
	this.bulletFireCheck = function() {
		if(this.mouse.buttons[0]){
			player.weapon.shoot();
		}
	}

	this.init = function(){
		document.addEventListener("keydown", function (e){
			input.keys[e.keyCode] = true;
		});
		document.addEventListener("keyup", function (e){
			input.keys[e.keyCode] = false;
			if(e.keyCode == 27){
				game.pauseMenu.show();
			}
		});
		document.addEventListener("mousemove", function (e){
			input.mouse.oudx = input.mouse.x;
			input.mouse.oudy = input.mouse.y;
			input.mouse.x = e.clientX;
			input.mouse.y = e.clientY;
		});
		document.addEventListener("mousedown", function (e){
			input.mouse.buttons[e.button] = true;
		});
		document.addEventListener("mouseup", function (e){
			input.mouse.buttons[e.button] = false;
		});
	}
}

///////////////////////////////////////////////////
///////////////////////Bullets/////////////////////
///////////////////////////////////////////////////

var Bullets = function(){
	this.container = new PIXI.Container();
	this.array = [];
	this.size = 0;
	
	this.damage = 120;

	this.addBullet = function(){
		if(player.tooClose) return;
		var bul = new Bullet(clone(this.array.length));
		this.array.push(bul);
		this.container.addChild(bul.sprite);
		this.array.sort(sortingFunc);
	}
	this.removeBullet = function(id){
		this.container.removeChildAt(id);
		this.array[id].collision.remove();
		this.array.splice(id,1);
		
		var number = 0;
		for(var obj of this.array){
			obj.id = number;
			obj.collision.id = number;
			number += 1;
		}

		this.array.sort(sortingFunc);
	}

	this.move = function(vx,vy,onlyRel = false){
		if(onlyRel){
			for (var x = 0; x < this.array.length; x++) {
				this.array[x].setPos(this.array[x].x - vx, 
									this.array[x].y - vy);
				
			}
			return;
		}

		for (var x = 0; x < this.array.length; x++) {
			var a = this.array[x];

			if(a.firstMove){
				a.collision.remove();
				a.collision = new Polygon(
					a.x,
					a.y,
					[
						[-a.snelVec.vx, -a.snelVec.vy],
						[-a.snelVec.vx + 1, -a.snelVec.vy],
						[1, 0],
						[0,0]
					]
				);
				a.collision.type = "bullet";
				a.collision.id = a.id;
				a.collision._calculateCoords();
				map.collision.insert(a.collision);
		
				a.firstMove = false;
			}

			if (this.array[x].x < map.x || 
				this.array[x].x > (map.x+map.sprite.width) ||
				this.array[x].y < map.y ||
				this.array[x].y > (map.y+map.sprite.height )){

				this.removeBullet(x);
				x -= 1;

			} else {
				this.array[x].setPos(this.array[x].snelVec.vx + this.array[x].x - vx, 
									this.array[x].snelVec.vy + this.array[x].y - vy);
			}
		}
	}
}

///////////////////////////////////////////////////
///////////////////////Bullet//////////////////////
///////////////////////////////////////////////////

var Bullet = function(id){
	this.id = id;
	this.x = 0;
	this.y = 0;
	this.radius = 3;
	this.speed = 30;
	this.snelVec = null;
	this.sprite = null;
	this.collision = null;
	this.firstMove = false;

	this.setPos = function(x,y){
		this.x = x;
		this.y = y;

		this.sprite.position.set(x,y);

		this.collision.x = x;
		this.collision.y = y;
	}

	this.init = function(id){
		var a = player.localToGlobal(player.rotPoint);
		var point = {x: input.mouse.x-a.x, y:input.mouse.y-a.y};
		point = normalize(point);

		var bullet = new PIXI.Sprite(PIXI.loader.resources["images/bullet.png"].texture);
		bullet.width = this.radius*2;
		bullet.height = this.radius*2;
		bullet.anchor.set(0.5,0.5);
		bullet.id = id;

		this.sprite = bullet;
		this.snelVec = {vx:point.x * this.speed, vy:point.y * this.speed};
		this.collision = new Circle(0,0,this.radius);
		this.collision.type = "bullet";
		this.collision.id = id;
		map.collision.insert(this.collision);
		this.firstMove = true;

		var a = player.localToGlobal({x:player.bulletRelx,y:player.bulletRely});
		this.setPos(a.x,a.y)
	}
	this.init(this.id);
}

///////////////////////////////////////////////////
//////////////////////Zombies//////////////////////
///////////////////////////////////////////////////

var Zombies = function(aantal){
	this.array = [];
	this.aantal = aantal;
	this.nogSpawnen = aantal;
	this.spawnInterval = 5;
	this.spawnPoints = [];
	this.pathTime = 0.5;

	this.walkSpeed = 1.5;
	this.sprintSpeed = 2;

	this.damage = 1;
	this.alphaIncrease = 1/(game.app.ticker.FPS * 3);
	this.stillSpawning = [];
	this.nogTeKillen = aantal;

	this.update = function(vx,vy, onlyRel = false){
		this.alphaIncrease = 1/(game.app.ticker.FPS * 3);
		for(var x = 0; x < this.array.length; x++){
			var a = this.array[x];
			a.setPos(a.x-vx, a.y-vy);
		}

		for(var x = 0; x < this.spawnPoints.length; x++){
			this.spawnPoints[x].x -= vx;
			this.spawnPoints[x].y -= vy;
		}

		if(!onlyRel){
			var update = true;
			var d = new Date();
			if((d.getTime() - this.oldPathTime) > (this.pathTime * 1000)){
				update = true;
			}

			for(var x = 0; x < this.array.length; x++){
				var a = this.array[x];
				if(this.array[x].sprite.alpha < 1) continue;
				a.move(update);
				pathfinding.grid.setWalkableAt(a.gridCoords.x, a.gridCoords.y, false);
			}

			for(var x = 0; x < this.array.length; x++){
				var a = this.array[x];

				if(a.sprite.alpha < 1) {
					a.sprite.alpha += this.alphaIncrease;
					if(a.sprite.alpha > 1){
						a.sprite.alpha = 1;
						this.stillSpawning = [];
						for(var y = 0; y < this.array.lengh; y++){
							if(this.array[x].sprite.alpha != 0) 
								this.stillSpawning.push(this.array[x].spawnPoint);
						}
					}
				} else{
					pathfinding.grid.setWalkableAt(a.gridCoords.x, a.gridCoords.y, true);
				}
			}

			if(update){
				d = new Date();
				this.oldPathTime = d.getTime();
			}
		}
	}

	this.tijdSpawnUpdate = function(){
		if(this.array.length == game.maxLevendeZombies) return;

		var d = new Date();
		if((d.getTime() - this.oldSpawnTime) < (this.spawnInterval * 1000)) return;

		var aantal = 	(game.maxLevendeZombies - this.array.length) < this.nogSpawnen ? 
						game.maxLevendeZombies - this.array.length :
						this.nogSpawnen;
		
		aantal = 	aantal > this.spawnPoints.length ?
					this.spawnPoints.length :
					aantal;

		if(aantal == 0) {
			var d = new Date();
			this.oldSpawnTime = d.getTime();
			return;
		}

		var keuzeArray = [...Array(this.spawnPoints.length).keys()];
		for(var x = 0; x < aantal; x++){
			if(keuzeArray.length == 0) break;

			var spawnPoint = Math.floor(Math.random() * keuzeArray.length);

			var skip = false;
			for(var obj of this.stillSpawning){
				if(spawnPoint == obj){
					skip = true;
					break;
				}
			} if(skip){
				keuzeArray.splice(spawnPoint,1);
				continue;
			}

			this.addZombie(this.array.length, keuzeArray[spawnPoint]);
			keuzeArray.splice(spawnPoint,1);
			this.nogSpawnen--; 
		}

		var d = new Date();
		this.oldSpawnTime = d.getTime();
	}

	this.addZombie = function(id, spawnNumber){
		this.stillSpawning.push(spawnNumber);

		if(game.wave <= 3) var speed = this.walkSpeed;
		else if(game.wave >= 10) var speed = this.sprintSpeed;
		else var speed = [this.walkSpeed, this.sprintSpeed][Math.floor(Math.random() * 2)];

		var spawn = this.spawnPoints[spawnNumber];
		var l = new Zombie(id, spawn, this.damage, speed);
		l.spawnPoint = spawnNumber;

		this.array.push(l);
		game.zombiesContainer.addChild(l.sprite);
	}

	this.removeZombie = function(id){
		this.array[id].collision.remove();
		this.array.splice(id,1);
		game.zombiesContainer.removeChildAt(id);

		var number = 0;
		for(var obj of this.array){
			obj.id = number;
			obj.collision.id = number;
			number += 1;
		}

		this.array.sort(sortingFunc);
		
		this.nogTeKillen--;
	}

	this.init = function(){		
		var a = map.objects["zombieSpawn"];
		for(var x = 0; x < a.length; x++){
			var b = {x:a[x].x,y:a[x].y};
			b.x = b.x * map.scale + map.x;
			b.y = b.y * map.scale + map.y;
			this.spawnPoints.push(clone(b));

			this.addZombie(x, x);
			this.nogSpawnen--;
		}

		var d = new Date();
		this.oldSpawnTime = d.getTime();
		this.oldPathTime = d.getTime() - (this.pathTime*1000);

		map.collision.update();
	}

	this.init();
}

///////////////////////////////////////////////////
///////////////////////Zombie//////////////////////
///////////////////////////////////////////////////

var Zombie = function(id, pos, damage, speed){
	this.x;
	this.y;
	this.id = id;
	this.hoek = 0;
	this.scale = 0.25;
	this.pivot = {x:50,y:85};
	this.collisionPos = {x:10,y:0,radius:60};
	this.path = [];
	this.sprite;
	this.collision;
	
	this.speed = speed;
	this.damage = damage;
	this.health = 100;

	this.setDamage = function(damage){
		this.health -= damage;
		
		if(this.health < 0){
			game.zombies.removeZombie(this.id);
		}
	}

	this.move = function(pathUpdate = false){ 
		if(pathUpdate){
			var g = pathfinding.gridTile;
			var p = pathfinding.findCoords(player.x,player.y);
			var z = pathfinding.findCoords(this.collision.x,this.collision.y);

			if(	p.y > pathfinding.grid.nodes.length - 1 ||
				p.x > pathfinding.grid.nodes[0].length - 1 ||
				p.x < 0 ||
				p.y < 0 ||
				!pathfinding.grid.isWalkableAt(p.x,p.y) ||

				z.y > pathfinding.grid.nodes.length - 1 ||
				z.x > pathfinding.grid.nodes[0].length - 1 ||
				z.x < 0 ||
				z.y < 0 ||
				!pathfinding.grid.isWalkableAt(z.x,z.y)) {
				console.log("nope");
			} 

			var path = pathfinding.findPath(
				{x: z.x,	y: z.y},
				{x: p.x,	y: p.y}
			);

			for(var x = 0; x < path.length; x++){
				path[x] = [path[x][0] * g + map.x,
						path[x][1] * g + map.y];
			}

			if(!path[1]){
				path[1] = path[0];
			}

			this.path = path;
		} 
		
		if(this.path[0][0] == this.path[1][0] && 
			this.path[0][1] == this.path[1][1]) 
		{
			var snelVec = normalize(
				{
					x:	player.x-this.collision.x,
					y: 	player.y-this.collision.y
				},
				this.speed
			);
		} else{
			var snelVec = normalize(
				{
					x:	this.path[1][0]-this.collision.x,
					y:	this.path[1][1]-this.collision.y
				},
				this.speed
			);
		}

		this.snelVec = snelVec;
		this.gridCoords = z;

		this.setPos(this.x+snelVec.x, this.y+snelVec.y);
		this.rotate();
	}

	this.rotate = function(){
		dx = this.path[1][0] - this.path[0][0];
		dy = this.path[1][1] - this.path[0][1];
		if(dx == 0 && dy == 0){
			this.hoek = this.oudeHoek;
			this.sprite.rotation = this.oudeHoek;
			return;
		}
		this.oudeHoek = this.hoek;

		if (dx >= 0 && dy >= 0){
			this.hoek = Math.atan(dy/dx);
		} if (dx < 0){
		 	this.hoek = Math.atan(dy/dx) + Math.PI;
		} if (dx >= 0 && dy < 0){
			this.hoek = Math.atan(dy/dx) + (2*Math.PI);
		}
		this.sprite.rotation = this.hoek;
	}

	this.setPos = function(x,y){
		if(!x || !y) console.log("nope");
		this.x = x;
		this.y = y;

		this.sprite.position.set(x,y);

		this.collision.x = x + (this.collisionPos.x * this.scale);
		this.collision.y = y + (this.collisionPos.y * this.scale);
	}
	
	this.init = function(){
		this.sprite = new PIXI.Sprite(PIXI.loader.resources["images/zombie.png"].texture);
		this.sprite.pivot.set(this.pivot.x, this.pivot.y);
		this.sprite.scale.set(this.scale);
		this.sprite.alpha = 0;
		
		this.collision = new Circle(0,0,this.collisionPos.radius*this.scale);
		this.collision.type = "zombie";
		this.collision.id = this.id;
		map.collision.insert(this.collision);
		this.setPos(pos.x,pos.y);

		var d = new Date();
		this.oldSpawnTime = d.getTime();
	}
	this.init();
}

///////////////////////////////////////////////////
////////////////////Overige funcs//////////////////
///////////////////////////////////////////////////

function clone(src){
	if(Array.isArray(src)) return JSON.parse(JSON.stringify(src));
	else if (typeof(src) == "number") {var a = src; return a}
	else return Object.assign({}, src);
}

function normalize(point, multiplier = 0) {
	var norm = Math.sqrt(point.x ** 2 + point.y ** 2);
	if(multiplier) norm /= multiplier;
	if (norm != 0) {
		point.x /= norm;
	  	point.y /= norm;
	}

	return point;
}

function sortingFunc(a,b){
	return a.id - b.id
}

Array.prototype.search = function(val) {
    var hash = {};
    for(var i=0; i<this.length; i++) {
        hash[this[i]] = i;
    }
    return hash.hasOwnProperty(val);
}

Array.prototype.count = function(val) {
	var count = 0;
	for(var obj of this) {
		if(obj == val) count++;
	}
	return count;
}

PIXI.Text.prototype.determineFontProperties = function(fontStyle){	var properties = PIXI.Text.fontPropertiesCache[fontStyle];	if(properties){		return properties;	}	properties =  {		ascent: 30,		descent: 10,		fontSize: 50	};	PIXI.Text.fontPropertiesCache[fontStyle] = properties;	return properties;};
