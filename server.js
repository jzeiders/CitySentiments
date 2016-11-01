var express = require("express");
var request = require("request");
var Promise = require("promise");
var twitter = require("./helpers/twitter.js");
var db = require("./helpers/db.js");
var fileGen = require("./helpers/fileGen.js");
var app = express();


// twitter.get()
// twitter.getCityTweets("LA","Boston")
// fileGen.uploadCitiesJson();
// db.scoreJob();

app.get("/scores", function(req,res){
  db.getScores().then(function(data){
    res.send(data);
  }).catch(function(err) {
    res.send("Server Side Error");
  	console.log("FUCKING ERROR: ", err);
  });
});
app.listen(3000, function() {
  twitter.dataCollectionJob();
	console.log("started server");
});
