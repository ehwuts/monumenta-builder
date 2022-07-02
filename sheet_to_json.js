const path_data_raw = "data/raw/Monumenta Item Spreadsheet v2.2.0 - Item Backend Data.csv";

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
		let L = h.length;
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

function column(key) {
	return map(row[getIndexFromHeader(key)], key);
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
	//remove spreadsheet's indexing columns since the name collisions are problematic
	row.splice(-7);
	//remove the meta summary columns because same
	row.splice(9, 16);
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
	  }
	}
	/*
	item.plain.display.Name = column("Name");
	item.monumenta.Location = column("Location");
	item.monumenta.Region = column("Region");
	item.monumenta.Tier = column("Tier");
	item.type = column("Base Item");
	item.monumenta.Location = column("Location");
	*/
	
	//jk should pull name and slot assumption before bulk iteration
	item.plain.display.Name = column("Name");
	item.type = column("Base Item");
	//item.durability = getBaseItemDurability(item.type);
	
	let slot = null;
	let metatype = column("Type");
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
			case "Shield":  // this appears to only be Shield, a tier 0 shield with no stats
				return "offhand";
			case "Misc": 
			case "Consumable": 
				return null;
			case "Helmet":
				return "head";
			case "Chestplate": 
				return "chest";
			case "Leggings": 
				return "legs";
			case "Boots": 
				return "feet";
		}
	})(column("Type"));
	
	function addAttribute(item, attribute, operation, magnitude, slot) {
		if (operation !== "add" && "operation" !== "multiply") console.log("WARN - ",item,attribute,operation);
		item.Monumenta.Stock.Attributes.push({
			"Amount": magnitude,
			"Slot": slot,
			"AttributeName": attribute,
			"Operation": operation
		});		
	}
	function addEnchantment(item, enchantment, magnitude) {
		item.Monumenta.Stock.Enchantments[enchantment] = { "Level": magnitude };
	}
	
	let L = row.length;
	for (let i = 0; i < L; i++) {
		if (!headers[i]) continue;
		switch (headers[i].trim()) {
			"Name":	/* item.plain.display.Name = row[i]; */ break;
			"Region": item.monumenta.Region = row[i]; break;
			"Tier": item.monumenta.Tier = row[i]; break;
			"Type":
				// if wand generate magic wand prop else do nothing
				if (row[i] === "Wand") addEnchantment(item, "Magic Wand", 1);
				break;
			"Base Item": /* item.type = row[i]; */ break;
			"Location": item.monumenta.Location = row[i]; break;
			"Speed": addAttribute(item, "Speed", "add", row[i], slot); break;
			"Speed %": addAttribute(item, "Speed", "multiply", row[i], slot); break;
			"Base Attack Damage": addAttribute(item, "Attack Damage", "add", row[i], slot); break;
			"Base Attack Speed": addAttribute(item, "Attack Speed", "add", row[i], slot); break;
			"Attack Damage": addAttribute(item, "Attack Damage", "multiply", row[i], slot); break;
			"Attack Speed": addAttribute(item, "Attack Speed", "add", row[i], slot); break;
			"Attack Speed %": addAttribute(item, "Attack Speed", "multiply", row[i], slot); break;
			"Base Proj Damage": addAttribute(item, "Projectile Damage", "add", row[i], slot); break;
			"Base Proj Speed": addAttribute(item, "Projectile Speed", "multiply", row[i], slot); break;
			"Proj Damage": addAttribute(item, "Projectile Damage", "multiply", row[i], slot); break;
			"Proj Speed": addAttribute(item, "Projectile Speed", "multiply", row[i], slot); break;
			"Armor": addAttribute(item, "Armor", "add", row[i], slot); break; //todo?
			"Agility": addAttribute(item, "Agility", "add", row[i], slot); break; //todo?
			"Max Health": addAttribute(item, "Max Health", "add", row[i], slot); break;
			"Max Health %": addAttribute(item, "Max Health", "multiply", row[i], slot); break;
			"Base Spell Power": addAttribute(item, "Spell Power", "multiply", row[i], slot); break;
			"Magic Damage": addAttribute(item, "Magic Damage", "multiply", row[i], slot); break;
			"Knockback Res.": addAttribute(item, "Knockback Resistance", "add", row[i], slot); break;
			"Thorns": addAttribute(item, "Thorns Damage", "add", row[i], slot); break;
			"Thorns Damage": addAttribute(item, "Thorns Damage", "multiply", row[i], slot); break;
			"Base Throw Rate": addAttribute(item, "Throw Rate", "add", row[i], slot); break;add(item, , , row[i], slot); break;
			"Shielding": 
			"Inure": 
			"Steadfast": 
			"Evasion": 
			"Adaptability": 
			"Feather Falling": 
			"Life Drain": 
			"Sustenance": 
			"Adrenaline": 
			"Unbreakable": 
			"Unbreaking": 
			"Mending": 
			"Smite": 
			"Slayer": 
			"Duelist": 
			"Sweeping Edge": 
			"Decay": 
			"Hex Eater":
			"Chaotic":
			"Quake":
			"Sniper":
			"Point Blank":
			"Recoil":
			"Silk Touch":
			"Sapper":
			"Efficiency":
			"Arcane Thrust": 
			"Rage of the Keter": 
			"Protection of the Depths": 
			"Persistence": 
			"Ashes of Eternity": 
			"Abyssal": 
			"Gills": 
			"Respiration": 
			"Aqua Affinity": 
			"Depth Strider": 
			"Riptide": 
			"Inferno": 
			"Second Wind": 
			"Regicide": 
			"Aptitude": 
			"Retrieval": 
			"Intuition": 
			"Radiant": 
			"Darksight": 
			"Weightless": 
			"Two Handed": 
			"Triage": 
			"Soul Speed": 
			"Void Tether": 
			"Resurrection": 	
			"Ethereal": 		
			"Reflexes": 
			"Tempo": 
			"Bleeding":
			"Knockback":
			"Looting":
			"Punch":
			"Quick Charge":
			"Piercing":
			"Eruption":
			"Lure":
			"Multitool":
			"Fortune":
			"Poise": addEnchantment(item, headers[i].trim(), row[i]); break;
			"Melee Prot.": addEnchantment(item, "Melee Protection", row[i]); break;
			"Projectile Prot.": addEnchantment(item, "Projectile Protection", row[i]); break;
			"Magic Prot.": addEnchantment(item, "Magic Protection", row[i]); break;
			"Blast Prot.": addEnchantment(item, "Blast Protection", row[i]); break;
			"Fire Prot.": addEnchantment(item, "Fire Protection", row[i]); break;
			"Regen": addEnchantment(item, "Regeneration", row[i]); break;
			"Fire Aspect (M)": addEnchantment(item, , row[i]); break;
			"Ice Aspect (M)": addEnchantment(item, , row[i]); break;
			"Thunder Aspect (M)": addEnchantment(item, , row[i]); break;
			"Fire Aspect (P)": addEnchantment(item, , row[i]); break;
			"Ice Aspect (P)": addEnchantment(item, , row[i]); break;
			"Thunder Aspect (P)": addEnchantment(item, , row[i]); break;
			"Infinity (bow)": addEnchantment(item, , row[i]); break;
			"Multishot": addEnchantment(item, , row[i]); break;
			"Infinity (tool)": addEnchantment(item, , row[i]); break;
			
			"Corruption":
			"Vanishing":
			"Ineptitude":
			"Shrapnel":
			"Irreparability": 
			"Crippling": 
			"Anemia": addEnchantment(item, "Curse of " + headers[i].trim(), row[i]);
			default:
				console.log("Warning, unhandled property", row[i], "on", item.plain.display.Name);
		}
	}
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
		//results.push(row.slice(0,-7));
	})
	.on("end", process);
	
		
function process() {
	//prune rows with an empty item name column
	results = results.filter(x=>x[1]);	
	headers = results.shift();	
	
	let L = results.length;
	for (let i = 0; i < L; i++) {
		results[i] = itemify(results[i]);
	}
	
	fs.writeFileSync("data/items.json", JSON.stringify(results));
}