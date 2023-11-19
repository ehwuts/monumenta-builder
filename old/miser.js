#!/usr/bin node

const levenshtein = require('js-levenshtein');

const data = require("./data/raw/MonumentaAPI - Items.json");
const misc = require("./src/misc.js");

//let spam = "";

//prune our item set for convenience
{
	let keys = Object.keys(data);
	let junk = ["Misc", "Consumable", "Charm"];
	let tiered = ["Tier 0", "Tier 1", "Tier 2", "Tier 3", "Tier 4", "Tier 5"]
	for (let i = 0; i < keys.length; i++) {
		//break;
		let v = data[keys[i]];
		if (!v) continue;
		//if (v.tier && tiered.includes(v.tier)) spam += keys[i] +"```"+ v.tier +"```"+ v.region +"\n";
		//delete non-equips and key-likes and terth artifacts auuuugh
		//if (tiered.includes(v.))
		if ((junk.includes(v.type) || (v.lore && v.lore.includes("drop it in the dungeon")) || (v.location === "Arena of Terth" && v.tier === "Artifact"))) {
			delete data[keys[i]];
			continue;
		}
		
		if (v.stats.speed_flat) {
			data[keys[i]].stats.speed_flat *= 1000;
		}
		
		//delete lower masterworks
		for (let j = 0; j < keys.length; j++) {
			if (i === j) continue;
			if (data[keys[j]] && v.name === data[keys[j]].name) {
				if (v.masterwork > data[keys[j]].masterwork) {
					delete data[keys[j]];
				} else {
					delete data[keys[i]];
				}				
			}			
		}
	}
}

//console.log(spam);

const dataNames = Object.keys(data);
const dataLength = dataNames.length;


/*
//
{
	for (name of dataNames) {
		if (name.includes("-") && !name.includes("-3")) {
			//console.log(name);
		}
	}
}
*/

const maps = {
	"region": {},
	"tier": {},
	"type": {},
	"base_item": {},
	"location": {},
	"stats": {}
}

for (const name of dataNames) {
	for (const prop of ["region", "tier", "type", "base_item", "location"]) {
		if (!maps[prop][data[name][prop]]) maps[prop][data[name][prop]] = [];
		maps[prop][data[name][prop]].push(name);		
	}
	for (const prop of Object.keys(data[name].stats)) {
		if (!maps.stats[prop]) maps.stats[prop] = [];
		maps.stats[prop].push(name);
	}
}

//console.log(Object.keys(maps.stats).length, Object.keys(maps.stats).join(" "))
//console.log(Object.keys(maps.tier).length, Object.keys(maps.tier))

function print_from_name(name) {
	console.log(JSON.stringify(data[name], null, "  ")); 
}

function printHelp() {
	console.log("Usage: node", module.filename.split("\\").slice(-1)[0]);
	console.log("\tname|tier|region|type|stats|location");
	console.log("\tmaximize|list Attribute|Enchantment % [mainhand=false] [region=all] [filter=null]");
	console.log("\trandom [region] [weapon]");
	//console.log(process.argv);	
}

let parameters = process.argv.slice(3);
if (process.argv.length >= 3) {
	let action;
	let search;
	//wow this is lazy
	try {
		action = process.argv[2] = process.argv[2].trim().toLowerCase();
	} catch (e) {}
	try {
		search = parameters[0].trim().toLowerCase();
	} catch (e) {}
	
	//console.log(action, search, parameters);
	
	switch (action) {
		case "name":
			//list item by name
			if (!search) {
				printHelp();
			} else {
				let result;
				let closestResult;
				let closestDistance = 9000;
				//console.log(search);
				
				for (const name of dataNames) {
					let s = name.toLowerCase();
					//console.log(s);
					if (search === s) {
						result = name;
						break;
					}
					
					let d = levenshtein(search, s);
					if (d < closestDistance) {
						closestResult = name;
						closestDistance = d;
					}
					//console.log(d);
				}
				result = result || closestResult;
				//console.log(result);
				print_from_name(result);
			}
			break;
		case "tier": 
		case "region": 
		case "type": 
		case "location":
//		case "slot": 
			//list item names by tag
			if (!search) {
				printHelp();
			} else {
				for (const list in maps[action]) {
					if (list.toLowerCase() === search) {
						console.log(maps[action][list]);
						return;
					}
				}
				console.log(Object.keys(maps[action]));
			}
			break;
		case "stats":
			//list item names by tag
			//TODO if enchant/attribute also list magnitude and curses if any
			if (!search) {
				printHelp();
			} else {
				for (const list in maps[action]) {
					if (list.toLowerCase() === search) {
						console.log(maps[action][list]);
						return;
					}
				}
				console.log(Object.keys(maps[action]).join(", "));
			}
			break;
		case "random":
			//print a random likely-cursed build
			if (process.argv.length >= 5) getRandomBuild(process.argv[3]|0, process.argv[4]|0);
			else if (process.argv.length >= 4) getRandomBuild(process.argv[3]|0);
			else getRandomBuild();
			break;
		case "maximize":
		{
			//list buildslots for maximum total of a single effect
			//maximizeProperty(...parameters);
			break;
		}
		case "list":
		{
			//list all items with a specified property
			//listProperty(...parameters);
			break;
		}
		default:
			printHelp();
	}
} else {
	printHelp();
	console.log("\n");
	//getRandomBuildCLI();
}

