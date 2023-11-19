#!/usr/bin/env node
const execSync = require('child_process').execSync;
const monumenta_equipment = require("./data/monumenta_equipment.json");

const debug = 0;

/*
Items - https://api.playmonumenta.com/items
Advancements - https://api.playmonumenta.com/advancements
Class Skills - https://api.playmonumenta.com/skills
*/
function update() {
	console.log(execSync('curl -L "https://api.playmonumenta.com/items" -o "./data/MonumentaAPI_Items.json"').toString(),
	execSync('curl -L "https://api.playmonumenta.com/advancements" -o "./data/MonumentaAPI_Advancements.json"').toString(),
	execSync('curl -L "https://api.playmonumenta.com/skills" -o ./data/MonumentaAPI_Skills.json').toString());	
}
function updateHarder() {
	//the mangling
/*
  release_status - string of wasted data
  name           - string unique
  lore           - string unique, irrelevant for build calcs
  location       - string shared, only relevant for filtering terth/gallery gear
  region         - string shared
  tier           - string shared, only relevant for filtering
  base_item      - string shared, relevant for durability and pickaxe break speed
  type           - string shared, equipment slot or misc grouping
  class_name     - string shared, charm class
  stats          - map of equipment effects
  effects        - map of potion effects
  power          - int, charm size
  masterwork     - int
  fish_quality   - int
*/
	
	//specialcase these indexes since they have fixed meaning even though it shouldnt matter because itnernals
	let regions = ["","Valley","Isles","Ring"];
	let tiers = ["Tier 0", "Tier 1", "Tier 2", "Tier 3", "Tier 4", "Tier 5"];
	
	//specialcase these so that i can think less setting this up
	let types_equip = ["Helmet", "Chestplate", "Leggings", "Boots", "Offhand", "Offhand Shield", "Offhand Sword", "Axe", "Pickaxe", "Mainhand Sword", "Trident", "Mainhand", "Snowball", "Shovel", "Mainhand Shield", "Scythe", "Bow", "Crossbow", "Projectile", "Wand"];
	let types_other = [];
	
	let locations = [""], types = [""], base_items = [], class_names = [], stats = [];
	let locations_equips = [""], tiers_equips = ["Tier 0", "Tier 1", "Tier 2", "Tier 3", "Tier 4", "Tier 5"];
	
	const data_ = require("./data/MonumentaAPI_Items.json");
	let map_props = {};
	for (let name of Object.keys(data_)) {
		//console.log(name);
			
		if (data_[name].release_status !== "public") {
			console.log("WARN - Public:", name, data_[name].release_status);
		}
		//if (!data_[name].location) console.log("WARN - no location -", name);
		
		for (let prop of Object.keys(data_[name])) {
			//if (prop === "release_status") continue;
			if (prop === "stats") {
				if(data_[name].type && types_equip.includes(data_[name].type)) {			
					if (!map_props.stats) {
						map_props.stats = {}
					}
					for (let stat of Object.keys(data_[name].stats)) {
						if (stat === "[object Object]") console.log(stat);
						if (!map_props.stats[stat]) {
							map_props.stats[stat] = 1;
							//console.log(stat);
						} else {
							map_props.stats[stat] ++;
						}
					}
				}
				continue;
			}
			if (prop === "location" && types_equip.includes(data_[name].type)) {
				if (!locations_equips.includes(data_[name].location)) locations_equips.push(data_[name].location);
			}
			if (prop === "tier" && types_equip.includes(data_[name].type)) {
				if (!tiers_equips.includes(data_[name].tier)) tiers_equips.push(data_[name].tier);
			}
			
			if (!map_props[prop]) {
				map_props[prop] = {}
			}
			if (!map_props[prop][data_[name][prop]]) {
				map_props[prop][data_[name][prop]] = 1;
			} else {
				map_props[prop][data_[name][prop]] ++;
			}
		}
	}
	
	locations = Object.keys(map_props.location);
	//class_names = Object.keys(map_props.class_name);
	types = Object.keys(map_props.type);
	stats = Object.keys(map_props.stats);
	base_items = Object.keys(map_props.base_item);
	
	//console.log(Object.keys(map_props));
	
	for (let k of Object.keys(map_props.region)) {
		if (!regions.includes(k)) {
			console.log("WARN - unordered region", k);
			regions.push(k);
		}
	}
	for (let k of Object.keys(map_props.tier)) {
		if (!tiers.includes(k)) {
			tiers.push(k);
		}
	}
	for (let k of Object.keys(map_props.type)) {
		if (!types_equip.includes(k) && !types_other.includes(k)) {
			types_other.push(k);
		}
	}
	
	console.log(Object.keys(data_).length, "Items:", map_props.region);
	console.log(locations.length, "locations");
	//console.log(locations);
	console.log(tiers.length, "tiers");
	//console.log(tiers);
	console.log(types.length, "types");
	//console.log(map_props.type);
	console.log(stats.length, "equip stats");
	//console.log(map_props.stats);
	
	let db = [];
	let rowlen = 8;
	// name, region, type, location, tier, base_item, masterwork, stats
	for (let name in data_) {
		let item = data_[name];
		if (!types_equip.includes(item.type)) continue;
		if (item.region === "Ring" && item.masterwork !== undefined && item.masterwork < 3) continue;
		let blob = new Array(rowlen).fill(0);
		let blobstats = new Array(stats.length).fill(0);
		blob[0] = item.name;
		blob[1] = regions.indexOf(item.region);
		blob[2] = types_equip.indexOf(item.type);
		if (locations_equips.includes(item.location)) blob[3] = locations_equips.indexOf(item.location);
		blob[4] = tiers_equips.indexOf(item.tier);
		blob[5] = base_items.indexOf(item.base_item);
		if (item.masterwork) blob[6] = item.masterwork|0;
		for (stat in item.stats) {
			blobstats[stats.indexOf(stat)] = item.stats[stat];
		}
		blob[7] = blobstats;
		db.push(blob);
	}
	
	console.log(db.length, "equips parsed");
	
	let dataset = {
		"regions" : regions,
		"types" : types_equip,
		"locations" : locations_equips,
		"tiers" : tiers_equips,
		"base_items" : base_items,
		"stats" : stats,
		"items" : db
	}

	const fs = require("fs");
	fs.writeFileSync("data/monumenta_equipment.json", JSON.stringify(dataset));
	console.log("equibment db");
}

