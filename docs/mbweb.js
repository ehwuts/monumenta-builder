let stats = [];
let E = {};
let S = {};
let T = {};
const NAME = 0, REGION = 1, TYPE = 2, LOCATION = 3, TIER = 4, BASE_ITEM = 5, MASTERWORK = 6, STATS = 7;
let ids_mainhand, ids_melee, ids_offhand, ids_ranged;

let main, off, helm, chest, legs, feet;

let build = {
	"Helmet": undefined,
	"Chestplate": undefined,
	"Leggings": undefined,
	"Boots": undefined,
	"Offhand": undefined,
	"Mainhand": undefined
};

function floatToString(f, p = 2) {
	//return (f + ' ').substring(0, 4);
	if (f >= 0) {
		f += 0.00001;
	} else {
		f -= 0.00001;
	}
	return f.toFixed(p);
}
function randInt(a, b = 0) {
	return Math.floor(Math.random() * Math.max(a, b)) + Math.min(a, b);
}

function updateStats() {
	let result = "";
	
	if (build.Mainhand) stats = Array.from(build.Mainhand[STATS]);
	else stats = Array(stats.length).fill(0);
	for (let i = stats.length - 1; i >= 0; i--) {
		if (build.Offhand) stats[i] += build.Offhand[STATS][i];
		if (build.Helmet) stats[i] += build.Helmet[STATS][i];
		if (build.Chestplate) stats[i] += build.Chestplate[STATS][i];
		if (build.Leggings) stats[i] += build.Leggings[STATS][i];
		if (build.Boots) stats[i] += build.Boots[STATS][i];
	}	
	let region = E.region.value|0;
	if (region === 0) region = build.Mainhand ? build.Mainhand[REGION] : 2;
	let situational_cap = region === 1 ? 20 : 30;
	
	let melee_damage = stats[S.attack_damage_base] || 1;
	let melee_damage_eff = melee_damage * (1 + stats[S.attack_damage_percent] / 100);
	let melee_speed = (stats[S.attack_speed_base] || 4) + stats[S.attack_speed_flat];
	let melee_speed_eff = melee_speed * (1 + stats[S.attack_speed_percent] / 100);
	
	let proj_eff = stats[S.projectile_damage_base] * (1 + stats[S.projectile_damage_percent] / 100);
	let proj_speed_eff = stats[S.projectile_speed_base] * (1 + stats[S.projectile_speed_percent] / 100);
	let proj_rate = stats[S.throw_rate_base] * (1 + stats[S.throw_rate_percent] / 100);
	let proj_rate_eff = 1 / (0.8 + 1 / proj_rate);	
	if (build.Mainhand && build.Mainhand[TYPE] === T.Bow) proj_rate = proj_rate_eff = 1;
	if (build.Mainhand && build.Mainhand[TYPE] === T.Crossbow) {
		proj_rate = 1.25 - 0.25 * stats[S.quick_charge];
		proj_rate_eff = 1 / proj_rate;
	}
	
	let cdr  =  stats[S.aptitude] * 5 - stats[S.ineptitude] * 5;
	
	let health = (20 + stats[S.max_health_flat]) * (1 + stats[S.max_health_percent] / 100);
	if (E.second_wind.checked) health /= 2;
	let eff_heal = 1 + 0.1 * (stats[S.sustenance] - stats[S.curse_of_anemia]);
	let regen = (stats[S.regeneration] ? Math.sqrt(stats[S.regeneration])/3 : 0) * eff_heal;
	let speed = (0.1 + stats[S.speed_flat]) * (1 + stats[S.speed_percent]/100) * 10;
	let melee_prot = stats[S.melee_protection] + stats[S.melee_fragility];
	let proj_prot = stats[S.projectile_protection] + stats[S.projectile_fragility];
	let magic_prot = stats[S.magic_protection] + stats[S.magic_fragility];
	let blast_prot = stats[S.blast_protection];// + stats[S.blast_fragility];
	let fire_prot = stats[S.fire_protection] + stats[S.fire_protection];
	let fall_prot = stats[S.feather_falling];
	
	let armor = Math.max(0, stats[S.armor] * (1 + stats[S.armor_percent] / 100));
	let agility = Math.max(0, stats[S.agility] * (1 + stats[S.agility_percent] / 100));
	
	let situational_armor_mult = 0;
	let situational_agility_mult = 0;
	if (E.guard.checked) situational_armor_mult += 0.2 * stats[S.guard];
	if (E.shielding.checked) situational_armor_mult += 0.2 * stats[S.shielding];
	if (E.poise.checked) situational_armor_mult += 0.2 * stats[S.poise];
	if (E.inure.checked) situational_armor_mult += 0.2 * stats[S.inure];
	if (E.steadfast.checked) situational_armor_mult += 0.2 * stats[S.steadfast];
	if (E.ethereal.checked) situational_agility_mult += 0.2 * stats[S.ethereal];
	if (E.reflexes.checked) situational_agility_mult += 0.2 * stats[S.reflexes];
	if (E.evasion.checked) situational_agility_mult += 0.2 * stats[S.evasion];
	if (E.tempo.checked) situational_agility_mult += 0.2 * stats[S.tempo];
	if (E.cloaked.checked) situational_agility_mult += 0.2 * stats[S.cloaked];
	
	//things which make a build more "consistent" but make the ehp a lie
	//second wind and steadfast cant be simultaneous with poise
	//ethereal and tempo cant be simultaneous
	//shielding and evasion cant be simultaneous
	E.poise.parentElement.className = (E.poise.checked && (E.second_wind.checked || E.steadfast.checked)) ? "red" : "";
	E.second_wind.parentElement.className = (E.poise.checked && E.second_wind.checked) ? "red" : "";
	E.steadfast.parentElement.className = (E.poise.checked && E.steadfast.checked) ? "red" : "";
	if (E.ethereal.checked && E.tempo.checked) {
		E.ethereal.parentElement.className = "red";
		E.tempo.parentElement.className = "red";		
	} else {
		E.ethereal.parentElement.className = "";
		E.tempo.parentElement.className = "";
	}
	if (E.shielding.checked && E.evasion.checked) {
		E.shielding.parentElement.className = "red";
		E.evasion.parentElement.className = "red";		
	} else {
		E.shielding.parentElement.className = "";
		E.evasion.parentElement.className = "";	
	}
	
	if (stats[S.adaptability]) {
		if (armor > agility) armor += Math.min(armor, situational_cap) * (situational_armor_mult + situational_agility_mult);
		else agility += Math.min(agility, situational_cap) * (situational_armor_mult + situational_agility_mult);
	} else {
		//console.log(situational_armor_mult, situational_agility_mult);
		armor += Math.min(armor, situational_cap) * situational_armor_mult;
		agility += Math.min(agility, situational_cap) * situational_agility_mult;
	}
	
	let second_wind_multi = Math.pow(0.9, stats[S.second_wind]);
	
	let gdm = Math.pow(0.96, armor + agility - 0.5 * armor * agility / (armor + agility));
	if (E.second_wind.checked) gdm *= second_wind_multi;
	else gdm *= (.5 + .5 * second_wind_multi);
	let gdm_melee = gdm * Math.pow(0.96, 2 * melee_prot);
	let gdm_proj = gdm * Math.pow(0.96, 2 * proj_prot);
	let gdm_magic = gdm * Math.pow(0.96, 2 * magic_prot);
	let gdm_blast = gdm * Math.pow(0.96, 2 * blast_prot);
	let gdm_fire = gdm * Math.pow(0.96, 2 * fire_prot);
	let gdm_fall = gdm * Math.pow(0.96, 2 * fall_prot);
	
	let html = "";
	if (melee_damage_eff || stats[S.attack_damage_percent]) {
		if (stats[S.attack_damage_percent]) html += "" + stats[S.attack_damage_percent] + "% Damage<br>";
		html += "" + floatToString(melee_damage_eff) + " Damage<br>";
		html += "" + floatToString(melee_speed_eff) + " Rate<br>";
		html += "" + floatToString(melee_damage_eff * melee_speed_eff) + " DPS<br>";
		html += "<span title='Assumes vanilla jump height, which in practice caps attack speed at 1.67'>" + floatToString(melee_damage_eff * Math.min(melee_speed_eff, 1.67) * (stats[S.cumbersome] ? 1 : 1.5)) + " Crit DPS*</span>"; 
	}
	E.float_attack.innerHTML = html === "" ? html : "Melee<br>" + html;
	
	html = "";
	if (proj_eff || proj_speed_eff || proj_eff) {
		if (stats[S.projectile_damage_percent]) html += "" + stats[S.projectile_damage_percent] + "% Damage<br>";
		if (proj_eff) html += "" + floatToString(proj_eff) + " Damage<br>";
		if (stats[S.potion_damage_flat]) html += "+" + stats[S.potion_damage_flat] + " Potion Damage<br>";
		if (stats[S.potion_radius_flat]) html += "+" + 100 * (1 + stats[S.potion_radius_flat]) + "% Potion Radius<br>";
		if (proj_speed_eff) html += "" + proj_speed_eff + " Speed<br>";
		if (proj_rate) html += "" + proj_rate + " Fire Delay<br>";
		if (proj_rate_eff) html += "" + floatToString(proj_rate_eff) + " Fire Rate<br>";
		if (proj_eff) html += "" + floatToString(proj_eff * proj_rate_eff) + " DPS";
	}
	E.float_projectile.innerHTML = html === "" ? html : "Projectile<br>" + html;
	
	html = "";
	if (stats[S.spell_power_base] || stats[S.magic_damage_percent] || cdr) {
		if (stats[S.spell_power_base]) html += "" + (100 + stats[S.spell_power_base]) + "% Spell Power<br>";
		if (stats[S.magic_damage_percent]) html += "" + stats[S.magic_damage_percent] + "% Damage<br>";
		if (build.Mainhand[TYPE] === T.Wand) html += "" + floatToString(100 * (1 + stats[S.spell_power_base]/100) * (1 + stats[S.magic_damage_percent]/100)) + "% Spell Eff<br>";
		if (cdr) html += "" + (100 - cdr) + "% Cooldowns";
	}
	E.float_magic.innerHTML = html === "" ? html : "Magic<br>" + html;
	
	
	E.stats.innerHTML = "";
	for (let s of ["abyssal","ice_aspect","thorns_flat","decay","hex_eater","life_drain","first_strike","aqua_affinity","gills","depth_strider","trivium","curse_of_crippling","intuition","oinking","regicide","curse_of_corruption","inferno","adrenaline","unbreaking","mending","quake","smite","fire_aspect","duelist","efficiency","knockback","divine_aura","thunder_aspect","slayer","eruption","earth_aspect","fortune","sapper","unbreakable","curse_of_irreparability","retrieval","looting","material","chaotic","curse_of_vanishing",,"two_handed","sweeping_edge","point_blank","bleeding","riptide","wind_aspect","broomstick","baaing","weightless","silk_touch","resurrection","darksight","multitool","piercing","punch","thorns_percent","curse_of_shrapnel","multishot","lure","recoil","sniper","cumbersome","radiant","soul_speed","arcane_thrust","excavator","infinity",  "adaptability","guard","shielding","poise","inure","steadfast","second_wind","ethereal","reflexes","evasion","tempo","cloaked","starvation","triage","ashes_of_eternity","worldly_protection","respiration","curse_of_anemia","stamina"]) {
		if (stats[S[s]] && !["material", "unbreakable", "unbreaking", "curse_of_vanishing"].includes(s)) E.stats.innerHTML += s + ": " + stats[S[s]] + "<br>";
	}
	
	html = "";
	html += "" + floatToString(health) + " Health<br>";
	if (eff_heal !== 1) html += "" + floatToString(eff_heal * 100) + "% Heal Eff<br>";
	if (regen) html += "" + floatToString(regen) + " Regen<br>";
	if (regen) html += "" + floatToString(regen/health*100) + "%/s Regen<br>";
	if (armor) html += "" + floatToString(armor) + " Armor<br>";
	if (agility) html += "" + floatToString(agility) + " Agility<br>";
	if (stats[S.knockback_resistance_flat]) html += "" + floatToString(stats[S.knockback_resistance_flat]*10,0) + "% KBR<br>";
	if (speed != 1) html += "" + floatToString(speed*100) + "% Speed";
	E.float_misc.innerHTML = html === "" ? html : "Health and Misc<br>" + html;
	
	html = "Reduction<br>";
	html += "" + floatToString((1 - gdm_melee)*100) + "% Melee<br>";
	html += "" + floatToString((1 - gdm_proj)*100) + "% Projectile<br>";
	html += "" + floatToString((1 - gdm_magic)*100) + "% Magic<br>";
	html += "" + floatToString((1 - gdm_blast)*100) + "% Blast<br>";
	html += "" + floatToString((1 - gdm_fire)*100) + "% Fire<br>";
	html += "" + floatToString((1 - gdm_fall)*100) + "% Fall";
	
	E.float_resist.innerHTML = html;
	
	html = "EHP<br>";
	html += "" + floatToString(health/gdm_melee) + " Melee<br>";
	html += "" + floatToString(health/gdm_proj) + " Projectile<br>";
	html += "" + floatToString(health/gdm_magic) + " Magic<br>";
	html += "" + floatToString(health/gdm_blast) + " Blast<br>";
	html += "" + floatToString(health/gdm_fire) + " Fire<br>";
	html += "" + floatToString(health/gdm_fall) + " Fall";
	E.float_ehp.innerHTML = html;
}

