var Pathfinding = function(){
    this.gridTile = 20;
    this.grid = null; 

    this.init = function(){
		this.gridInit();
    }

	this.gridInit = function(){
		this.grid = new PF.Grid(
            Math.floor(
				map.sprite.width/this.gridTile + 1
            ),
            Math.floor(
				map.sprite.height/this.gridTile + 1
            )
        );

		
		var collision = new Collisions();
		for(var x = 0; x < this.grid.nodes.length; x++){
			for(var y = 0; y < this.grid.nodes[x].length; y++){
				var a = new Circle(this.grid.nodes[x][y].x,this.grid.nodes[x][y].y, 0.3);
				this.grid.nodes[x][y].checked = false;
				a.ait = true;
				a.checked = false;
				collision.insert(a);
			}
		}

		var polys = [];
		for(var x = 0; x < map.objects["collision"].length;x++){
			var a = clone(map.objects["collision"][x][1]);
			var vertices = [];
			for(var y = 0; y < a._points.length; y+=2){
				vertices.push([a._points[y]/this.gridTile,a._points[y+1]/this.gridTile]);
			}
			var b = collision.createPolygon(
				(a.x-map.x)/this.gridTile,
				(a.y-map.y)/this.gridTile,
				vertices
			);
			polys.push(b);
		}
		collision.update()
		for(var x = 0; x < polys.length;x++){
			var a = polys[x];
			var b = a.potentials();
			for(var y = 0; y < b.length; y++){
				if(!b[y].ait) continue;
				var walkable = !a.collides(b[y]);
				if(!walkable && !b[y].checked){
					this.grid.nodes[b[y].y][b[y].x].checked = true;
					b[y].checked = true;
					this.grid.setWalkableAt(b[y].x,b[y].y, false);
				}
			}
		}		
		this.finder = new PF.BestFirstFinder({
			allowDiagonal: true,
			dontCrossCorners: true
		});
	}

	this.findCoords = function(x,y){
		var ix = x;
		var ey = y;

		var oke = false;
		if(oke) console.log(ix,ey);

		var x = (x - map.x)/this.gridTile + 0.00001;
		var y = (y - map.y)/this.gridTile + 0.00001;
		var roundedx = Math.round(x);
		var roundedy = Math.round(y);

		if(this.grid.isWalkableAt(roundedx,roundedy)){
			return {x:roundedx,y:roundedy};
		}

		n = [];
		n.push({"x":Math.floor(x), "y":Math.floor(y), "walkable": this.grid.isWalkableAt(Math.floor(x),Math.floor(y))});
		n.push({"x":Math.ceil(x), "y":Math.floor(y), "walkable": this.grid.isWalkableAt(Math.ceil(x),Math.floor(y))});
		n.push({"x":Math.ceil(x), "y":Math.ceil(y), "walkable": this.grid.isWalkableAt(Math.ceil(x),Math.ceil(y))});
		n.push({"x":Math.floor(x), "y":Math.ceil(y), "walkable": this.grid.isWalkableAt(Math.floor(x),Math.ceil(y))});

		var langste = 0;
		for(var i = 0; i < n.length; i++){
			n[i]["length"] = Math.sqrt(((x-n[i]["x"])**2) + ((y-n[i]["y"])**2));
			if(n[i]["length"]>langste && n[i]["walkable"]){
				langste = i;
			}
		}
		if(!n[langste]["walkable"]){
			throw "Er is geen dichtbijzijnde loopbare tile gevonden";
		}
		return {x:n[langste]["x"], y:n[langste]["y"]};
	}

	this.findPath = function(a,b){
		var oldgrid = this.grid.clone();

		var path = this.finder.findPath(a.x,a.y,b.x,b.y,this.grid);
		
		try {
			path[0][0];
		} catch {
			return [[a.x, a.y]];
		}

		path = PF.Util.smoothenPath(this.grid, path);

		this.grid = oldgrid;
		return path;
	}
	this.init();
}