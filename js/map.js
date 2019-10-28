var Maps = function(){
    this.x = 0;
    this.y = 0;
	this.scale = 3;
    this.layers = {};
    this.objects = {};

    this.setPos = function(x,y){
        this.x = x;
        this.y = y;
        this.sprite.position.set(x,y);
	}
	
	this.mapMove = function(vx,vy){
		this.setPos(this.x - vx, this.y - vy);
		
        for(var x = 0; x < this.objects["collision"].length;x++){
            this.objects["collision"][x][1].x -= vx;
            this.objects["collision"][x][1].y -= vy;
		} 
	}

    this.init = function(){
        loadJSON();
        this.lafunc();
		this.load();
		this.load2();
		this.loadSurrounding();
	}

	this.move = function(repeat = false){
		if(!repeat){	
			var vx = input.vx;
			var vy = input.vy;
			game.zombies.tijdSpawnUpdate();

			game.zombies.update(vx,vy);
			bullets.move(vx,vy);
			this.mapMove(vx,vy);	
			game.update(vx,vy);
		}

		///////////////////////////////////////////////////
		///////////////////////////////////////////////////

		this.collision.update();
		var col = collisionCheck();

		if(col["player"]["map"][0]){
			var a = col["player"]["map"][1];
			a.overlap = Math.round(a.overlap);
			a.overlap += 1;
			var vx = -a.overlap_x * a.overlap;
			var vy = -a.overlap_y * a.overlap;
			
			this.mapMove(vx,vy);	
			game.update(vx,vy);
			game.zombies.update(vx,vy, true);
			bullets.move(vx,vy, true);
			
			if(col["player"]["map"][2]) {
                input.vx = 0;
                input.vy = 0;
                this.move(repeat = true);
			}

			this.collision.update();
			col = collisionCheck();
		}
	
		///////////////////////////////////////////////////

		for(var obj of col["zombies"]["zm"]) {
			var vx = -obj.overlap_x * obj.overlap;
			var vy = -obj.overlap_y * obj.overlap;
			var a = game.zombies.array[obj.a.id];
			a.setPos(a.x + vx,	a.y + vy);
		} 
		if(col["zombies"]["zm"].length){
			this.collision.update();
			col = collisionCheck();
		}

		///////////////////////////////////////////////////

		for(var x = 0; x < col["zombies"]["zp"].length; x++) {
			var obj = col["zombies"]["zp"][x];
			var a = game.zombies.array[obj.a.id];
			if(a.sprite.alpha < 1) continue;

			obj.overlap += 1;
			var vx = obj.overlap_x * obj.overlap;
			var vy = obj.overlap_y * obj.overlap;

			a.setPos(a.x - vx,	a.y - vy);

			var vx = input.vx == 0 ? -input.vx : obj.overlap_x * obj.overlap;
			var vy = input.vy == 0 ? -input.vy : obj.overlap_x * obj.overlap;


			game.zombies.update(vx,vy,true);
			bullets.move(vx,vy,true);
			this.mapMove(vx,vy);	
			game.update(vx,vy);

			player.setDamage(a.damage);
			if(col["zombies"]["zp"][1]){
                input.vx = 0;
                input.vy = 0;
                this.move(repeat = true);
			}
		}

		///////////////////////////////////////////////////

		for(var obj of col["zombies"]["zz"]){
			if(col["zombies"]["amount"].count(obj.a.id) > 1){
				var vxb = obj.overlap_x * obj.overlap;
				var vyb = obj.overlap_y * obj.overlap;
				var b = game.zombies.array[obj.b.id];
				b.setPos(b.x + vxb,	b.y + vyb);
			} else if(col["zombies"]["amount"].count(obj.b.id) > 1){
				var vxa = -obj.overlap_x * obj.overlap;
				var vya = -obj.overlap_y * obj.overlap;
				var a = game.zombies.array[obj.a.id];
				a.setPos(a.x + vxa,	a.y + vya);
			} else{
				obj.overlap /= 2;
				var vxa = -obj.overlap_x * obj.overlap;
				var vya = -obj.overlap_y * obj.overlap;
				var vxb = obj.overlap_x * obj.overlap;
				var vyb = obj.overlap_y * obj.overlap;
				
				var a = game.zombies.array[obj.a.id];
				var b = game.zombies.array[obj.b.id];
				a.setPos(a.x + vxa,	a.y + vya);
				b.setPos(b.x + vxb,	b.y + vyb);
			}
		}

		if(col["zombies"]["zz"].length){
			this.collision.update();
			col = collisionCheck();
		}
		
		///////////////////////////////////////////////////

		for(var obj of col["zombies"]["zm"]) {
			var vx = -obj.overlap_x * obj.overlap;
			var vy = -obj.overlap_y * obj.overlap;
			var a = game.zombies.array[obj.a.id];
			a.setPos(a.x + vx,	a.y + vy);
		}

		///////////////////////////////////////////////////

		for(var obj of col["zombies"]["zb"]) {
			if(!bullets.array[obj.b.id] || game.zombies.array[obj.a.id].sprite.alpha < 1) continue;
			bullets.removeBullet(obj.b.id);
			game.zombies.array[obj.a.id].setDamage(bullets.damage);
		}

		///////////////////////////////////////////////////
		
		if(col["player"]["ammo"][0]){
			var obj = col["player"]["ammo"][1];
			player.weapon.removePack(obj.b.id);
			player.weapon.currentTotalAmmo += player.weapon.ammoPackAmount;
		}

		///////////////////////////////////////////////////

		input.vx = 0;
        input.vy = 0;
        this.collision.update();  
	}

    
    this.lafunc = function(){
        var l = this.mapJSON.layers;
        for (var x = 0; x < l.length; x++){
            this.layers[l[x]["name"]] = l[x];
        }

        var l = this.layers.objecten["objects"];
		this.objects["collision"] = [];
		this.objects["zombieSpawn"] = [];
		this.objects["ammoPack"] = [];
        for (var x = 0; x < l.length; x++){
            if(l[x]["name"] == "collision"){
                this.objects["collision"].push(l[x]);
            } else if(l[x]["name"] == "ammoPack"){
				this.objects["ammoPack"].push(l[x]);
			} else if(l[x]["name"] == "zombieSpawn"){
				this.objects["zombieSpawn"].push(l[x]);
			} else {
                this.objects[l[x]["name"]] = l[x];
            }
		}
		this.originalPolys = clone(this.objects["collision"]);
    }

    this.load = function(){
        var m = new PIXI.Sprite(PIXI.loader.resources["maps/map.png"].texture);
        m.scale.set(this.scale);

        var spawnx = game.app.renderer.width/2 - this.objects["startingPoint"]["x"]*this.scale;
        var spawny = game.app.renderer.height/2 - this.objects["startingPoint"]["y"]*this.scale;
        this.sprite = m;

        this.setPos(spawnx, spawny);
    }

    this.load2 = function(){
		var l = Object.entries(this.objects);
		for(var z = 0; z < l.length;z++){
			if(l[z][0] == "startingPoint" || l[z][0] == "zombieSpawn" || l[z][0] == "ammoPack"){
				continue;
			}
			for(var x = 0; x < l[z][1].length; x++){
				l[z][1][x].x = l[z][1][x].x*this.scale+this.x;
				l[z][1][x].y = l[z][1][x].y*this.scale+this.y;
				if(l[z][1][x]["type"] == "polygon"){
					var g = l[z][1][x]["polygon"] != undefined ? "polygon" : "polyline";
					for(var y = 0; y < l[z][1][x][g].length;y++){
						l[z][1][x][g][y].x *= this.scale;
						l[z][1][x][g][y].y *= this.scale;
					}
				}
			}
		}
	}
	
	this.loadSurrounding = function(){
		
	}
}

///////////////////////////////////////////////////
////////////////////Overige funcs//////////////////
///////////////////////////////////////////////////

var loadJSON = function() {   
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', 'maps/map.json', false);
    xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == "200") {
            var resp = xobj.responseText;
            map.mapJSON = JSON.parse(resp);
        }
    };
    xobj.send(null);
}
