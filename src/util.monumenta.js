const data = require("../data/items.monumenta.json");
const misc = require("./misc.js");
const dataLength = data.length;
const slots = ["head", "chest", "legs", "feet", "offhand", "mainhand"];

const randInt = misc.randInt;

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


let filter = {};

filter.Valley = x => filterByFilter(x, "region", "valley");
filter.Isles = x => filterByFilter(x, "region", "isles");

filter.Helmets = x => filterByFilter(x, "slot", "head");
filter.Chestplates = x => filterByFilter(x, "slot", "chest");
filter.Leggings = x => filterByFilter(x, "slot", "legs");
filter.Boots = x => filterByFilter(x, "slot", "feet");

filter.Mainhands = x => filterByFilter(x, "slot", "mainhand");
filter.Wands = x => filterByFilter(x, "enchantments", "Magic Wand");
filter.Ranged = x => filterByFilter(x, "slot", "mainhand") && (filterByFilter(x, "attributes", "Throw Rate") || filterByFilter(x, "attributes", "Projectile Speed")) && !filterByFilter(x, "enchantments", "Riptide");
filter.Melee = x => filterByFilter(x, "slot", "mainhand") && !((filterByFilter(x, "attributes", "Throw Rate") || filterByFilter(x, "attributes", "Projectile Speed")) && !filterByFilter(x, "enchantments", "Riptide"));
filter.Mainhand_Swords = x => filterByFilter(x, "slot", "mainhand") && x.meta.type.toLowerCase().includes("sword");

filter.Offhands = x => filterByFilter(x, "slot", "offhand");
filter.Offhand_Swords = x => filterByFilter(x, "slot", "offhand") && x.meta.type.toLowerCase().includes("sword");
filter.Offhand_Shields = x => filterByFilter(x, "slot", "offhand") && x.meta.type === "Shield";
filter.Offhand_Not_Shield = x => filterByFilter(x, "slot", "offhand") && x.meta.type !== "Shield";

function getAttribute(item, attribute) {
	try {
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
	} catch (e) {
		console.log(item);
	}
}
function getAttributes(item, attribute) {
	let attributes = item.Monumenta.Stock.Attributes;
	let results = [];
	let L = attributes.length;
	for (let i = 0; i < L; i++) {
		if (attributes[i].AttributeName === attribute) {
			results.push([attributes[i].Amount, attributes[i].Operation]);
		}
	}
	return results;
}

function getEnchantment(item, enchantment) {
	if (!item?.Monumenta?.Stock?.Enchantments) return null;
	
	let enchantments = Object.keys(item.Monumenta.Stock.Enchantments);
	let L = enchantments.length;
	for (let i = 0; i < L; i++) {
		if (enchantments[i] === enchantment) {
			return [item.Monumenta.Stock.Enchantments[enchantments[i]].Level, enchantments[i]];
		}		
	}
	return null;
}

function getEnchantments(item) {
	if (!item?.Monumenta?.Stock?.Enchantments) return null;
	
	let result = [];
	let enchantments = Object.keys(item.Monumenta.Stock.Enchantments);
	let L = enchantments.length;
	for (let i = 0; i < L; i++) {
		result.push([enchantments[i], item.Monumenta.Stock.Enchantments[enchantments[i]].Level]);
	}
	return result;
}

function filterBy(data, category, content) {
	return data.filter((x) => { return filterByFilter(x, category, content); });
}

function filterByFilter(item, category, content) {
	try {
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
	} catch (e) {
		console.log(e, item?.plain?.display?.Name, category, content);
	}
}

function getCurses(item) {
	let result = getEnchantments(item);
	if (result) {
		result = result.filter((x) => x[0].includes("Curse") || x[0] === "Two Handed");
	}
	
	return result.length > 0 ? result : null;
}
function getCursesShort(item) {
	let result = getCurses(item);
	if (result) {
		for (let i = 0; i < result.length; i++) {
			result[i] = result[i][0].replace("Curse of ", "") + " " + result[i][1];
		}
	}
	
	return result;
}

function filterDataByMap(data, filters) {
	if (typeof filters === "string") filters = JSON.parse(filters);
	
	let keys = Object.keys(filters);
	for (let i = keys.length - 1; i >= 0; i--) {
		data = filterBy(data, keys[i], filters[keys[i]]);
	}
	
	return data;
}

function getRandomBuild(data, region = randInt(2), mainhand = randInt(4)) {
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
	
	return equipped;
}


module.exports = { randInt, slots, data, dataLength, cache_names, indexOfName, getItem, filter, getAttribute, getAttributes, getEnchantment, getEnchantments, getCurses, getCursesShort, filterBy, filterByFilter, filterDataByMap, getRandomBuild };