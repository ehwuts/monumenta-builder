./buildscripts/fetch.sh
node buildscripts/parse_data.js
node buildscripts/sheet_to_json.js
browserify src/web-main.js -o docs/bundle.js