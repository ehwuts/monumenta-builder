const path_data_raw = "data/raw/Monumenta Item Spreadsheet v2.2.0 - Item Backend Data.csv";

const csv = require("csv-parser");
const fs = require("fs");
var results = [];
var headers;

const regex_percent = /^[+\-]?\d+(?:\.\d+)?%$/;

fs.createReadStream(path_data_raw)
	.pipe(csv({headers:false, columns: true}))
	.on("data", (data) => {
		//convert from objects keyed with column numbers to arrays
		let row = [];
		let length = Object.keys(data).length;
		for (let i = 0; i < length; i++) {
				//convert the relative percentage strings into magnitudes so that Number can parse them without turning into NaN
			if (data[i].match(regex_percent)) {
				data[i] = Number(data[i].slice(0,-1))/100;
			}
			row[i] = data[i];
		}
		//remove spreadsheet's indexing columns since the name collisions are problematic
		results.push(row.slice(0,-7));
	})
	.on("end", process);
	
function process() {
	//prune rows with an empty item name column
	results = results.filter(x=>x[1]);

	//store each row index in each row for later convenience since this data structure is scuffed and lazy
	let empty_first = true;
	for (let i = 0; i < results.length; i++) {
		if (results[i][0]) empty_first = false;
		break;
	}
	if (empty_first) {
		for (let i = 0; i < results.length; i++) {
			results[i][0] = i - 1;
		}
	} else {
		for (let i = 0; i < results.length; i++) {
			results[i].unshift(i - 1);
		}		
	}
	
	let headers = results.shift();	
	let data = {
		"headers": headers,
		"data": results
	};
	//fs.writeFileSync("data/data.json", JSON.stringify(data, null, "\t"));
	fs.writeFileSync("data/data.json", JSON.stringify(data));
	console.log("Items -", results.length);
}