function melee() {
	let time_start = new Date();
	let armor = dataNames.slice().filter((x) => {
		let a = data[x];
		let d = data[x].stats;
		return ((a.region === "Valley" || a.region === "Ring") && (d.attack_damage_percent || d.attack_speed_percent || d.attack_speed_flat || d.regicide) && !a.original_item);
	});
	let mainhands = dataNames.slice().filter((x) => {
		return ((maps.region.Ring.includes(x)) && maps.stats.attack_damage_base.includes(x));
	});
	//attack_damage_percent
	//attack_speed_percent
	//attack_speed_flat
	
	let helmets = armor.filter((x) => { return (data[x].type === "Helmet"); });
	let chestplates = armor.filter((x) => { return (data[x].type === "Chestplate"); });
	let leggings = armor.filter((x) => { return (data[x].type === "Leggings"); });
	let boots = armor.filter((x) => { return (data[x].type === "Boots"); });
	let offhands = armor.filter((x) => { return (data[x].type === "Offhand" || data[x].type === "Offhand Shield" || data[x].type === "Offhand Sword"); });
	
	//console.log("H C L B O");
	//console.log(helmets.length, chestplates.length, leggings.length, boots.length, offhands.length, mainhands.length);	
	for (let list of [helmets, chestplates, leggings, boots, offhands]) {
		for (let i = 0; i < list.length; i++) {
			let name = list[i];
			let s = data[name].stats;
			let damageP = s.attack_damage_percent || 0;
			let speedP = s.attack_speed_percent || 0;
			let speedF = s.attack_speed_flat || 0;
			let regi = s.regicide || 0;
			for (let j = list.length - 1; j > i; j--) {
				let name2 = list[j];
				
				if (data[name].name === data[name2].name) {
					if (data[name].masterwork > data[name2].masterwork) {
						list.splice(j, 1);
					} else {
						list.splice(i, 1);
						i--;
						break;						
					}
				}
				
				let s2 = data[name2].stats;
				let damageP2 = s2.attack_damage_percent || 0;
				let speedP2 = s2.attack_speed_percent || 0;
				let speedF2 = s2.attack_speed_flat || 0;
				let regi2 = s2.regicide || 0;
				if ((!damageP || damageP < damageP2) && (!speedP || speedP < speedP2) && (!speedF || speedF < speedF2) && (!regi || regi < regi2)) {
					list.splice(i, 1);
					i--;
					break;
				} 
				if ((!damageP2 || damageP2 < damageP) && (!speedP2 || speedP2 < speedP) && (!speedF2 || speedF2 < speedF) && (!regi2 || regi2 < regi)) {
					list.splice(j, 1);
				}
			}
		}		
	}
	//console.log(helmets.length, chestplates.length, leggings.length, boots.length, offhands.length, mainhands.length);
	
	let swords = mainhands.filter((x) => { return (data[x].type === "Sword" || data[x].type === "Sword <M>"); });
	let axes = mainhands.filter((x) => { return (data[x].type === "Axe"); });
	let others = mainhands.filter((x) => { return (!swords.includes(x) && !axes.includes(x)); });
	//console.log("S A O");
	//console.log(swords.length, axes.length, others.length);
	for (let list of [swords, axes, others]) {
		for (let i = 0; i < list.length; i++) {
			let name = list[i];
			let s = data[list[i]].stats;
			let damageP = s.attack_damage_base || 0;
			let speedP = s.attack_speed_base || 0;
			let speedF = Math.max((s.smite || 0) * 2, (s.slayer || 0) * 2 + (s.thunder_aspect || 0), (s.duelist || 0) * 2 + (s.thunder_aspect || 0));
			let regi = s.regicide || 0;
			for (let j = list.length - 1; j > i; j--) {
				let name2 = list[j];
				
				if (data[name].name === data[name2].name) {
					if (data[name].masterwork > data[name2].masterwork) {
						list.splice(j, 1);
					} else {
						list.splice(i, 1);
						i--;
						break;						
					}
				}
				
				let s2 = data[list[j]].stats;
				let damageP2 = s2.attack_damage_base || 0;
				let speedP2 = s2.attack_speed_base || 0;
				let speedF2 = Math.max((s2.smite || 0) * 2, (s2.slayer || 0) * 2 + (s2.thunder_aspect || 0), (s2.duelist || 0) * 2 + (s2.thunder_aspect || 0));
				let regi2 = s2.regicide || 0;
				if ((!damageP || damageP < damageP2) && (!speedP || speedP < speedP2) && (!speedF || speedF < speedF2) && (!regi || regi < regi2)) {
					list.splice(i, 1);
					i--;
					break;
				} 
				if ((!damageP2 || damageP2 < damageP) && (!speedP2 || speedP2 < speedP) && (!speedF2 || speedF2 < speedF) && (!regi2 || regi2 < regi)) {
					list.splice(j, 1);
				}
			}
		}		
	}
	//console.log(swords.length, axes.length, others.length);
	
	//for (const name of axes) console.log(JSON.stringify(data[name], null, "  "));
	
	//for (let list of [helmets, chestplates, leggings, boots, offhands]) { for (const name of list) console.log(JSON.stringify(data[name], null, "  ")); break;};
	
	console.log("target class dps speed build");
	
	const boss = true;
	
	/*
	 * scout_melee 
	 * - agility 2 - +1 damage after crit multi and before attack damage percent multi, 20% attack speed
	 * - swift cuts 2* - x1.35 damage on consecutive hits, x1.35 damage on every third consecutive hit
	 * - eagle eye 2 - 35% vuln 10/24s
	 */
	/*
	 * rogue
	 * - by my blade 2
	 * - skirmisher 2
	 * - advancing shadows 2*
	 * - dagger throw 2*
	*/
	/*
	 * warrior
	 * brute force 2*
	 * weapon mastery 2*
	*/
	
/*
attack speed bonuses
scout - agility 10%/20% passive
rogue - by my blade 20%/40% 4s duration 10s cooldown

typical damage order of operations
((base + bane) * gear % damage * base damage multis * crit multi + flat damage bonuses) * total damage multis * vuln
vuln effect is halved against bosses
most damage multis are multiplicative
// TODO verify ooo for thunder aspect

vuln
scout - eagle eye - 20%/35% 10s duration 24s cooldown
rogue - dagger throw - 20%/40% enhance +10% 10s duration 12s cooldown

base damage multis
rogue - passive - 30% vs elites, 15% vs bosses
enchant - regicide - 10% vs elites, 5% vs bosses

flat damage bonuses
rogue - skirmisher flat 1/2
scout - agility flat 1

total damage multis
rogue - advancing shadows 30%/40% 5s duration 20s cooldown
rogue - advancing shadows enhance 20% (separate multi)
rogue - skirmisher 15%
scout - swift cuts 20%/35%
scout - swift cuts enhance 35% every third hit
scout - agility2 10%

*/	
	for (const victim of ["generalist", "golem", "zombie", "enderman"])
	for (const skills of ["classless", "scout_melee", "rogue", "warrior"]) {
		let the_build = [];
		let the_builds_dps = 0;
		let the_builds_damage = 0;
		let the_builds_attack_speed = 0;
		let the_builds_attack_speed_real = 0;
		for (let weapons of [swords, axes, others]) {
			
			for (const name_weapon of weapons) {
				let weapon = data[name_weapon].stats;
				
				for (const name_helm of helmets) {
					let helm = data[name_helm].stats;
					for (const name_chest of chestplates) {
						let chest = data[name_chest].stats;
						for (const name_legs of leggings) {
							let legs = data[name_legs].stats;
							for (const name_feet of boots) {
								let feet = data[name_feet].stats;
								for (const name_offhand of offhands) {
									let offhand = data[name_offhand].stats;
									if ((skills === "rogue" || skills === "assassin") && data[name_offhand].type !== "Offhand Sword") continue;
									
									let attr = {"attack_damage_percent":0, "attack_speed_percent":0, "attack_speed_flat":0, "regicide":0};
									let twohands = data[name_weapon].stats.two_handed || false;
									for (let gear of (twohands?[helm, chest, legs, feet]:[helm, chest, legs, feet, offhand])) {
										
										for (const x in attr) {
											attr[x] += gear[x] || 0;
										}
									}
									
									if (skills === "scout_melee") attr.attack_speed_percent += 20;
									//if (skills === "rogue") attr.attack_speed_percent += 40;
									
									let rate_base = (weapon.attack_speed_base + attr.attack_speed_flat) * (1 + attr.attack_speed_percent / 100);
									let rate_spam = Math.min(2, (weapon.attack_speed_base + attr.attack_speed_flat) * (1 + attr.attack_speed_percent / 100));
									let rate_crit = Math.min(1.667, rate_spam);
									
									let damage_base = (weapon.attack_damage_base
													  + (victim === "zombie" ? (weapon.smite || 0) * 2 : 0)
													  + (victim === "enderman" ? (weapon.slayer || 0) * 2 : 0)
													  + (victim === "golem" ? (weapon.duelist || 0) * 2 + (weapon.thunder_aspect || 0) : 0));
									damage_base *= (1 + attr.attack_damage_percent / 100);
									if (boss) damage_base *= (1 + 0.05 * attr.regicide);
									
									let damage_crit = damage_base * 1.5;
									if (skills === "scout_melee") {
										//damage_crit *= 1.779;
										
										damage_crit = (damage_crit + 1) //agility 1
													* (1 + 0.35) //swift cuts 2
													* (1 + 0.11666666666666666666666666666667) //swift cuts enhance 1/3 hits averaged
													* (1 + 0.1) //agility 2
													* (1 + (boss ? 0.07291666666666666666666666666667 : 0.14583333333333333333333333333333)) // eagle eye 2 10s / 24s averaged TODO check boss status cleansing
													//* (1 + (boss ? 0.175 : 0.35)) // eagle eye 2 burst dps
													;
										
									}
									if (skills === "rogue") {
										//if (boss) damage_crit *= 1.15; //passive;
										//if (boss) damage_crit *= 1.93415625;
										//else damage_crit *= 1.681875;
										
										damage_crit = (damage_crit + 2) //skirmisher 2
										            * (1 + 0.15) //skirmisher 2
													//* (1 + 0.4)*(1 + 0.2) //advancing shadows 2 + enhance
													* (1 + ((1 + 0.4)*(1 + 0.2) - 1) * (5 / 20)) //advancing shadows 2 + enhance average uptime
													//* (1 + (boss ? 0.25 : 0.5)) //dagger throw 2 enhanced
													* (1 + (boss ? 0.25 : 0.5) / 1.2) //dagger throw 2 enhanced average uptime
										
									}
									if (skills === "warrior") {
										let good = false;
										if (data[name_weapon].type === "Axe") {
											damage_crit += 4; // weapons mastery 1
											good = true;
										}
										if (data[name_weapon].type.startsWith("Sword")) {
											damage_crit += 1; //weapon mastery 1
											good = true;
										}
										if (good) damage_crit *= 1.1; //weapon mastery 2
										let brute = 0.1 * damage_crit + 2; //brute force 2
										damage_crit += brute;
										damage_crit += brute * 0.75; //brute force enhance
									}
									
									//currently hard assuming crit since spam clicking at 2 attack speed would require roughly 25% damage as non-crit-scaling
									//swift cuts 1's 1 damage aint it
									let dps_crit = damage_crit * rate_crit;
									
									if (dps_crit > the_builds_dps) {
										the_builds_dps = dps_crit;
										the_builds_damage = damage_crit;
										the_build = [name_helm, name_chest, name_legs, name_feet, name_offhand, name_weapon];
										the_builds_attack_speed = rate_crit;
										the_builds_attack_speed_real = rate_base;
									}
								}
							}
						}
					}
				}
			}
			if (skills === "rogue" || skills === "assassin") break;
		}
		
		let buildstring = [];
		for (const name of the_build) {
			buildstring.push(data[name].name + (data[name].masterwork && data[name.masterwork] < 3 ? "*" : ""));
		}
		console.log(victim, skills, the_builds_dps, the_builds_damage, the_builds_attack_speed, the_builds_attack_speed_real, "\n", buildstring.join("/"));
	}
	let time_end = new Date();
	console.log(time_end - time_start, "ms");
}

