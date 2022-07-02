const path_data_raw = "./data/raw/Chiinox_ - Item Backend Data.csv";

const csv = require("csv-parser");
const fs = require("fs");

var results = [];
var headers;

//these aren't super accurate due to the dataset sorry
var mappings = {
	"Region": {
		"Isles" : "isles",
		"Valley" : "valley"		
	},
	"Tier": {
		'Epic': "epic",
		'Artifact': "artifact",
		'Uncommon': "uncommon",
		'Rare': "rare",
		'Unique': "unique",
		'Patron': "patron",
		'Event': "event",
		'Tier 5': "5",
		'Tier 4': "4",
		'Tier 3': "3",
		'Tier 2': "2",
		'Tier 1': "1",
		'Tier 0': "0"
	},
	"Location": {
	  'Isles Delves': "delves",
	  'Hekawt': "lich",
	  'Eldrask': "frostgiant",
	  'Depths': "depths",
	  'Remorse': "remorse",
	  'Mist': "mist",
	  'Horseman': "horseman",
	  'Rush': "rush",
	  'Delves': "delves",
	  'Carnival': "carnival",
	  'Docks': "docks",
	  'TOV': "treasure",
	  'Forum': "forum",
	  'Shifting': "shifting",
	  'Teal': "teal",
	  'Purple': "purple",
	  'Cyan': "cyan",
	  'Light Gray': "lightgray",
	  'Gray': "gray",
	  'Pink': "pink",
	  'Lime': "lime",
	  'Isles Casino': "casino2",
	  'Isles Overworld': "overworld2",
	  'Celsian Isles': null,
	  'Valley Delves': "delves",
	  'Armory': "royal",
	  'Kaul': "kaul",
	  'Azacor': "Azacor",
	  'Verdant': "verdant",
	  'Sanctum': "sanctum",
	  'Corridors': "ephemeral",
	  'Reverie': "reverie",
	  'Lowtide Smugler': "lowtide",
	  'Willows': "willows",
	  'Yellow': "yellow",
	  'Light Blue': "lightblue",
	  'Magenta': "magenta",
	  'Orange': "orange",
	  'White': "white",
	  'Labs': "labs",
	  'Valley Casino': "casino1",
	  'Valley Overworld': "overworld1",
	  "King's Valley": null		
	}
};

let indices = {};

function getIndexFromHeader(h) {
	if (indices[h]) return indices[h];
	
	function findIndex(k) {
		let L = headers.length;
		for (let i = 0; i < L; i++) {
			if (headers[i] === k) return i;
		}
		return -1;
	}
	
	return indices[h] = findIndex(h);
}

function map(key, map) {
	if (mappings[map]&&mappings[map][key]) return mappings[map][key];
	else return "Unknown Value";
}