function showBuild(desc = "") {
	updateStats();
	if (desc) E.blurb.innerText = desc;
}

function getItem(name) {
	if (name == name|0 && name >= 0 && name < monumenta_equipment.items.length) return monumenta_equipment.items[name];
	for (let i of monumenta_equipment.items) if (i[NAME].toLowerCase() === name) return i;
}

function setSlot(item, slot, redraw = false) {
	//console.log(item,slot,redraw);
	let e = typeof item === "string" ? getItem(item) : item;
	if (e[TYPE] === slot || (slot === T.Mainhand && ids_mainhand.includes(e[TYPE])) || (slot === T.Offhand && ids_offhand.includes(e[TYPE]))) {
		let t = monumenta_equipment.types[slot];
		build[t] = e;
		console.log("select_" + t);
		E["select_" + t].firstChild.innerText = e[NAME];
		if (redraw) showBuild();
	}
}

function getRandomBuild() {
	//name, region, type, location, tier, masterwork, stats
	
	let region = (E.region.value|0) === 0 ? randInt(1,3) : (E.region.value|0);
	let region_desc = monumenta_equipment.regions[region];
	let skipped_locations = [monumenta_equipment.locations.indexOf("Arena of Terth"),monumenta_equipment.locations.indexOf("Gallery of Fear")];
	
	let meme = ["build", "build", "build", "build", "build", "build", "disaster", "travesty", "experiment", "meme", "mishap", "handicap", "challenge"][randInt(13)];
	
	let helmets = monumenta_equipment.items.filter(x => x[TYPE] === T.Helmet && x[REGION] === region && !skipped_locations.includes(x[LOCATION]));
	let chestplates = monumenta_equipment.items.filter(x => x[TYPE] === T.Chestplate && x[REGION] === region && !skipped_locations.includes(x[LOCATION]));
	let leggings = monumenta_equipment.items.filter(x => x[TYPE] === T.Leggings && x[REGION] === region && !skipped_locations.includes(x[LOCATION]));
	let boots = monumenta_equipment.items.filter(x => x[TYPE] === T.Boots && x[REGION] === region && !skipped_locations.includes(x[LOCATION]));
	let mainhands = monumenta_equipment.items.filter(x => x[REGION] === region && ids_mainhand.includes(x[TYPE]) && !skipped_locations.includes(x[LOCATION]));
	let offhands = monumenta_equipment.items.filter(x => x[REGION] === region && ids_offhand.includes(x[TYPE]) && !skipped_locations.includes(x[LOCATION]));
	//console.log(mainhands);
	
	let archetype = E.archetype.value;
	if (archetype === "0") archetype = ["melee","sword","axe","rogue","warlock","mage","alchemist","ranged"][randInt(8)]
	switch (archetype) {
		case "rogue":
			offhands = offhands.filter(x => x => x[TYPE] === T["Offhand Sword"]);
		case "sword":
			mainhands = mainhands.filter(x => monumenta_equipment.base_items[x[BASE_ITEM]].includes("Sword"));
			break;
		case "axe":
			mainhands = mainhands.filter(x => x[TYPE] === T.Axe);
			break;
		case "warlock":
			mainhands = mainhands.filter(x => x[TYPE] === T.Scythe);
			break;
		case "mage":
			mainhands = mainhands.filter(x => x[TYPE] === T.Wand);
			break;
		case "alchemist":
			mainhands = mainhands.filter(x => x[STATS][S.alchemical_utensil]);
			break;
		case "ranged":
			mainhands = mainhands.filter(x => ([T.Bow, T.Crossbow].includes(x[TYPE]) || x[STATS][S.throw_rate_base] > 0));
			break;
		case "melee":
		default:
			
	}
	
	setSlot(mainhands[randInt(mainhands.length)], T.Mainhand);
	let main_desc = monumenta_equipment.types[build.Mainhand[TYPE]];
	setSlot(offhands[randInt(offhands.length)], T.Offhand);
	let off_desc = monumenta_equipment.types[build.Offhand[TYPE]];
	let build_desc = "Melee";
	if (main_desc === "Mainhand Sword" && off_desc === "Offhand Sword") build_desc = "Rogue";
	if (main_desc === "Wand") build_desc = "Mage";
	if (main_desc === "Scythe") build_desc = "Warlock";
	if (ids_ranged.includes(main_desc) || (main_desc === "Trident" && build.Mainhand[STATS][monumenta_equipment.stats.indexOf("throw_rate_base")] > 0)) build_desc = "Ranged";
	if (build.Mainhand[STATS][S.alchemical_utensil]) build_desc = "Alchemical";
	
	setSlot(helmets[randInt(helmets.length)], T.Helmet);
	setSlot(chestplates[randInt(chestplates.length)], T.Chestplate);
	setSlot(leggings[randInt(leggings.length)], T.Leggings);
	setSlot(boots[randInt(boots.length)], T.Boots);
	
	showBuild("Your " + region_desc + " " + build_desc + " " + meme + " is:");
}

