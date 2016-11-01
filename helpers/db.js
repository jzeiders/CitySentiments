var firebase = require("firebase");
var config = {
	apiKey: "AIzaSyB6B8bcFMZ9cO5kvx4PEexvOf7zCo2mXzc",
	authDomain: "citysentiment.firebaseapp.com",
	databaseURL: "https://citysentiment.firebaseio.com",
	storageBucket: "citysentiment.appspot.com",
	messagingSenderId: "232201582702"
};
firebase.initializeApp(config);
var pushData = function(cityFrom, cityTo, sentiments) {
	var ref = firebase.database().ref("rawData/" + cityFrom + "/" + cityTo);
	return new Promise(function(resolve, reject) {
		ref.orderByKey().limitToLast(10).once("value", function(data) {
			data.forEach(function(v) {
				for (var i = 0; i < sentiments.length; i++) {
					if (v.key === sentiments[i].time) {
						delete sentiments[i];
						break;
					}
				}
			});
			var updateObj = {};
			for (var i = 0; i < sentiments.length; i++) {
				updateObj[sentiments[i].time] = {
          score: sentiments[i].sentiment,
          text: sentiments[i].text
        };
					// ref.child(sentiments[i].time).set(sentiments[i].sentiment);
			}
			ref.update(updateObj);
			resolve("Success");
		}, function(err) {
			reject(err);
		});
	});
};
var metaStatus = function(limit, time) {
	firebase.database().ref("meta").update({
		callsRemaining: limit,
		resetTime: time
	});
};
var setPullTime = function(time) {
	firebase.database().ref("meta").update({
		lastPull: time
	});
};
var writeCityData = function(data) {
	firebase.database().ref("cities").update(data);
};
var getCityData = function(data) {
	return new Promise(function(resolve, reject) {
		firebase.database().ref("cities").once("value", function(data) {
			var cities = data.val().features;
			var out = cities.map(function(v) {
				return v.properties;
			});
      resolve(out);
		}, function(err){
      reject(err)
    });
	});
};

//Recalculates Scores when Raw_Data is added;
var scoreJob = function() {
	var ref = firebase.database().ref("rawData");
	var scores = {};
	ref.on("value", function(data) {
		data.forEach(function(cityFrom) {
			scores[cityFrom.key] = {};
			cityFrom.forEach(function(cityTo) {
				scores[cityFrom.key][cityTo.key] = 0;
				var count = 0;
				cityTo.forEach(function(score) {
					scores[cityFrom.key][cityTo.key] += score.val();
					if (score.val() !== 0) // Average Ignores values that are 0
						count++;
				});
				scores[cityFrom.key][cityTo.key] /= count;
			});
		});
		firebase.database().ref("scores").set(scores);
		console.log("Calculated Scores");
	});
};
//Returns the Scores Object from firebase
var getScores = function() {
	var ref = firebase.database().ref("scores");
	return new Promise(function(resolve, reject) {
		ref.once("value", function(data) {
			resolve(data.val());
		}, function(err) {
			reject(err);
		});
	});
};

module.exports = {
	pushData: pushData, //Adds raw data to (cityFrom,cityTo)
	getScores: getScores, //Returns the Scores Object from firebase
	scoreJob: scoreJob, //Calcs Scores When Data is Added
	setPullTime: setPullTime, // Sets Pull Time
	metaStatus: metaStatus, //Sets API Limit && Reset Time
	writeCityData: writeCityData, //Pushes Object to firebase cities list
	getCityData: getCityData // Gets Cities Data from firebase
};