function getBaseItem(item) {
	throw (new Error("NotYetImplemented"));
	/*
	Material	Helmet	Chestplate	Leggings	Boots
Turtle Shell	275	N/A	N/A	N/A
Leather	55	80	75	65
Golden	77	112	105	91
Chainmail	165	240	225	195
Iron	165	240	225	195
Diamond	363	528	495	429
Netherite	407	592	555	481

Materials
Gold: 32 uses
Wood: 59 uses
Stone: 131 uses
Iron: 250 uses
Diamond: 1561 uses
Netherite: 2031 uses
Specific tools
Fishing rod: 64 uses ‌[Java Edition only] or 384 uses ‌‌[Bedrock Edition only]
Flint and steel: 64 uses
Carrot on a stick: 25 uses
Shears: 238 uses
Shield: 336 uses
Bow: 384 uses
Trident: 250 uses
Elytra: 432 uses
Crossbow: 465 uses ‌[Java Edition only] or 464 uses ‌[Bedrock Edition only]
Warped Fungus on a Stick: 100 uses
Sparkler ‌[Bedrock and Education editions only] : 100 uses
Glow Stick ‌[Bedrock and Education editions only] : 100 uses
	*/
	switch (item) {
		 case "Shield": return "shield";
		 case 'Leather Helmet': return "leather_helmet";
		 case 'Leather Chestplate': return "leather_chestplate";
		 case 'Leather Leggings': return "leather_leggings";
		 case 'Leather Boots': return "leather_boots";
		 case 'Golden Helmet': return "golden_helmet";
		 case 'Golden Chestplate': "golden_chestplate";
		 case 'Golden Leggings': return 105;
		 case 'Golden Boots': return 91;
		 case 'Chainmail Helmet': return 165;
		 case 'Chainmail Chestplate': return 240;
		 case 'Chainmail Leggings': return 225;
		 case 'Chainmail Boots': return 195;
		 case 'Iron Helmet': return ;
		 case 'Iron Chestplate': return ;
		 case 'Iron Leggings': return ;
		 case 'Iron Boots': return ;
		 case 'Iron Axe': return ;
		 case 'Golden Hoe': return ;
		 case 'Diamond Sword': return ;
		 case "Crossbow": return ;
		 case "Bow": return ;
		 case 'Iron Hoe': return ;
		 case 'Iron Sword': return ;
		 case 'Stone Sword': return ;
		 case 'Iron Pickaxe': return ;
		 case 'Wooden Sword': return ;
		 case "Trident": return ;
		 case 'Diamond Boots': return ;
		 case 'Golden Pickaxe': return ;
		 case 'Flint and Steel': return ;
		 case 'Stone Hoe': return ;
		 case 'Golden Axe': return ;
		 case 'Totem of Undying': return ;
		 case 'Golden Sword': return ;
		 case 'Turtle Helmet': return ;
		 case 'Wooden Axe': return ;
		 case 'Stone Axe': return ;
		 case 'Stone Pickaxe': return ;
		 case 'Wooden Pickaxe': return ;
		 case 'Iron Axe/Iron Shovel': return ; //why
		 case "Shears": return ;
		 case 'Wooden Hoe': return ;
		 case 'Diamond Axe': return ;
		 case 'Fishing Rod': return ;
		 case 'Iron Shovel': return ;
		 case 'Golden Shovel': return ;
		 case 'Wooden Shovel': return ;
		 case 'Iron Pickaxe / Iron Axe / Iron Shovel': return ; //why
		 case 'Stone Shovel': return ;
		 case 'Offhand Shield': return 336; //pain
		default: return -1;
	}
}

