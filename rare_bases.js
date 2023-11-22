#!/usr/bin/env node
const fs = require("fs");
const monumenta_equipment = require("./data/monumenta_equipment.json");
//constants that should probably be in the data blob
const NAME = 0, REGION = 1, TYPE = 2, LOCATION = 3, TIER = 4, BASE_ITEM = 5, MASTERWORK = 6, STATS = 7;

let RARE = monumenta_equipment.tiers.indexOf("Rare");

let rares_by_base = {}
let rare_bases_by_region = {}
for (let x of monumenta_equipment.regions) rare_bases_by_region[x] = [];

for (let item of monumenta_equipment.items) {
	if (item[TIER] === RARE) {
		let base = monumenta_equipment.base_items[item[BASE_ITEM]];
		let region = monumenta_equipment.regions[item[REGION]];
		
		if (!rares_by_base[base]) rares_by_base[base] = [];
		rares_by_base[base].push(item[NAME]);
		
		if (!rare_bases_by_region[region].includes(base)) rare_bases_by_region[region].push(base);
	}
}

fs.writeFileSync("out/rares_by_base.json", JSON.stringify(rares_by_base, null, "\t"));
fs.writeFileSync("out/rare_bases_by_region.json", JSON.stringify(rare_bases_by_region, null, "\t"));