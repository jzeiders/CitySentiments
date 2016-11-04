var db = require("./db.js");
var fs = require("fs")
var generateArcs = function() {
	var arcs = {
		type: "FeatureCollection",
		features: []
	};
	db.getScores().then(function(scores) {
		db.getCityData().then(function(cities) {
			for (var i = 0; i < cities.length; i++) {
				var cityFrom = cities[i].key;
        console.log("CityFromData");
        console.log(scores[cityFrom])
				for (var cityTo in scores[cityFrom]) {
					if (scores[cityFrom].hasOwnProperty(cityTo)) {
						var cityToData = cities.filter(function(v) {
							if (v.key == cityTo) return true;
							return false;
						});
            console.log(ctyToData);
						arcs.features.push({
							type: "LineString",
							coordinates: [
								[cities[i].lng, cities[i].lat],
								[cityToData[0].lng, cityToData[0].lat]
							],
							score: scores[cityFrom][cityTo]
						});
					}
				}
			}
      arcs = JSON.stringify(arcs);
      fs.writeFile("./www/arcs.json",arcs);
      console.log(arcs);
		});
	});
};
var uploadCitiesJson = function() {
	fs.readFile("./www/cities.json", function(err, json) {
		var cities = JSON.parse(json);
		db.writeCityData(cities);
	});
};
module.exports = {
	generateArcs: generateArcs, // Produces JSON file of Arcs from Scores
	uploadCitiesJson: uploadCitiesJson // Push cities.json to firebase
}