//currently strict matches 
function brute_force_search(region = "Ring", armor_stats = [], mainhand_types_ = null, mainhand_stats = [], score_func) {
	let time_start = new Date();
	
	let attributes = armor_stats || [];
	let items = dataNames.slice().filter((x) => {
		let a = data[x];
		if (a.original_item) return false;
		
		let d = data[x].stats;
		for (let attribute of attributes) {
			if (d[attribute] && d[attribute] > 0) return true;
		}
		return false;
	});
	items = items.filter((x) => { return data[x].region === region || data[x].region === "Valley"});
	
	//inconveniently long list
	let mainhand_types = ["Mainhand", "Mainhand Sword", "Axe", "Scythe", "Crossbow", "Bow", "Pickaxe", "Trident", "Throwable", "Sword", "Shovel", "Wand", "Snowball", "Mainhand Shield"];	
	if (mainhand_types_) mainhand_types = mainhand_types_;
	let mainhands = dataNames.filter((x) => { return (mainhand_types.includes(data[x].type)) && (data[x].region === region || data[x].region === "Valley"); });
	if (mainhand_stats) {
		mainhands = mainhands.filter((x) => { 
			let d = data[x].stats;
			for (let attribute of mainhand_stats) {
				if (d[attribute] && d[attribute] > 0) return true;
			}
			return false;
		});
	}
	
	let helmets = items.filter((x) => { return (data[x].type === "Helmet"); });
	let chestplates = items.filter((x) => { return (data[x].type === "Chestplate"); });
	let leggings = items.filter((x) => { return (data[x].type === "Leggings"); });
	let boots = items.filter((x) => { return (data[x].type === "Boots"); });
	let offhands = items.filter((x) => { return (data[x].type === "Offhand" || data[x].type === "Offhand Shield" || data[x].type === "Offhand Sword"); });
	
	//initial pool lengths
	//console.log(chestplates.length, leggings.length, boots.length, offhands.length, mainhands.length);
	
	let mapping = [];
	function key_merge(slot, attr) {
		let map = {};
		
		for (let item of slot) {
			let k = [];
			let stats = data[item].stats;
			for (let attribute of attr) {
				k.push(stats[attribute] || 0);
			}
			let key = k.join("_");
			if (map[key]) {
				if (typeof map[key] === "string") map[key] = [map[key]];
				map[key].push(item);
				//mapping[i][key] += "/" + item;
			} else {
				//mapping[i][key] = [item];
				map[key] = item;
			}
		}
		
		return map;
	}
	for (let slot of [helmets, chestplates, leggings, boots, offhands]) {
		//console.log(slot);
		mapping.push(key_merge(slot, attributes));
	}
	//console.log(mainhands);
	mapping.push(key_merge(mainhands, mainhand_stats));
	//pool lengths after unique stat combination key compression
	//console.log(Object.keys(mapping[0]).length, Object.keys(mapping[1]).length, Object.keys(mapping[2]).length, Object.keys(mapping[3]).length, Object.keys(mapping[4]).length, Object.keys(mapping[5]).length);
	//console.log(mapping);
	
	//passthrough to prune search spaces
	//discards an item if at least one of its relevant stats is worse and the rest are worse or equal
	for (let slot of mapping) {
		let keys = Object.keys(slot);
		for (let i = 0; i < keys.length; i++) {
			if (!slot[keys[i]]) continue;
			let P1 = keys[i].split("_");
			for (let x in P1) P1[x] |= 0;
			
			for (let j = keys.length - 1; j > i; j--) {
				if (!slot[keys[j]]) continue;
				let P2 = keys[j].split("_");
				
				let better = 0;
				let worse = 0;
				for (let x in P2) {
					P2[x] |= 0;
					
					if (P1[x] > P2[x]) better++;
					else if (P2[x] > P1[x]) worse++;
				}
				if (better && !worse) {
					//console.log(keys[i],"beats",keys[j]);
					delete slot[keys[j]];
					keys.splice(j, 1);				
				} else if (worse && !better) {
					//console.log(keys[j],"beats",keys[i]);
					delete slot[keys[i]];
					keys.splice(i, 1);
					i--;
					break;					
				}
			}
		}
	}
	//pool lengths after pruning non-bis-contenders
	//console.log(Object.keys(mapping[0]).length, Object.keys(mapping[1]).length, Object.keys(mapping[2]).length, Object.keys(mapping[3]).length, Object.keys(mapping[4]).length, Object.keys(mapping[5]).length);
	//console.log(mapping);
	
	let best_score = 0;
	let best_build = [];
	
	for (const key_helm in mapping[0]) {
		for (const key_chest in mapping[1]) {
			for (const key_legs in mapping[2]) {
				for (const key_feet in mapping[3]) {
					for (const key_offhand in mapping[4]) {
						for (const key_mainhand in mapping[5]) {
							let attr = new Array(attributes.length).fill(0);
							let build = [mapping[0][key_helm], mapping[1][key_chest], mapping[2][key_legs], mapping[3][key_feet], mapping[4][key_offhand], mapping[5][key_mainhand]];
							
							for (key of [key_helm, key_chest, key_legs, key_feet, key_offhand]) {
								let stats = key.split("_");
								for (let i = stats.length - 1; i >= 0; i--) {
									attr[i] += stats[i] | 0;
								}
							}
							
							let score = score_func(attr, key_mainhand, ...build);
							if (score > best_score) {
								best_score = score;
								best_build = [attr, ...build];
							}
						}
					}
				}
			}
		}
	}
	console.log(best_score, best_build);
	let time_end = Date.now();
	console.log(time_end - time_start, "ms");
}

