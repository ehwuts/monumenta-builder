
function randInt(a, b = 0) {
	return Math.floor(Math.random() * Math.max(a, b)) + Math.min(a, b);
}

module.exports = { randInt }