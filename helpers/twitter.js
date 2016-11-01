var request = require("request");
var Promise = require("promise");
var ENDPOINT = "https://api.twitter.com/1.1/search/tweets.json";
var TOKEN = "3141113977-wQNUZmfPcLe4appyEGBKkNTQdt4X6LSPcGJeSet";
var Twitter = require('twitter');
var moment = require("moment")
var sentiment = require('sentiment');
var gju = require('geojson-utils');
var db = require("./db.js");
var fuzzy = require("fuzzzy");
// var client = new Twitter({
// 	consumer_key: 'qfsPHblfljde28BUXfkw27yzt',
// 	consumer_secret: 'khkTIvHNNDzAa82LerD1hwVI3UlGGwj6FxCmK1kiNXqzM9R8HV',
// 	bearer_token: "AAAAAAAAAAAAAAAAAAAAAGaFxgAAAAAAssgG3OH6MnngA1CWLHx%2Fqgtwhr8%3DcECQDHjctCNHTF3y1wjJVotHdIp0paTal2L6tawsEXGTamnEyZ"
// });
var client = new Twitter({
	consumer_key: 'qfsPHblfljde28BUXfkw27yzt',
	consumer_secret: 'khkTIvHNNDzAa82LerD1hwVI3UlGGwj6FxCmK1kiNXqzM9R8HV',
	access_token_key: '3141113977-wQNUZmfPcLe4appyEGBKkNTQdt4X6LSPcGJeSet',
	access_token_secret: 'W5m2rKae0PhKZ17TahXlQt1PiYMMb2eFVgqK5XsiqKsN5'
});
var cities = {
	LA: {
		lat: "34.0522",
		lng: "-118.2437",
		name: "Los Angeles",
		box: "-118.9448,32.8007,-117.6462,34.8233",
	},
	Boston: {
		lat: "42.3601",
		lng: "-71.0589",
		name: "Boston",
		box: "-71.1912,42.2279,-70.8085,42.3973"
	},
	Chicago: {
		lat: "41.87811",
		lng: "-87.6298",
		name: "Chicago",
		box: "-87.9395,41.6446,-87.5245,42.0229"
	},
	NY: {
		lat: "40.7128",
		lng: "-74.0059",
		name: "New York",
		box: "-74.2589,40.4774,-73.7004,40.9176"
	},
	Seattle: {
		lat: "47.6062",
		lng: "-122.3321",
		name: "Seattle",
		box: "-122.3603,47.5908,-122.3115,47.6186"
	}
};

var getCityTweets = function(cityFrom, cityTo) {
	return new Promise(
		function(resolve, reject) {
			client.get('search/tweets', {
				q: cities[cityTo].name,
				geocode: cities[cityFrom].lat + "," + cities[cityFrom].lng + ",10mi",
				count: 100
			}, function(error, tweets, res) {
				if (error)
					reject(error);
				db.metaStatus(res.headers["x-rate-limit-remaining"], res.headers["x-rate-limit-reset"]);
				resolve(tweets);
			});
		});
};
var getCitySentiment = function(cityFrom, cityTo) {
	return getCityTweets(cityFrom, cityTo).then(function(tweets) {
		return tweets.statuses.map(function(v) {
			return {
				time: moment(v.created_at, 'dd MMM DD HH:mm:ss ZZ YYYY', 'en').unix(),
				sentiment: sentiment(v.text).score
			};
		});
	});
};
var getCityData = function(cityFrom, cityTo) {
	return getCitySentiment(cityFrom, cityTo).then(function(sentiments) {
		return db.pushData(cityFrom, cityTo, sentiments);
	});
};
var dataSweep = function() {
	cityPromises = [];
	for (var city1 in cities) {
		if (cities.hasOwnProperty(city1)) {
			for (var city2 in cities) {
				if (cities.hasOwnProperty(city2)) {
					if (city1 != city2)
						cityPromises.push(getCityData(city1, city2));
				}
			}
		}
	}

	Promise.all(cityPromises).done(function(results) {
		db.setPullTime(moment().unix());
		console.log(results);
	});
};
var catalogAndStore = function(tweet) {
	var cityFrom = null,
		cityTo = null
	for (var key in cities) {
		city = cities[key];
		if (cities.hasOwnProperty(key)) {
			if (tweet.text.search(city.name) != -1) {
				cityTo = city;
			}
			if (checkIntersection(tweet, city)) {
				cityFrom = city;
			}
		}
	}
	if (cityFrom != null && cityTo != null && cityTo != cityFrom) {
		console.log("WE LOGGED A TWEET HOLY SHIT");
		db.pushData(cityFrom.name, cityTo.name, [{
			time: moment(tweet.created_at, 'dd MMM DD HH:mm:ss ZZ YYYY', 'en').unix(),
			sentiment: sentiment(tweet.text).score,
      text: tweet.text
		}])
	}
}
var boundingBoxes = function() {
	locations = ""
	for (var key in cities) {
		city = cities[key];
		if (cities.hasOwnProperty(key)) {
			locations = locations + city.box + ","
		}
	}
	return locations.slice(0,locations.length-1)
}
var checkIntersection = function(tweet, city) {
	var tweetBound = tweet.place.bounding_box;
	if (gju.pointInPolygon({
			"type": "Point",
			"coordinates": [city.lng, city.lat]
		}, tweetBound) != false) {
		return true;
	}
	return false;
};
var openStream = function() {
	client.stream('statuses/filter', {
		locations: boundingBoxes()
	}, function(stream) {
		console.log("Opened Stream");
		stream.on('data', function(tweet) {
			catalogAndStore(tweet, city)
		});

		stream.on('error', function(error) {
			console.log(error);
		});
	});
}
var dataCollectionJob = function() {
	openStream();
	console.log("Opened streams");
}
module.exports = {
	getCityTweets: getCityTweets,
	getCitySentiment: getCitySentiment,
	getCityData: getCityData,
	dataSweep: dataSweep,
	dataCollectionJob: dataCollectionJob
};