function itemify(row) {	
	//console.log(row);
	
	let item = {
	  "Monumenta": {
		"Tier": null,
		"Region": null,
		"Stock": {
		  "Enchantments": {},
		  "Attributes": []
		},
		"Location": null
	  },
	  "plain": {
		"display": {
		  "Name": null
		}
	  },
	  "meta": {
		  "type": null,
		  "slot": null
	  }
	}
	//console.log(item);
	/*
	item.plain.display.Name = column("Name");
	item.Monumenta.Location = column("Location");
	item.Monumenta.Region = column("Region");
	item.Monumenta.Tier = column("Tier");
	item.type = column("Base Item");
	item.Monumenta.Location = column("Location");
	*/
	
	//jk should pull name and slot assumption before bulk iteration
	//item.durability = getBaseItemDurability(item.type);
	
	let slot = null;
	slot = ((meta) => {
		switch (meta) {
			case "Wand":
			case "Mainhand":
			case "Axe":
			case "Scythe": 
			case "Mainhand Sword":
			case "Crossbow":
			case "Bow":
			case "Pickaxe":
			case "Throwable":
			case "Trident":
			case "Shovel":
			case "Sword": //this appears to only be Luck of the Draw, a twohanded mainhand sword
				return "mainhand";
			case "Offhand Shield": 
			case "Offhand Sword": 
			case "Offhand":
			case "Shield":  // this appears to only be Shield, a tier 2 shield with no stats
				return "offhand";
			case "Helmet":
				return "head";
			case "Chestplate": 
				return "chest";
			case "Leggings": 
				return "legs";
			case "Boots": 
				return "feet";
			case "Misc": 
			case "Consumable": 
				return null;
			default:
				return null;
		}
	})(row[getIndexFromHeader("Type")]);
	item.meta.slot = slot;
	
	const regex_percent = /^[+\-]?\d+(?:\.\d+)?%$/;
	
	function addAttribute(item, attribute, operation, magnitude, slot) {
		//convert the relative percentage strings into magnitudes so that Number can parse them without turning into NaN
		if (typeof magnitude !== "number") {
			if (magnitude.match(regex_percent)) {
				magnitude = Number(magnitude.slice(0,-1))/100;
			} else magnitude = Number(magnitude);
		}
		
		if (operation !== "add" && operation !== "multiply") {
			console.log("WARN - ",item,attribute,operation);
		}
		let attr = {
			"Amount": magnitude,
			"Slot": slot,
			"AttributeName": attribute,
			"Operation": operation
		};
		//console.log(attr);
		item.Monumenta.Stock.Attributes.push(attr);		
	}
	function addEnchantment(item, enchantment, magnitude) {
		//convert the relative percentage strings into magnitudes so that Number can parse them without turning into NaN
		if (typeof magnitude !== "number") {
			if (magnitude.match(regex_percent)) {
				magnitude = Number(magnitude.slice(0,-1))/100;
			} else magnitude = Number(magnitude);
		}
		
		item.Monumenta.Stock.Enchantments[enchantment] = { "Level": magnitude };
	}

	
	let L = row.length;
	for (let i = 0; i < L; i++) {
		if (!headers[i]) continue;
		if (!row[i]) continue;
		
		switch (headers[i].trim()) {
			case "Name":	item.plain.display.Name = row[i]; break;
			case "Region": item.Monumenta.Region = map(row[i], "Region"); break;
			case "Tier": item.Monumenta.Tier = map(row[i], "Tier"); break;
			case "Type":
				// if wand generate magic wand prop else do nothing
				if (row[i] === "Wand") addEnchantment(item, "Magic Wand", 1);
				break;
			case "Base Item": item.meta.type = row[i]; break;
			case "Location": item.Monumenta.Location = map(row[i], "Location"); break;
			case "Speed": addAttribute(item, "Speed", "add", row[i], slot); break;
			case "Speed %": addAttribute(item, "Speed", "multiply", row[i], slot); break;
			case "Base Attack Damage": addAttribute(item, "Attack Damage", "add", row[i], slot); break;
			case "Base Attack Speed": addAttribute(item, "Attack Speed", "add", row[i], slot); break;
			case "Attack Damage": addAttribute(item, "Attack Damage", "multiply", row[i], slot); break;
			case "Attack Speed": addAttribute(item, "Attack Speed", "add", row[i], slot); break;
			case "Attack Speed %": addAttribute(item, "Attack Speed", "multiply", row[i], slot); break;
			case "Base Proj Damage": addAttribute(item, "Projectile Damage", "add", row[i], slot); break;
			case "Base Proj Speed": addAttribute(item, "Projectile Speed", "multiply", row[i], slot); break;
			case "Proj Damage": addAttribute(item, "Projectile Damage", "multiply", row[i], slot); break;
			case "Proj Speed": addAttribute(item, "Projectile Speed", "multiply", row[i], slot); break;
			case "Armor": addAttribute(item, "Armor", "add", row[i], slot); break; //todo?
			case "Agility": addAttribute(item, "Agility", "add", row[i], slot); break; //todo?
			case "Max Health": addAttribute(item, "Max Health", "add", row[i], slot); break;
			case "Max Health %": addAttribute(item, "Max Health", "multiply", row[i], slot); break;
			case "Base Spell Power": addAttribute(item, "Spell Power", "multiply", row[i], slot); break;
			case "Magic Damage": addAttribute(item, "Magic Damage", "multiply", row[i], slot); break;
			case "Knockback Res.": addAttribute(item, "Knockback Resistance", "add", row[i], slot); break;
			case "Thorns": addAttribute(item, "Thorns Damage", "add", row[i], slot); break;
			case "Thorns Damage": addAttribute(item, "Thorns Damage", "multiply", row[i], slot); break;
			case "Base Throw Rate": addAttribute(item, "Throw Rate", "add", row[i], slot);
			case "Shielding": 
			case "Inure": 
			case "Steadfast": 
			case "Evasion": 
			case "Adaptability": 
			case "Feather Falling": 
			case "Life Drain": 
			case "Sustenance": 
			case "Adrenaline": 
			case "Unbreakable": 
			case "Unbreaking": 
			case "Mending": 
			case "Smite": 
			case "Slayer": 
			case "Duelist": 
			case "Sweeping Edge": 
			case "Decay": 
			case "Hex Eater":
			case "Chaotic":
			case "Quake":
			case "Sniper":
			case "Point Blank":
			case "Recoil":
			case "Silk Touch":
			case "Sapper":
			case "Efficiency":
			case "Arcane Thrust": 
			case "Rage of the Keter": 
			case "Protection of the Depths": 
			case "Persistence": 
			case "Ashes of Eternity": 
			case "Abyssal": 
			case "Gills": 
			case "Respiration": 
			case "Aqua Affinity": 
			case "Depth Strider": 
			case "Riptide": 
			case "Inferno": 
			case "Second Wind": 
			case "Regicide": 
			case "Aptitude": 
			case "Retrieval": 
			case "Intuition": 
			case "Radiant": 
			case "Darksight": 
			case "Weightless": 
			case "Two Handed": 
			case "Triage": 
			case "Soul Speed": 
			case "Void Tether": 
			case "Resurrection": 	
			case "Ethereal": 		
			case "Reflexes": 
			case "Tempo": 
			case "Bleeding":
			case "Knockback":
			case "Looting":
			case "Punch":
			case "Quick Charge":
			case "Piercing":
			case "Eruption":
			case "Lure":
			case "Multitool":
			case "Fortune":
			case "Poise": addEnchantment(item, headers[i].trim(), row[i]); break;
			case "Melee Prot.": addEnchantment(item, "Melee Protection", row[i]); break;
			case "Projectile Prot.": addEnchantment(item, "Projectile Protection", row[i]); break;
			case "Magic Prot.": addEnchantment(item, "Magic Protection", row[i]); break;
			case "Blast Prot.": addEnchantment(item, "Blast Protection", row[i]); break;
			case "Fire Prot.": addEnchantment(item, "Fire Protection", row[i]); break;
			case "Regen": addEnchantment(item, "Regeneration", row[i]); break;
			case "Fire Aspect (M)": addEnchantment(item, "Fire Aspect", row[i]); break;
			case "Ice Aspect (M)": addEnchantment(item, "Ice Aspect", row[i]); break;
			case "Thunder Aspect (M)": addEnchantment(item, "Thunder Aspect", row[i]); break;
			case "Fire Aspect (P)": addEnchantment(item, "Fire Aspect", row[i]); break;
			case "Ice Aspect (P)": addEnchantment(item, "Ice Aspect", row[i]); break;
			case "Thunder Aspect (P)": addEnchantment(item, "Thunder Aspect", row[i]); break;
			case "Infinity (bow)": addEnchantment(item, "Infinity", row[i]); break;
			case "Multishot": addEnchantment(item, "Multishot", row[i]); break;
			case "Infinity (tool)": addEnchantment(item, "Infinity", row[i]); break;
			
			case "Corruption":
			case "Vanishing":
			case "Ineptitude":
			case "Shrapnel":
			case "Irreparability": 
			case "Crippling": 
			case "Anemia": addEnchantment(item, "Curse of " + headers[i].trim(), row[i]); break;
			default:
				console.log("Warning, unhandled property", headers[i], "on", item.plain.display.Name);
		}
	}
	if (slot !== null) {
		if (slot !== "mainhand") addEnchantment(item, "OffhandMainhandDisable", 1);
		if (slot !== "offhand") addEnchantment(item, "MainhandOffhandDisable", 1);
	}
	//console.log(item);
	return item;
}

fs.createReadStream(path_data_raw)
	.pipe(csv({headers:false, columns: true}))
	.on("data", (data) => {
		//convert from objects keyed with column numbers to arrays
		let row = [];
		let length = Object.keys(data).length;
		for (let i = 0; i < length; i++) {
			row[i] = data[i];
		}
		//remove spreadsheet's indexing columns since the name collisions are problematic
		row.splice(-7);
		//remove the meta summary columns because same
		row.splice(9, 16);
		results.push(row);
	})
	.on("end", process);
	
		
function process() {
	//prune rows with an empty item name column
	//console.log(results.length, results);
	results = results.filter(x=>x[1]);	
	headers = results.shift();	
	
	let L = results.length;
	for (let i = 0; i < L; i++) {
		results[i] = itemify(results[i]);
	}
	
	//fs.writeFileSync("data/items.json", JSON.stringify(results, null, "\t"));
	fs.writeFileSync("data/items.json", JSON.stringify(results));
}