function hunting_companion(region = "Ring") {
	function score_func(attr, key_mainhand, helms, chests, legs, feet, offhands, mainhands) {
		//return (key_mainhand * (100 + attr[0]) * (100 + attr[1]));
		return ((key_mainhand * 1) * (1 + attr[0] / 100) * 1.25 * 0.4 + 1) * (1 + attr[1] / 100) * 1.1;
	}
	
	brute_force_search(region, ["projectile_damage_percent", "attack_damage_percent"], ["Crossbow", "Bow", "Trident", "Throwable"], ["projectile_damage_base"], score_func)
}

function speed(region = "Ring") {
	function score_func(attr, key_mainhand, helms, chests, legs, feet, offhands, mainhands) {
		let hand = key_mainhand.split("_");
		attr[0] += hand[0]|0;
		attr[1] += hand[1]|0;
		
		return (100 + attr[0])/100 * (100 + attr[1])/100;
	}
	
	brute_force_search(region, ["speed_flat", "speed_percent"], 0, ["speed_flat", "speed_percent"], score_func)
}

function deeps(region = "Ring") {
	function score_func(attr, key_mainhand, helms, chests, legs, feet, offhands, mainhands) {
		let hand = key_mainhand.split("_");
		attr[0] += hand[0]|0;
		attr[1] += hand[1]|0;
		
		return (100 + attr[0])/100 * (100 + attr[1])/100;
	}
	
	brute_force_search(region, ["speed_flat", "speed_percent"], 0, ["speed_flat", "speed_percent"], score_func);	
}

