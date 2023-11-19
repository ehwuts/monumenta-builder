#!/usr/bin/ node

const levenshtein = require('js-levenshtein');

const data = require("./data/raw/MonumentaAPI - Items.json");
const misc = require("./src/misc.js");

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
			NYI();break;
			break;
		case "maximize":
		{
			NYI();break;
			//list buildslots for maximum total of a single effect
			//maximizeProperty(...parameters);
			break;
		}
		case "list":
		{
			NYI();break;
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
	getRandomBuildCLI();
}

function NYI() { console.log("not yet implemented"); }

function printHelp() {
	console.log("Usage: node", module.filename.split("\\").slice(-1)[0]);
	console.log("\tname|tier|region|type|stats|location");
	console.log("\tmaximize|list Attribute|Enchantment % [mainhand=false] [region=all] [filter=null]");
	console.log("\trandom [region=0-1] [weapon=0-3]");
	//console.log(process.argv);	
}