var request = require("request");
var Promise = require("promise");
var ENDPOINT = "https://api.twitter.com/1.1/search/tweets.json";
var TOKEN = "3141113977-wQNUZmfPcLe4appyEGBKkNTQdt4X6LSPcGJeSet";
var Twitter = require('twitter');
var moment = require("moment")
var sentiment = require('sentiment');
var db = require("./db.js");
var client = new Twitter({
	consumer_key: 'qfsPHblfljde28BUXfkw27yzt',
	consumer_secret: 'khkTIvHNNDzAa82LerD1hwVI3UlGGwj6FxCmK1kiNXqzM9R8HV',
	bearer_token: "AAAAAAAAAAAAAAAAAAAAAGaFxgAAAAAAssgG3OH6MnngA1CWLHx%2Fqgtwhr8%3DcECQDHjctCNHTF3y1wjJVotHdIp0paTal2L6tawsEXGTamnEyZ"
});
var cities = {
	LA: {
		lat: "34.0522",
		lng: "-118.2437",
		name: "Los Angeles"
	},
	Boston: {
		lat: "42.3601",
		lng: "-71.0589",
		name: "Boston"
	},
  Chicago: {
    lat: "41.87811",
    lng: "-87.6298",
    name: "Chicago"
  },
  NY: {
    lat: "40.7128",
    lng: "-74.0059",
    name: "New York"
  },
  Seattle: {
    lat: "47.6062",
    lng: "-122.3321",
    name: "Seattle"
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
        db.metaStatus(res.headers["x-rate-limit-remaining"],res.headers["x-rate-limit-reset"]);
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
module.exports = {
	getCityTweets: getCityTweets,
	getCitySentiment: getCitySentiment,
	getCityData: getCityData,
	dataSweep: dataSweep
};
