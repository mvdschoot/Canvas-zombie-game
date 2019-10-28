function Csetup (){
	var l = map.objects["collision"];
	map.objects["collision"] = [];
	for(var x = 0; x < l.length; x++){
		switch(l[x].type){
			case "polygon":
			var polygon = (l[x]["polygon"] || l[x]["polyline"]);

			var a = [];
			for (var y = 0;y < polygon.length; y++){
				a.push(
					[polygon[y].x + l[x]["x"],
					polygon[y].y + l[x]["y"]]
				);
			}

			decomp.makeCCW(a);
			a = decomp.quickDecomp(a);
			var vertices = [];
			for(var y = 0; y < a.length;y++){
				decomp.removeCollinearPoints(a[y],0.1);
				decomp.removeDuplicatePoints(a[y],0.1);
				decomp.makeCCW(a[y]);
				vertices[y] = [];
				vertices[y].push([0,0]);
				for(var z = 0; z < a[y].length-1; z++){
					vertices[y].push([a[y][z+1][0] - a[y][0][0], a[y][z+1][1] - a[y][0][1]]);
				}	
				var oke = new Polygon(
					a[y][0][0], 
					a[y][0][1],
					vertices[y]
				);
				oke.type = "map";
				map.collision.insert(oke);

				map.objects["collision"].push([vertices[y],oke]);
			}
			
			break;
		}
	}	
}


function collisionCheck(){

	/////////////////////////////////////////////
	/////////////////////player//////////////////
	/////////////////////////////////////////////

	var potentials = player.collision.potentials();
	var response = map.collision.createResult();
	var collisions = {};
	collisions["player"] = {"map":[false], "zombies":[false], "ammo":[false]};

	for (var obj of potentials){
		var result = player.collision.collides(obj,response);
		if (obj.type == "ammo"){
			collisions["player"]["ammo"][0] = true;
			collisions["player"]["ammo"].push(Object.assign({},response));
		}
		if(result){
			if(obj.type == "map"){
				collisions["player"]["map"][0] = true;
				collisions["player"]["map"].push(Object.assign({},response));
			} else if (obj.type == "zombie"){
				collisions["player"]["zombies"][0] = true;
				collisions["player"]["zombies"].push(Object.assign({},response));
			} 
		}
	}

	/////////////////////////////////////////////
	////////////////////Zombies//////////////////
	/////////////////////////////////////////////

	var a = game.zombies.array;
	var gedaan = [];
	collisions["zombies"] = {"zz":[], "zp": [], "zm": [], "zb": [], "amount": []};
	for(var x = 0; x < a.length; x++){
		var potentials = a[x].collision.potentials();
		for(var obj of potentials){
			if(gedaan.search([obj.id,a[x].id])) continue;
			var result = a[x].collision.collides(obj,response);
			if(result){
				if(obj.type == "zombie") {
					collisions["zombies"]["zz"].push(clone(response));
					gedaan.push([x, response.b.id]);
					collisions["zombies"]["amount"].push(response.a.id, response.b.id);
				} else if(obj.type == "player"){
					collisions["zombies"]["zp"].push(clone(response));
					collisions["zombies"]["amount"].push(response.a.id);
				} else if(obj.type == "map") {
					collisions["zombies"]["zm"].push(clone(response));
					collisions["zombies"]["amount"].push(response.a.id);
				} else if(obj.type == "bullet") {
					collisions["zombies"]["zb"].push(clone(response));
				}
			}
		}
	}

	return collisions;
}