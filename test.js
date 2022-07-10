const data = require("./data/items.json");
const length_data = data.length;
const slots = ["head", "chest", "legs", "feet", "offhand", "mainhand"];

//console.log(JSON.stringify(data[0], null, "  "));

let filter = {};

filter.Valley = x => filterBy(x, "region", "valley");
filter.Isles = x => filterBy(x, "region", "isles");

filter.Helmets = x => filterBy(x, "slot", "head");
filter.Chestplates = x => filterBy(x, "slot", "chest");
filter.Leggings = x => filterBy(x, "slot", "legs");
filter.Boots = x => filterBy(x, "slot", "feet");

filter.Mainhands = x => filterBy(x, "slot", "mainhand");
filter.Wands = x => filterBy(x, "enchantments", "Magic Wand");
filter.Ranged = x => filterBy(x, "slot", "mainhand") && (filterBy(x, "attributes", "Throw Rate") || filterBy(x, "attributes", "Projectile Speed")) && !filterBy(x, "enchantments", "Riptide");
filter.Melee = x => filterBy(x, "slot", "mainhand") && !((filterBy(x, "attributes", "Throw Rate") || filterBy(x, "attributes", "Projectile Speed")) && !filterBy(x, "enchantments", "Riptide"));
filter.Mainhand_Swords = x => filterBy(x, "slot", "mainhand") && x.meta.type.toLowerCase().includes("sword");

filter.Offhands = x => filterBy(x, "slot", "offhand");
filter.Offhand_Swords = x => filterBy(x, "slot", "offhand") && x.meta.type.toLowerCase().includes("sword");
filter.Offhand_Shields = x => filterBy(x, "slot", "offhand") && x.meta.type === "Shield";
filter.Offhand_Not_Shield = x => filterBy(x, "slot", "offhand") && x.meta.type !== "Shield";

const cache_names = {};

function indexOfName(name) {
	if (cache_names[name]) return cache_names[name];
	
	for (let i = 0; i < data.length; i++) {
		if (data[i].plain.display.Name === name) {
			cache_names[name] = i;
			return i;
		}
	}
}

function getItem(name) {
	return data[indexOfName(name)];
}

function randInt(a, b = 0) {
	return Math.floor(Math.random() * Math.max(a, b)) + Math.min(a, b);
}

function getAttribute(item, attribute) {
	let attributes = item.Monumenta.Stock.Attributes;
	let results = [];
	let L = attributes.length;
	for (let i = 0; i < L; i++) {
		if (attributes[i].AttributeName === attribute) {
			results.push([attributes[i].Amount, attributes[i].Operation]);
		}
	}
	//TODO support returning multiple values here, elsewhere
	return results[0];
}

function getEnchantment(item, enchantment) {
	let enchantments = Object.keys(item.Monumenta.Stock.Enchantments);
	let L = enchantments.length;
	for (let i = 0; i < L; i++) {
		if (enchantments[i] === enchantment) {
			return [item.Monumenta.Stock.Enchantments[enchantments[i]].Level, enchantments[i]];
		}		
	}
	return null;
}

function filterBy(item, category, content) {
	//console.log(item.plain.display.Name, category, content);
	category = category.toLowerCase();
	switch (category) {
		case "tier": return (item.Monumenta.Tier === content);
		case "region": return (item.Monumenta.Region === content);
		case "slot": return (item.meta.slot === content);
		case "type": return (item.meta.type === content);
		case "name": return (item.plain.display.Name.toLowerCase().includes(content.toLowerCase()));
		case "enchantments": return item.Monumenta.Stock.Enchantments.hasOwnProperty(content);
		case "location": return item.Monumenta.Location.toLowerCase() === content.toLowerCase();
		case "attributes": 
			let attributes = item.Monumenta.Stock.Attributes;
			let L = attributes.length;
			for (let j = 0; j < L; j++) {
				if (attributes[j].AttributeName === content) return true;
			}
			return false;
		default: 
			throw("Unhanded `filterBy` category:", category);
	}
}

function maximizeListifier(results) {
		let sum = 0;
		for (let i = 0; i < slots.length; i++) {
			let slot = results.filter((x) => {return x[0] === slots[i];});
			let choice = slot.sort((a,b) => { return b[2][0] - a[2][0];});
			choice = choice.filter((x) => { return x[2][0] === choice[0][2][0]});
			console.log(choice);
			sum += choice.length > 0 ? choice[0][2][0] : 0;
		}
		console.log(sum,"\n");	
}

function maximizeProperty(which, stat, mainhand = false, region = "all", filter = null) {
	let results = [];
	let items = which === "Attribute" ? data.filter(x => filterBy(x, "Attributes", stat)) : data.filter(x => filterBy(x, "Enchantments", stat));
	if (filter !== null) items = items.filter(filter);
	if (!mainhand) items = items.filter(x => !filterBy(x, "slot", "mainhand"));
	
	//console.log(results.length, results, which, stat);
	
	let L = items.length;
	for (let i = 0; i < items.length; i++) {
		results.push([items[i].meta.slot, items[i].Monumenta.Region, which === "Attribute" ? getAttribute(items[i], stat) : getEnchantment(items[i], stat), items[i].plain.display.Name]);
	}
	results = results.sort((a, b) => { return a[0] < b[0] ? 1 : -1;} );
	//console.log(results);
	
	if (region === "isles" || region === "all") {
		console.log(stat,"| region 2 |", mainhand ? "with" : "no", "mainhand");
		maximizeListifier(results);
	}
	
	if (region === "valley" || region === "all") {
		console.log(stat,"| region 1 |", mainhand ? "with" : "no", "mainhand");
		results = results.filter((x) => { return x[1] === "valley"; });
		maximizeListifier(results);
	}
}

