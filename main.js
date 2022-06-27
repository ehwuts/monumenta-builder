const data = require("./data/data.json");

function randInt(a, b = 0) {
	return Math.floor(Math.random() * Math.max(a, b)) + Math.min(a, b);
}

function getIndexFromHeader(x) {
	for (let headers = data.headers, i = headers.length; i > 0;) {
		i--;
		if (headers[i] === x) return i;
	}
	return -1;
}

function getIndexFromColumnValue(v, c) {
	for (let d = data.data, i = d.length; i > 0;) {
		i--;
		if (d[c][i] === v) return i;
	}
	return -1;
}
	
function getImageFromType(x) {
	switch (x) {
		case "Helmet":
		case "Chestplate":
		case "Leggings":
		case "Boots":
			return x;
		default:
			if (x.startsWith("Offhand")) {
				return "Offhand";
			}
			if (x.startsWith("Mainhand")) {
				return "Mainhand";
			}
			return "Unknown";
	}
}

let index = {};
let summables =
["Armor","Agility","Riptide","Shielding","Poise","Inure","Steadfast","Ethereal ","Reflexes ","Evasion","Tempo ","Adaptability","Melee Prot.","Projectile Prot.","Magic Prot.","Blast Prot.","Fire Prot.","Feather Falling","Max Health","Max Health %","Regen","Life Drain","Sustenance","Anemia","Speed","Speed %","Adrenaline","Crippling","Attack Damage","Attack Speed","Attack Speed %","Magic Damage","Proj Damage","Proj Speed","Knockback Res.","Thorns","Thorns Damage","Abyssal","Gills","Respiration","Aqua Affinity","Depth Strider","Riptide","Inferno","Second Wind","Regicide","Aptitude","Retrieval","Intuition","Radiant","Darksight","Weightless","Triage","Soul Speed","Void Tether","Resurrection","Ineptitude","Two Handed","Corruption","Arcane Thrust","Rage of the Keter","Protection of the Depths","Persistence","Ashes of Eternity"];
summables.forEach((x) => {index[x] = getIndexFromHeader(x)});
let mainhandables = ["Base Spell Power","Base Attack Damage","Base Attack Speed","Base Proj Damage","Base Proj Speed","Base Throw Rate","Smite","Slayer","Duelist","Fire Aspect (M)","Ice Aspect (M)","Thunder Aspect (M)","Knockback","Sweeping Edge","Decay","Hex Eater","Bleeding","Chaotic","Quake","Looting","Sniper","Point Blank","Fire Aspect (P)","Ice Aspect (P)","Thunder Aspect (P)","Punch","Infinity (bow)","Quick Charge","Piercing","Multishot","Recoil","Efficiency","Sapper","Eruption","Multitool","Fortune","Silk Touch","Lure","Infinity (tool)","Shrapnel"];
mainhandables.forEach((x) => {index[x] = getIndexFromHeader(x)});
["Name","Type","Region","Base Item","Weapon Base Stats","Vanishing","Unbreaking","Mending","Unbreakable","Irreparability"].forEach((x) => {index[x] = getIndexFromHeader(x)});

let filter = {};

filter.Valley = (x) => x[index.Region] === "Valley";
filter.Isles = (x) => x[index.Region] === "Isles";

filter.Helmets = (x) => x[index.Type] === "Helmet";
filter.Chestplates = (x) => x[index.Type] === "Chestplate";
filter.Leggings = (x) => x[index.Type] === "Leggings";
filter.Boots = (x) => x[index.Type] === "Boots";

filter.Wands = (x) => x[index.Type] === "Wand";
filter.Ranged = (x) => x[index.Type] === "Throwable" || x[index.Type] === "Crossbow" || x[index.Type] === "Bow" || (x[index.Type] == "Trident" && !x[index.Riptide]);
filter.Melee = (x) => x[index.Type] === "Axe" || x[index.Type] === "Scythe" || x[index.Type].startsWith("Mainhand");
filter.Mainhand_Swords = (x) => x[index.Type] === "Mainhand Sword" || (x[index.Type] === "Wand" && x[index["Base Item"]].includes("Sword"));
filter.Mainhands = (x) => filter.Wands(x) || filter.Ranged(x) || filter.Melee(x);