function ehp(region = "Ring") {
	function score_func(attr, key_mainhand, helms, chests, legs, feet, offhands, mainhands) {
		let magic_protection, max_health_flat, magic_damage_percent, fire_protection, agility, blast_protection, melee_protection, knockback_resistance_flat, armor, regeneration, projectile_protection, reflexes, poise, ethereal, tempo, steadfast, projectile_fragility, curse_of_anemia, second_wind, cloaked, shielding, max_health_percent, inure, evasion, worldly_protection, magic_fragility, stamina, fire_fragility, guard, melee_fragility, armor_percent, agility_percent;
		[magic_protection, max_health_flat, magic_damage_percent, fire_protection, agility, blast_protection, melee_protection, knockback_resistance_flat, armor, regeneration, projectile_protection, reflexes, poise, ethereal, tempo, steadfast, projectile_fragility, curse_of_anemia, second_wind, cloaked, shielding, max_health_percent, inure, evasion, worldly_protection, magic_fragility, stamina, fire_fragility, guard, melee_fragility, armor_percent, agility_percent] = attr;
		
		
	}
	//function brute_force_search(region = "Ring", armor_stats = [], mainhand_types_ = null, mainhand_stats = [], score_func)
	brute_force_search(region, ["magic_protection", "max_health_flat", "magic_damage_percent", "fire_protection", "agility", "blast_protection", "melee_protection", "knockback_resistance_flat", "armor", "regeneration", "projectile_protection", "reflexes", "poise", "ethereal", "tempo", "steadfast", "projectile_fragility", "curse_of_anemia", "second_wind", "cloaked", "shielding", "max_health_percent", "inure", "evasion", "worldly_protection", "magic_fragility", "stamina", "fire_fragility", "guard", "melee_fragility", "armor_percent", "agility_percent"], null, null, score_func);
}

