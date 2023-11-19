#!/usr/bin node

const levenshtein = require('js-levenshtein');

const data = require("./data/raw/MonumentaAPI - Advancements.json");

let keys = Object.keys(data);
for (let p of keys) {
	//console.log(p);
	if (data[p].display) {
		if (data[p].display.title.text && data[p].display.description.text) console.log(data[p].display.title.text.trim(), "\n", data[p].display.description.text.trim());
	}
}