function csv() {
	let out = "name,region,type,location,tier," + monumenta_equipment.stats.join(",") + "\r\n";
	for (let item of monumenta_equipment.items) {
		out += item[0] + "," + monumenta_equipment.regions[item[1]] + "," + monumenta_equipment.types[item[2]] + "," + monumenta_equipment.locations[item[3]] + "," + monumenta_equipment.tiers[item[4]] + "," + item[7].join(",") + "\r\n";
	}
	const fs = require("fs");
	fs.writeFileSync("data/monumenta_equipment.csv", out);
	console.log("csv");
}

function randInt(a, b = 0) {
	return Math.floor(Math.random() * Math.max(a, b)) + Math.min(a, b);
}

function getRandomBuild() {
	//name, region, type, location, tier, masterwork, stats
	const monumenta_equipment = require("./data/monumenta_equipment.json");
	
	let id_helmet = monumenta_equipment.types.indexOf("Helmet");
	let id_chestplate = monumenta_equipment.types.indexOf("Chestplate");
	let id_leggings = monumenta_equipment.types.indexOf("Leggings");
	let id_boots = monumenta_equipment.types.indexOf("Boots");
	let ids_mainhand = ["Axe","Pickaxe","Mainhand Sword","Trident","Mainhand","Snowball","Shovel","Mainhand Shield","Scythe","Bow","Crossbow","Wand"];
	let ids_ranged = ["Bow","Crossbow","Snowball"];
	for (let i in ids_mainhand) ids_mainhand[i] = monumenta_equipment.types.indexOf(ids_mainhand[i]);
	let ids_offhand = ["Offhand","Offhand Shield","Offhand Sword"];
	for (let i in ids_offhand) ids_offhand[i] = monumenta_equipment.types.indexOf(ids_offhand[i]);
	
	let region = randInt(1,3);
	let region_desc = monumenta_equipment.regions[region];
	
	let meme = ["build", "build", "build", "build", "build", "build", "disaster", "travesty", "experiment", "meme", "mishap", "handicap", "challenge"][randInt(13)];
	
	let helmets = monumenta_equipment.items.filter(x => x[2] === id_helmet && x[1] === region);
	let chestplates = monumenta_equipment.items.filter(x => x[2] === id_chestplate && x[1] === region);
	let leggings = monumenta_equipment.items.filter(x => x[2] === id_leggings && x[1] === region);
	let boots = monumenta_equipment.items.filter(x => x[2] === id_boots && x[1] === region);
	let mainhands = monumenta_equipment.items.filter(x => x[1] === region && ids_mainhand.includes(x[2]));
	let offhands = monumenta_equipment.items.filter(x => x[1] === region && ids_offhand.includes(x[2]));
	
	let main = mainhands[randInt(mainhands.length)];
	let main_desc = monumenta_equipment.types[main[2]];
	let off = offhands[randInt(offhands.length)];
	let off_desc = monumenta_equipment.types[off[2]];
	let build_desc = "Melee";
	if (main_desc === "Mainhand Sword" && off_desc === "Offhand Sword") build_desc = "Rogue";
	if (main_desc === "Wand") build_desc = "Mage";
	if (main_desc === "Scythe") build_desc = "Warlock";
	if (ids_ranged.includes(main_desc) || (main_desc === "Trident" && main[6][monumenta_equipment.stats.indexOf("throw_rate_base")] > 0)) build_desc = "Ranged";
	console.log("Your", region_desc, build_desc, meme, "is:");
	console.log(helmets[randInt(helmets.length)][0] + "/" + chestplates[randInt(chestplates.length)][0]+ "/" + leggings[randInt(leggings.length)][0] + "/" + boots[randInt(boots.length)][0]);
	console.log(main[0] + "/" + off[0]);
}

let parameters = process.argv.slice(3);
if (process.argv.length >= 3) {
	let actions = ["update", "random"];
	let action;
	let search;
	//wow this is lazy
	try {
		action = process.argv[2] = process.argv[2].trim().toLowerCase();
		if (debug) console.log(process.argv);
	} catch (e) {}
	switch (action) {
		case "update":
			update();
			updateHarder();
			csv();
			break;
		case "update2":
			updateHarder();
			break;
		case "csv":
			csv();
			break;
		case "random":
			getRandomBuild();
			break;
		default:
			console.log("Unsupported action:", action);
			console.log("consider the following:",actions);
	}
}