function getRandomBuild(region, mainhand) {
	let regions = ["Valley", "Isles", "Ring"];
	let mainhands = ["Wand", "Ranged", "Melee", "Dual Sword", "Scythe"];
	let mainhand_types = ["Mainhand", "Mainhand Sword", "Axe", "Scythe", "Crossbow", "Bow", "Pickaxe", "Trident", "Throwable", "Sword", "Shovel", "Wand", "Snowball", "Mainhand Shield"];
	let ranged_types = ["Crossbow", "Bow", "Throwable", "Trident", "Snowball"];
	if (!regions.includes(region)) {
		if (typeof region !== "undefined") console.log("Warning: Recognized regions are ", region, ". Choosing one at random.");
		region = regions[misc.randInt(regions.length)];
	}
	if (!mainhands.includes(mainhand)) {
		if (typeof mainhand !== "undefined") console.log("Warning: Recognized mainhands are ", mainhands, ". Choosing one at random.");
		mainhand = mainhands[misc.randInt(mainhands.length)];
	}
	let build = [];
	
	//console.log(Object.keys(maps.type));
	//let filtered_region = maps.region[region];
	
	let helmets = maps.type.Helmet.filter((x) => { return data[x].region === region; });
	let chestplates = maps.type.Chestplate.filter((x) => { return data[x].region === region; });
	let leggings = maps.type.Leggings.filter((x) => { return data[x].region === region; });
	let boots = maps.type.Boots.filter((x) => { return data[x].region === region; });
	
	let mainhands_ = [];
	switch (mainhand) {
		case "Wand":
			mainhands_ = maps.type.Wand.filter((x) => { return data[x].region === region; });
			break;
		case "Ranged":
			mainhands_ = [].concat(maps.type.Crossbow, maps.type.Bow, maps.type.Throwable, maps.type.Snowball, maps.type.Trident).filter((x) => { return x && data[x].region === region && (data[x].type !== "Trident" || data[x].stats.throw_rate_base); });
			break;
		case "Melee":
			mainhands_ = [].concat(maps.type["Mainhand Sword"], maps.type.Mainhand, maps.type.Axe, maps.type["Mainhand Shield"], maps.type.Trident, ).filter((x) => { return x && data[x].region === region && (data[x].type !== "Trident" || data[x].stats.attack_damage_base); });
			break;
		case "Dual Sword":
			mainhands_ = maps.type["Mainhand Sword"].filter((x) => { return data[x].region === region; });
			break;
		case "Scythe":
			mainhands_ = maps.type.Scythe.filter((x) => { return data[x].region === region; });
			break;
		default: console.log("Something broke in random build mainhand selection:", mainhand); return;
	}
	
	let offhands = [];
	if (mainhand === "Dual Sword") {
		offhands = maps.type["Offhand Sword"].filter((x) => { return data[x].region === region; });
	} else {
		offhands = [].concat(maps.type.Offhand, maps.type["Offhand Sword"], maps.type["Offhand Shield"]).filter((x) => { return x && data[x].region === region; });
	}
	
	build = [
		helmets[misc.randInt(helmets.length)],
		chestplates[misc.randInt(chestplates.length)],
		leggings[misc.randInt(leggings.length)],
		boots[misc.randInt(boots.length)],
		mainhands_[misc.randInt(mainhands_.length)],
		offhands[misc.randInt(offhands.length)]
	];
	
	
	console.log("Random Build |", region,"Items |", mainhand, "build");
	console.log(build);
	return build;
}

//melee();
//speed("Valley");
//console.log(Object.keys(maps.type));

//hunting_companion("Ring");

//speed("Ring");

//getRandomBuild();