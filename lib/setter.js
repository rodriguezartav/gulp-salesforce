var config = {}

function set(key, value){
 config[key] = value;
}

function get(key){
 return config[key];
}

module.exports = {
	set: set,
	get: get
}