function maximizeAttribute(attribute, mainhand = false, region = "all", filter = null) {
	maximizeProperty("Attribute", attribute, mainhand, region, filter);
}
function maximizeEnchantment(enchantment, mainhand = false, region = "all", filter = null) {
	maximizeProperty("Enchantment", enchantment, mainhand, region, filter);
}

function listProperty(which, stat, mainhand = false, region = "all", filter = null) {
	let results = [];
	let items = which === "Attribute" ? data.filter(x => filterBy(x, "Attributes", stat)) : data.filter(x => filterBy(x, "Enchantments", stat));
	if (!mainhand) items = items.filter(x => !filterBy(x, "slot", "mainhand"));
	if (region === "valley") items = items.filter(x => filterBy(x, "region", "valley"));
	if (filter !== null) items = items.filter(filter);
	let L = items.length;
	for (let i = 0; i < items.length; i++) {
		results.push([items[i].meta.slot, items[i].Monumenta.Region, which === "Attribute" ? getAttribute(items[i], stat) : getEnchantment(items[i], stat), items[i].plain.display.Name]);
	}
	results = results.sort((a, b) => { return a[0] < b[0] ? 1 : -1;} );
	console.log(results.length, results);
}

function listAttribute(attribute, mainhand = false, region = "all", filter = null) {
	listProperty("Attribute", attribute, mainhand, region, filter);
}
function listEnchantment(enchantment, mainhand = false, region = "all", filter = null) {
	listProperty("Enchantment", enchantment, mainhand, region, filter);
}

function getRandomBuild(region = randInt(2), mainhand = randInt(4)) {
	let equipped = {};
	
	let regioned = region ? data.filter(filter.Isles) : data.filter(filter.Valley);	
	//console.log(regioned);
	
	let helmets = regioned.filter(filter.Helmets);
	let chestplates = regioned.filter(filter.Chestplates);
	let leggings = regioned.filter(filter.Leggings);
	let boots = regioned.filter(filter.Boots);

	let mainhands = regioned.filter([filter.Wands, filter.Ranged, filter.Melee, filter.Mainhand_Swords][mainhand]);
	let offhands = regioned.filter([filter.Offhands, filter.Offhand_Not_Shield, filter.Offhands, filter.Offhand_Swords][mainhand]);

	equipped.Helmet = helmets[randInt(helmets.length)].plain.display.Name;
	equipped.Chestplate = chestplates[randInt(chestplates.length)].plain.display.Name;
	equipped.Leggings = leggings[randInt(leggings.length)].plain.display.Name;
	equipped.Boots = boots[randInt(boots.length)].plain.display.Name;
	equipped.Mainhand = mainhands[randInt(mainhands.length)].plain.display.Name;
	equipped.Offhand = offhands[randInt(offhands.length)].plain.display.Name;
	
	console.log("Random Build |", region ? "Isles" : "Valley","Items |",["Wand", "Ranged", "Melee", "Dual Sword"][mainhand], "build");
	console.log(equipped);
}

function printHelp() {
	console.log("Usage: node", module.filename.split("\\").slice(-1)[0]);
	console.log("\tname|tier|region|slot|type|enchantments|Attributes %");
	console.log("\tmaximize|list Attribute|Enchantment % [mainhand=false] [region=all] [filter=null]");
	console.log("\trandom [region=0-1] [weapon=0-3]");
	//console.log(process.argv);	
}

if (process.argv.length >= 3) {
	switch (process.argv[2].toLowerCase()) {
		case "name":
			console.log(JSON.stringify(getItem(process.argv[3]), null, "  ")); 
			break;
		case "tier": 
		case "region": 
		case "slot": 
		case "type": 
		case "enchantments": 
		case "attributes": 
		case "location":
			let results = [];
			
			//console.log(process.argv[2], process.argv[3]);
			let items = data.filter(x => filterBy(x, process.argv[2], process.argv[3]));
			let L = items.length;
			for (let i = 0; i < items.length; i++) {
				results.push(items[i].plain.display.Name);
			}
			console.log(results.length, results);
			break;
		case "random":
			if (process.argv.length >= 5) getRandomBuild(process.argv[3]|0, process.argv[4]|0);
			else if (process.argv.length >= 4) getRandomBuild(process.argv[3]|0);
			else getRandomBuild();
			break;
		case "maximize":
		{
			let parameters = process.argv.slice(3);
			maximizeProperty(...parameters);
			break;
		}
		case "list":
		{
			let parameters = process.argv.slice(3);
			listProperty(...parameters);
			break;
		}
		default:
			printHelp();
	}
	return;
} else printHelp();

getRandomBuild();