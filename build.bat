./util/fetch.sh
node util/parse_data.js
node util/sheet_to_json.js
browserify web/main.js -o docs/bundle.js