filter.Offhands = (x) => x[index.Type].startsWith("Offhand");
filter.Offhand_Swords = (x) => x[index.Type] === "Offhand Sword";
filter.Offhand_Shields = (x) => x[index.Type] === "Offhand Shield";
filter.Offhand_Not_Shield = (x) => filter.Offhands(x) && ! filter.Offhand_Shields(x);

let helmets = data.data.filter(filter.Helmets);
let chestplates = data.data.filter(filter.Chestplates);
let leggings = data.data.filter(filter.Leggings);
let boots = data.data.filter(filter.Boots);

let wands = data.data.filter(filter.Wands);
let ranged = data.data.filter(filter.Ranged);
let melees = data.data.filter(filter.Melee);
let mainhand_sword =  data.data.filter(filter.Mainhand_Swords);
let offhands = data.data.filter(filter.Offhands);
let offhand_swords = data.data.filter(filter.Offhand_Swords);
let offhand_notshield = data.data.filter(filter.Offhand_Not_Shield);

let toggles = {
	"Helmets": 1,
	"Chestplates": 1,
	"Leggings": 1,
	"Boots": 1,
	"Wands": 1,
	"Ranged": 1,
	"Melee": 1,
	"Offhands": 1,
	"Valley": 1,
	"Isles": 1
}

let togglebox = document.getElementById("toggles");
for (x in toggles) {
	let e = document.createElement("label");
	e.className = "toggle-wrap";
	e.innerHTML = '<input type="checkbox"'+(toggles[x]?' checked="checked"':"")+' class="toggle-check" value="'+x+'"><div class="toggle-content">' + x + '</div>';
	e.firstChild.onclick = (E) => {toggleContent(E)};
	togglebox.appendChild(e);
};

function toggleContent(e) {
	let x = e.target.value;
	toggles[x] = !toggles[x];
	
	let items = document.getElementById("options").children;	
	for (let i = 0; i < items.length; i++) {
		console.log(items[i].id.substring(4));
		items[i].className = (false) ? "item" : "item hide";
	}
}

let itemlist = document.getElementById("options");
for (let items = data.data, i = items.length; i > 0;) {
	i--;
	
	let e = document.createElement("span");
	e.className = "item";
	e.id = "item" + i;
	e.onclick = () => {equipItem(i)};
	let img = getImageFromType(items[i][index.Type]);
	e.innerHTML = "<img src='" + img + ".png' alt='" + img + "'> " + items[i][index.Name];
	
	itemlist.appendChild(e);
}

function equipItem(i) {
	let item = (i|0) == i ? data.data[i|0] : getIndexFromColumnValue(i, index.Name);
	if (!item) return;
	
	if (filter.Helmets(item)) equipped.Helmet = item[0];
	else if (filter.Chestplates(item)) equipped.Chestplate = item[0];
	else if (filter.Leggings(item)) equipped.Leggings = item[0];
	else if (filter.Boots(item)) equipped.Boots = item[0];
	else if (filter.Mainhands(item)) equipped.Mainhand = item[0];
	else if (filter.Offhands(item)) equipped.Offhand = item[0];
	else {
		equipped.Mainhand = item[0];
		console.log("Warning: Defaulting to mainhand slot equipping " + i[index.Name]);
	}
	
	updateEquipped();
}


var equipped = {
	"Helmet": getIndexFromColumnValue("King's Crown", index.Name),
	"Chestplate": getIndexFromColumnValue("King's Warden", index.Name),
	"Leggings": getIndexFromColumnValue("King's Greaves", index.Name),
	"Boots": getIndexFromColumnValue("King's Sabatons", index.Name),
	"Mainhand": getIndexFromColumnValue("Elemental Wrath", index.Name),
	"Offhand": getIndexFromColumnValue("Kingslayer", index.Name)
}