function hoverOn(){}
function hoverOff(){}

function init() {
	document.getElementById("random").onclick = getRandomBuild;
	
	E.stats = (new Array(monumenta_equipment.stats.length)).fill(0);
	for (let x in monumenta_equipment.stats) S[monumenta_equipment.stats[x]] = x|0;
	for (let x in monumenta_equipment.types) T[monumenta_equipment.types[x]] = x|0;
	
	for (let x of ["blurb", "helm_name", "chest_name", "legs_name", "feet_name", "main_name", "off_name", "stats", "summary", "region", "archetype", "float_attack", "float_projectile", "float_magic", "float_misc", "float_resist", "float_ehp", "select_Helmet", "select_Mainhand", "select_Chestplate", "select_Leggings", "select_Boots", "select_Offhand"]) E[x] = document.getElementById(x);
	
	E.select_Helmet.onchange = () => { if (this.value !== "selected") setSlot(E.select_Helmet.value, T.Helmet, true) }
	E.select_Chestplate.onchange = () => { if (this.value !== "selected") setSlot(E.select_Chestplate.value, T.Chestplate, true) }
	E.select_Leggings.onchange = () => { if (this.value !== "selected") setSlot(E.select_Leggings.value, T.Leggings, true) }
	E.select_Boots.onchange = () => { if (this.value !== "selected") setSlot(E.select_Boots.value, T.Boots, true) }
	E.select_Mainhand.onchange = () => { if (this.value !== "selected") setSlot(E.select_Mainhand.value, T.Mainhand, true) }
	E.select_Offhand.onchange = () => { if (this.value !== "selected") setSlot(E.select_Offhand.value, T.Offhand, true) }
	
	for (let x of ["guard","shielding","poise","inure","steadfast","second_wind","ethereal","reflexes","evasion","tempo","cloaked"]) (E[x] = document.getElementById(x)).onchange = updateStats;
	
	for (let x of ["helm_img", "chest_img", "legs_img", "feet_img", "main_img", "off_img"]) {
		(E[x] = document.getElementById(x)).onmouseover = hoverOn;
		E[x].onmouseout = hoverOff;
	}
	
	ids_mainhand = [T.Axe,T.Pickaxe,T["Mainhand Sword"],T.Trident,T.Mainhand,T.Snowball,T.Shovel,T["Mainhand Shield"],T.Scythe,T.Bow,T.Crossbow,T.Wand];
	ids_melee = [T.Axe,T["Mainhand Sword"],T.Trident,T.Scythe,T.Wand];
	ids_offhand = [T.Offhand,T["Offhand Shield"],T["Offhand Sword"]];
	ids_ranged = [T.Bow,T.Crossbow,T.Snowball];
}

window.onload = init;