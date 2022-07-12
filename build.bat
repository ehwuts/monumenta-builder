./fetch.sh
node parse_data.js
node sheet_to_json.js
browserify main.js -o docs/bundle.js