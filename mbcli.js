const data = require("./data/items.monumenta.json");
const util = require("./src/util.monumenta.js");


//console.log(JSON.stringify(data[0], null, "  "));


function maximizeListifier(results) {
		let sum = 0;
		for (let i = 0; i < util.slots.length; i++) {
			let slot = results.filter((x) => {return x[0] === util.slots[i];});
			let choice = slot.sort((a,b) => { return b[2][0] - a[2][0];});
			choice = choice.filter((x) => { return x[2][0] === choice[0][2][0]});
			console.log(choice);
			sum += choice.length > 0 ? choice[0][2][0] : 0;
		}
		console.log(sum,"\n");	
}

function maximizeProperty(which, stat, mainhand = false, region = "all", filter = null) {
	let results = [];
	which = which.toLowerCase()
	let items = which === "attribute" ? util.filterBy(data, "Attributes", stat) : util.filterBy(data, "Enchantments", stat);
	if (filter !== null) items = util.filterDataByMap(items, filter);
	if (!mainhand) items = items.filter(x => !util.filterByFilter(x, "slot", "mainhand"));
	
	console.log(results.length, results, which, stat);
	
	let L = items.length;
	for (let i = 0; i < items.length; i++) {
		results.push([items[i].meta.slot, items[i].Monumenta.Region, which === "attribute" ? util.getAttribute(items[i], stat) : util.getEnchantment(items[i], stat), items[i].plain.display.Name]);
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
	which = which.toLowerCase();
	let items = which === "attribute" ? util.filterBy(data, "Attributes", stat) : util.filterBy(data, "Enchantments", stat);
	if (!mainhand) items = items.filter(x => !util.filterByFilter(x, "slot", "mainhand"));
	if (region === "valley") items = util.filterBy(items, "region", "valley");
	if (filter !== null) items = util.filterDataByMap(items, filter);
	let L = items.length;
	for (let i = 0; i < items.length; i++) {
		results.push([items[i].meta.slot, items[i].Monumenta.Region, which === "attribute" ? getAttribute(items[i], stat) : getEnchantment(items[i], stat), items[i].plain.display.Name]);
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

function getRandomBuildCLI(region = util.randInt(2), mainhand = util.randInt(4)) {
	let build = util.getRandomBuild(data, region, mainhand);
	console.log("Random Build |", region ? "Isles" : "Valley","Items |",["Wand", "Ranged", "Melee", "Dual Sword"][mainhand], "build");
	console.log(build);
	return build;
}

function printHelp() {
	console.log("Usage: node", module.filename.split("\\").slice(-1)[0]);
	console.log("\tname|tier|region|slot|type|enchantments|Attributes %");
	console.log("\tmaximize|list Attribute|Enchantment % [mainhand=false] [region=all] [filter=null]");
	console.log("\trandom [region=0-1] [weapon=0-3]");
	//console.log(process.argv);	
}

if (process.argv.length >= 3) {
	switch (process.argv[2] = process.argv[2].toLowerCase()) {
		case "name":
			console.log(JSON.stringify(util.getItem(process.argv[3]), null, "  ")); 
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
			let items = util.filterBy(data, process.argv[2], process.argv[3]);
			if (process.argv[4]) {
				items = util.filterBy(items, "slot", process.argv[4]);
			}
			let L = items.length;
			for (let i = 0; i < items.length; i++) {
				if (process.argv[2] === "enchantments") {
					results.push([items[i].plain.display.Name, util.getEnchantment(items[i], process.argv[3])]);
				} else if (process.argv[2] === "attributes") {
					results.push([items[i].plain.display.Name, util.getAttribute(items[i], process.argv[3])]);
					
					let curses = util.getCursesShort(items[i]);
					if (curses) {
						results[results.length-1].push(curses);
					}
				} else {
					results.push(items[i].plain.display.Name);
				}
			}
			if (process.argv[2] === "attributes") {
				results = results.sort((a, b) => { return b[1][0] - a[1][0]});
			}
			console.log(results.length, results);
			break;
		case "random":
			if (process.argv.length >= 5) getRandomBuildCLI(process.argv[3]|0, process.argv[4]|0);
			else if (process.argv.length >= 4) getRandomBuildCLI(process.argv[3]|0);
			else getRandomBuildCLI();
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
} else {
	printHelp();
	console.log("\n");
	getRandomBuildCLI();
}

//console.log(data.filter(util.filterBy()));


function speed(region = 2, adrenaline = false, mainhand = true, depthstrider = true) {
	let items = util.filterBy(data, "Attributes", "Speed");
	if (adrenaline) items = data.filter((x) => util.filterByFilter(x, "Attributes", "Speed") || util.filterByFilter(x, "Enchantments", "Adrenaline"));
	if (!depthstrider) items = items.filter(x => !util.filterByFilter(x, "Enchantments", "Depth Strider"));
	if (!mainhand) items = items.filter(x => !util.filterByFilter(x, "slot", "mainhand"));
	if (region === 1) items = util.filterBy(items, "Region", "valley");
	//slots = ["head", "chest", "legs", "feet", "offhand", "mainhand"];
	
	let slots = [
		util.filterBy(items, "slot", "head"),
		util.filterBy(items, "slot", "chest"),
		util.filterBy(items, "slot", "legs"),
		util.filterBy(items, "slot", "feet"),
		util.filterBy(items, "slot", "offhand"),
		util.filterBy(items, "slot", "mainhand")
	];
	let slot_dicts = [
		{},
		{},
		{},
		{},
		{},
		{}
	];
	
	for (let k = 0; k < slots.length; k++) {
		if (slots[k].length < 1) continue;
	
		for (let i = 0; i < slots[k].length; i++) {
			let out = {
				"m" : 0.0,
				"a" : 0.0,
				"r" : 0.0,
				"name" : null
			}
			
			//console.log(util.getAttributes(slots[k][i], "Speed"));
			let speed = util.getAttributes(slots[k][i], "Speed");
			for (let j = 0; j < speed.length; j++) {
				if (speed[j][1] === "multiply") {
					out.m += speed[j][0];
				} else {
					out.a += speed[j][0] || 0;
				}
			}
			out.r = util.getEnchantment(slots[k][i], "Adrenaline") || 0;
			if (out.r) out.r = out.r[0];
			out.name = slots[k][i].plain.display.Name;
			let key = "" + out.m + "_" + out.a + "_" + out.r;
			
			if (slot_dicts[k][key]) {
				slot_dicts[k][key].push(out.name);
				slots[k][i] = {
					"m" : 0.0,
					"a" : 0.0,
					"r" : 0.0,
					"name" : null
				};
			} else {
				slot_dicts[k][key] = [out.name];
				slots[k][i] = out;
			}
			
			//if (out.r) console.log(out);
			
			
		}
		let max_speed_m = slots[k].sort((a,b) => {return b.m - a.m;})[0].m;
		//console.log(slots[k][0]);
		let max_speed_a = slots[k].sort((a,b) => {return b.a - a.a;})[0].a;
		let max_r = slots[k].sort((a,b) => {return b.r - a.r;})[0].r;
		//console.log(max_speed_m, max_speed_a, max_r);
		slots[k] = slots[k].filter(x => (max_speed_m !== 0 && x.m === max_speed_m) || (max_speed_a !== 0 && x.a === max_speed_a) || (max_r !== 0 && x.r === max_r) || (x.m && x.a) || (x.a && x.r) || (x.m && x.r));
		for (let i = 0; i < slots[k].length; i++) {
			let key = "" + slots[k][i].m + "_" + slots[k][i].a + "_" + slots[k][i].r;
			slots[k][i].name = slot_dicts[k][key];
			console.log(key, slots[k][i].name);
		}
		//console.log(slots[k]);
	}
	
	console.log(slots[0].length, slots[1].length, slots[2].length, slots[3].length, slots[4].length, slots[5].length);
	
	let builds = [];
	for (const h of slots[0]) {
		for (const c of slots[1]) {
			for (const l of slots[2]) {
				for (const f of slots[3]) {
					for (const o of slots[4]) {
						if (slots[5].length > 0)
						for (const m of slots[5]) {
							builds.push([(1 + h.m + c.m + l.m + f.m + o.m + m.m + (adrenaline ? 0.1 : 0) * (h.r + c.r + l.r + f.r + o.r + m.r)) * (1 +10* ( h.a + c.a + l.a + f.a + o.a + m.a)), [h.m + c.m + l.m + f.m + o.m + m.m, h.a + c.a + l.a + f.a + o.a + m.a, h.r + c.r + l.r + f.r + o.r + m.r], h.name, c.name, l.name, f.name, o.name, m.name]);
						}
						else builds.push([(1 + h.m + c.m + l.m + f.m + o.m + 0.1 * (h.r + c.r + l.r + f.r + o.r)) * (1 + 10* (h.a + c.a + l.a + f.a + o.a)), [h.m + c.m + l.m + f.m + o.m, h.a + c.a + l.a + f.a + o.a, h.r + c.r + l.r + f.r + o.r], h.name, c.name, l.name, f.name, o.name]);
					}
				}
			}
		}
	}
	//console.log(builds.length);
	builds.sort((a, b) => { return b[0] - a[0];});
	let max = builds[0][0];
	console.log(builds.filter(x => x[0] > max - 0.0001 || x < max + 0.0001), builds.filter(x => x[0] > max - 0.0001 || x < max + 0.0001).length);
}

//speed();