function equip_random(region = randInt(2), mainhand = randInt(4)) {	
	let regioned = data.data.filter(region ? filter.Valley : filter.Isles);
	
	let helmets = regioned.filter(filter.Helmets);
	let chestplates = regioned.filter(filter.Chestplates);
	let leggings = regioned.filter(filter.Leggings);
	let boots = regioned.filter(filter.Boots);

	let mainhands = regioned.filter([filter.Wands, filter.Ranged, filter.Melee, filter.Mainhand_Swords][mainhand]);
	let offhands = regioned.filter([filter.Offhands, filter.Offhand_Not_Shield, filter.Offhands, filter.Offhand_Swords][mainhand]);

	equipped.Helmet = helmets[randInt(helmets.length)][0];
	equipped.Chestplate = chestplates[randInt(chestplates.length)][0];
	equipped.Leggings = leggings[randInt(leggings.length)][0];
	equipped.Boots = boots[randInt(boots.length)][0];
	equipped.Mainhand = mainhands[randInt(mainhands.length)][0];
	equipped.Offhand = offhands[randInt(offhands.length)][0];
	
	updateEquipped();
}

function updateEquipped() {
	function slotline(e) {
		let name = e[index.Name];
		let type = e[index["Base Item"]];
		let mending = e[index.Mending];
		let unbreakable = e[index.Unbreakable];
		let unbreaking = e[index.unbreaking];
		let irreparability = e[index.Irreparability];
		
		let sturdiness = "";
		if (unbreaking) sturdiness += "Unbreaking " + unbreaking + " ";
		if (mending) sturdiness += "Mending ";
		if (unbreakable) sturdiness += "Unbreakable ";
		if (irreparability) sturdiness += "Irreparability ";
		
		return name + " - " + sturdiness + type;
	}
	
	document.getElementById("bhead").innerText = slotline(data.data[equipped.Helmet]);
	document.getElementById("bches").innerText = slotline(data.data[equipped.Chestplate]);
	document.getElementById("blegs").innerText = slotline(data.data[equipped.Leggings]);
	document.getElementById("bfeet").innerText = slotline(data.data[equipped.Boots]);
	document.getElementById("bmain").innerText = slotline(data.data[equipped.Mainhand]);
	document.getElementById("boffh").innerText = slotline(data.data[equipped.Offhand]);
	
	let newtext = "";
	
	mainhandables.forEach((x) => {
		let v = data.data[equipped.Mainhand][index[x]];
		if (v) newtext += v + " " + x + "\n";
	});
	newtext += "\n";
	
	summables.forEach((x) => {
		let total = 0;
		//if (x.includes("Speed")) console.log(x,data.data[equipped.Helmet][index[x]],data.data[equipped.Chestplate][index[x]],data.data[equipped.Leggings][index[x]],data.data[equipped.Boots][index[x]],data.data[equipped.Mainhand][index[x]],data.data[equipped.Offhand][index[x]]);
		if (data.data[equipped.Helmet][index[x]]) total += Number(data.data[equipped.Helmet][index[x]]);
		if (data.data[equipped.Chestplate][index[x]]) total += Number(data.data[equipped.Chestplate][index[x]]);
		if (data.data[equipped.Leggings][index[x]]) total += Number(data.data[equipped.Leggings][index[x]]);
		if (data.data[equipped.Boots][index[x]]) total += Number(data.data[equipped.Boots][index[x]]);
		if (data.data[equipped.Mainhand][index[x]]) total += Number(data.data[equipped.Mainhand][index[x]]);
		if (data.data[equipped.Offhand][index[x]]) total += Number(data.data[equipped.Offhand][index[x]]);
		
		if (total) newtext += total + " " + x + "\n";
	});
	
	document.getElementById("build_summary").innerText = newtext;
}

equip_random();

//window.addEventListener("onload", init);